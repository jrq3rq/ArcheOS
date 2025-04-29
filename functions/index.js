console.log("Loading index.js...");
console.log("Requiring dotenv...");
require("dotenv").config();
console.log("Requiring firebase-functions...");
const functions = require("firebase-functions");
console.log("Requiring node-fetch...");
const fetch = require("node-fetch");
console.log("Requiring role-presets...");
const rolePrompts = require("./prompts/role-presets");

console.log("Setting API keys...");
const GROK_API_URL = process.env.GROK_API_URL;
const GROK_API_KEY = process.env.GROK_API_KEY;

console.log("Defining healthCheck function...");
exports.healthCheck = functions.https.onRequest((req, res) => {
  console.log("Inside healthCheck function...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for healthCheck...");
    return res.status(200).send();
  }

  console.log("Sending healthCheck response...");
  res.status(200).json({ status: "ok" });
});

console.log("Defining chatbot function...");
exports.chatbot = functions.https.onRequest(async (req, res) => {
  console.log("Inside chatbot function...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request...");
    return res.status(200).send();
  }

  const { message, roleId } = req.body;
  console.log("Received request:", { message, roleId });

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    console.log("Invalid message detected");
    return res.status(400).json({ reply: "Please provide a valid message." });
  }

  const rolePrompt = rolePrompts[roleId] || rolePrompts.archeos;
  if (!rolePrompt) {
    console.log("Invalid roleId detected");
    return res.status(400).json({ reply: "Invalid role selected." });
  }

  try {
    console.log("Making Grok API call...");
    const response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROK_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "grok-beta",
        temperature: 0.4,
        messages: [
          { role: "system", content: rolePrompt },
          { role: "user", content: message.trim() },
        ],
      }),
    });

    console.log("Grok API response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      console.log("Grok API response received");

      let reply = "No response.";
      if (data && data.choices && data.choices[0]?.message?.content) {
        reply = data.choices[0].message.content;
      } else {
        console.log("Unexpected response format");
      }

      console.log("Sending successful response");
      return res.json({ reply });
    } else {
      const errorText = await response.text();
      console.log(`Grok API error: ${errorText}`);
      return res.status(500).json({ reply: "Unable to contact AI agent." });
    }
  } catch (error) {
    console.log(`Grok API fetch error: ${error.message}`);
    return res.status(500).json({ reply: "Unable to contact AI agent." });
  }
});