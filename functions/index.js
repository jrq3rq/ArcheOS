// console.log("Loading index.js...");
// console.log("Requiring dotenv...");
// require("dotenv").config();
// console.log("Requiring firebase-functions...");
// const functions = require("firebase-functions");
// console.log("Requiring node-fetch...");
// const fetch = require("node-fetch");
// console.log("Requiring role-presets...");
// const rolePrompts = require("./prompts/role-presets");

// console.log("Setting API keys...");
// const GROK_API_URL = process.env.GROK_API_URL;
// const GROK_API_KEY = process.env.GROK_API_KEY;

// console.log("Defining healthCheck function...");
// exports.healthCheck = functions.https.onRequest((req, res) => {
//   console.log("Inside healthCheck function...");
//   res.set("Access-Control-Allow-Origin", "*");
//   res.set("Access-Control-Allow-Methods", "GET");
//   res.set("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") {
//     console.log("Handling OPTIONS request for healthCheck...");
//     return res.status(200).send();
//   }

//   console.log("Sending healthCheck response...");
//   res.status(200).json({ status: "ok" });
// });

// console.log("Defining chatbot function...");
// exports.chatbot = functions.https.onRequest(async (req, res) => {
//   console.log("Inside chatbot function...");
//   res.set("Access-Control-Allow-Origin", "*");
//   res.set("Access-Control-Allow-Methods", "POST");
//   res.set("Access-Control-Allow-Headers", "Content-Type");

//   if (req.method === "OPTIONS") {
//     console.log("Handling OPTIONS request...");
//     return res.status(200).send();
//   }

//   const { message, roleId } = req.body;
//   console.log("Received request:", { message, roleId });

//   if (!message || typeof message !== "string" || message.trim().length === 0) {
//     console.log("Invalid message detected");
//     return res.status(400).json({ reply: "Please provide a valid message." });
//   }

//   const rolePrompt = rolePrompts[roleId] || rolePrompts.archeos;
//   if (!rolePrompt) {
//     console.log("Invalid roleId detected");
//     return res.status(400).json({ reply: "Invalid role selected." });
//   }

//   try {
//     console.log("Making Grok API call...");
//     const response = await fetch(GROK_API_URL, {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${GROK_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "grok-beta",
//         temperature: 0.4,
//         messages: [
//           { role: "system", content: rolePrompt },
//           { role: "user", content: message.trim() },
//         ],
//       }),
//     });

//     console.log("Grok API response status:", response.status);

//     if (response.ok) {
//       const data = await response.json();
//       console.log("Grok API response received");

//       let reply = "No response.";
//       if (data && data.choices && data.choices[0]?.message?.content) {
//         reply = data.choices[0].message.content;
//       } else {
//         console.log("Unexpected response format");
//       }

//       console.log("Sending successful response");
//       return res.json({ reply });
//     } else {
//       const errorText = await response.text();
//       console.log(`Grok API error: ${errorText}`);
//       return res.status(500).json({ reply: "Unable to contact AI agent." });
//     }
//   } catch (error) {
//     console.log(`Grok API fetch error: ${error.message}`);
//     return res.status(500).json({ reply: "Unable to contact AI agent." });
//   }
// });
console.log("Loading index.js at", new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
console.log("Requiring plugins...");
require("dotenv").config();
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const fs = require("fs").promises;

console.log("Requiring prompts...");
const rolePrompts = require("./prompts/role-presets");
const questionPrompts = require("./prompts/question-guide-presets");

console.log("Setting API keys...");
const GROK_API_URL = process.env.GROK_API_URL;
const GROK_API_KEY = process.env.GROK_API_KEY;

// Health Check Endpoint
console.log("Defining healthCheck endpoint...");
exports.healthCheck = functions.https.onRequest((req, res) => {
  console.log("Inside healthCheck endpoint...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "GET");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for healthCheck...");
    return res.status(200).send();
  }

  console.log("Sending healthCheck response...");
  res.status(200).json({ status: "ok", timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }) });
});

// Chatbot Endpoint (No authentication to match original behavior)
console.log("Defining chatbot endpoint...");
exports.chatbot = functions.https.onRequest(async (req, res) => {
  console.log("Inside chatbot endpoint...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for chatbot...");
    return res.status(200).send();
  }

  const { message, roleId } = req.body;
  console.log("Received chatbot request:", { message, roleId });

  if (!message || typeof message !== "string" || message.trim().length === 0) {
    console.log("Invalid message detected");
    return res.status(400).json({ reply: "Please provide a valid message." });
  }

  const rolePrompt = rolePrompts[roleId] || rolePrompts.archeos; // Keep original default
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

      console.log("Sending successful chatbot response");
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

// Onboarding Endpoint (No authentication for now)
console.log("Defining onboarding endpoint...");
exports.onboarding = functions.https.onRequest(async (req, res) => {
  console.log("Inside onboarding endpoint...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for onboarding...");
    return res.status(200).send();
  }

  const { step, context } = req.body;
  console.log("Received onboarding request:", { step, context });

  const prompt = questionPrompts[step] || questionPrompts.business_strategy;
  if (!prompt) {
    console.log("Invalid step detected");
    return res.status(400).json({ question: "Invalid onboarding step." });
  }

  try {
    console.log("Making Grok API call for question...");
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
          { role: "system", content: prompt },
          { role: "user", content: JSON.stringify(context) },
        ],
      }),
    });

    console.log("Grok API response status:", response.status);

    if (response.ok) {
      const data = await response.json();
      let question = "What is your main business goal?";
      let options = null;
      if (data && data.choices && data.choices[0]?.message?.content) {
        const content = data.choices[0].message.content;
        if (content.includes("Options:")) {
          const [q, opts] = content.split("Options:");
          question = q.trim();
          options = opts.split(",").map(opt => opt.trim());
        } else {
          question = content;
        }
      } else {
        console.log("Unexpected question response format");
      }

      console.log("Sending question response");
      return res.json({ question, options });
    } else {
      const errorText = await response.text();
      console.log(`Grok API error: ${errorText}`);
      return res.status(500).json({ question: "Unable to generate question." });
    }
  } catch (error) {
    console.log(`Grok API fetch error: ${error.message}`);
    return res.status(500).json({ question: "Unable to generate question." });
  }
});

// Save Config Endpoint (No authentication for now)
console.log("Defining save-config endpoint...");
exports.saveConfig = functions.https.onRequest(async (req, res) => {
  console.log("Inside saveConfig endpoint...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for saveConfig...");
    return res.status(200).send();
  }

  const { context } = req.body;
  console.log("Received save-config request:", { context });

  if (!context || typeof context !== "object") {
    console.log("Invalid context detected");
    return res.status(400).json({ message: "Invalid context provided." });
  }

  try {
    const config = {
      industry: "general",
      agents: [],
      integrations: {},
      features: {}
    };

    // Basic rule-based mapping
    const answers = Object.entries(context).map(([step, answer]) => ({
      step,
      answer: answer.toLowerCase()
    }));

    const businessStrategy = answers.find(a => a.step === "business_strategy")?.answer || "";
    const industryMatch = businessStrategy.match(/industry: (\w+)/i);
    if (industryMatch) config.industry = industryMatch[1];
    if (businessStrategy.includes("grow") || businessStrategy.includes("scale")) {
      config.agents.push("strategist");
    }

    const operationalEfficiency = answers.find(a => a.step === "operational_efficiency")?.answer || "";
    if (operationalEfficiency.includes("automate") || operationalEfficiency.includes("streamline")) {
      config.agents.push("coordinator");
    }

    const technicalInfrastructure = answers.find(a => a.step === "technical_infrastructure")?.answer || "";
    if (technicalInfrastructure.includes("cloud")) config.integrations.cloud = true;
    if (technicalInfrastructure.includes("crm")) config.integrations.crm = true;
    if (technicalInfrastructure.includes("slack")) config.integrations.slack = true;

    const complianceEthics = answers.find(a => a.step === "compliance_ethics")?.answer || "";
    if (complianceEthics.includes("privacy") || complianceEthics.includes("data")) {
      config.agents.push("compliance");
    }

    const marketingGrowth = answers.find(a => a.step === "marketing_growth")?.answer || "";
    if (marketingGrowth.includes("promot") || marketingGrowth.includes("market")) {
      config.agents.push("marketer");
    }
    if (marketingGrowth.includes("community") || marketingGrowth.includes("engage")) {
      config.agents.push("engager");
    }

    const financialOptimization = answers.find(a => a.step === "financial_optimization")?.answer || "";
    if (financialOptimization.includes("revenue") || financialOptimization.includes("monetize")) {
      config.agents.push("optimizer");
    }

    const systemSupport = answers.find(a => a.step === "system_support")?.answer || "";
    if (systemSupport.includes("monitor")) config.features.monitoring = true;
    if (systemSupport.includes("scal")) config.features.scalability = true;

    console.log("Saving config to config.json...");
    await fs.writeFile("config.json", JSON.stringify(config, null, 2));

    console.log("Configuration saved successfully");
    return res.status(200).json({ message: "Configuration saved" });
  } catch (err) {
    console.error("Config save error:", err.message);
    return res.status(500).json({ message: "Failed to save configuration" });
  }
});

// Save Feedback Endpoint (No authentication for now)
console.log("Defining save-feedback endpoint...");
exports.saveFeedback = functions.https.onRequest(async (req, res) => {
  console.log("Inside saveFeedback endpoint...");
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    console.log("Handling OPTIONS request for saveFeedback...");
    return res.status(200).send();
  }

  const { feedback, context } = req.body;
  console.log("Received feedback request:", { feedback, context });

  try {
    const logEntry = {
      feedback,
      context,
      timestamp: new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })
    };

    console.log("Saving feedback to feedback.json...");
    let existingLogs = [];
    try {
      const data = await fs.readFile("feedback.json");
      existingLogs = JSON.parse(data);
    } catch (err) {
      console.log("No existing feedback log found, creating new one");
    }
    existingLogs.push(logEntry);
    await fs.writeFile("feedback.json", JSON.stringify(existingLogs, null, 2));

    console.log("Feedback logged successfully");
    return res.status(200).json({ message: "Feedback saved" });
  } catch (err) {
    console.error("Feedback save error:", err.message);
    return res.status(500).json({ message: "Failed to save feedback" });
  }
});