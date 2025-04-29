console.log("chatbot.js loaded successfully");

// Store chat history
let chatHistory = [];

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  const output = document.getElementById("output");
  if (output) {
    console.log("Output element found, setting static message");
    output.textContent = "Static message: Connection Established.";
  } else {
    console.error("Output element not found");
  }

  const sendButton = document.getElementById("sendButton");
  if (sendButton) {
    console.log("Send button found, adding event listener");
    sendButton.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Send button clicked, calling sendMessage");
      sendMessage();
    });
  } else {
    console.error("Send button not found");
  }

  const downloadButton = document.getElementById("downloadButton");
  if (downloadButton) {
    console.log("Download button found, adding event listener");
    downloadButton.addEventListener("click", function () {
      console.log("Download button clicked, generating report card");
      downloadReportCard();
    });
  } else {
    console.error("Download button not found");
  }
});

// Function to strip markdown and preserve structure
function stripMarkdown(text) {
  // Remove ** for bold, keep the text inside
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  // Remove - or * at the start of lines (for unordered lists), keep the text
  text = text.replace(/^\s*[-*]\s+/gm, '');
  // Remove extra newlines for cleaner spacing
  text = text.replace(/\n{2,}/g, '\n\n');
  return text.trim();
}

// Function to generate and download the report card
function downloadReportCard() {
  if (chatHistory.length === 0) {
    alert("No chat history available to generate a report card.");
    return;
  }

  // Generate the report card content
  let reportContent = "ArcheOS Chatbot Report Card\n";
  reportContent += "=========================\n\n";
  chatHistory.forEach((entry, index) => {
    reportContent += `Interaction ${index + 1}:\n`;
    reportContent += `User Message: ${entry.input}\n`;
    reportContent += `Role: ${entry.role}\n`;
    reportContent += `Response: ${entry.response}\n`;
    reportContent += "-------------------------\n\n";
  });
  reportContent += `Generated on: ${new Date().toLocaleString()}\n`;

  // Create a Blob with the report content
  const blob = new Blob([reportContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  // Create a temporary link to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.download = "ArcheOS_Chatbot_Report_Card.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log("Report card downloaded");
}

async function sendMessage() {
  const input = document.getElementById("input").value.trim();
  const role = document.getElementById("role").value;
  const output = document.getElementById("output");

  console.log("sendMessage called with:", { input, role });

  if (!input) {
    console.log("No input provided");
    output.innerHTML = "<em style='color: #e74c3c'>Please enter a message.</em>";
    return;
  }

  output.innerHTML = "<em>Connecting to ArcheOS...</em>";
  console.log("Set output to 'Connecting...'");

  const endpoint = "http://127.0.0.1:5001/archeos-1/us-central1/chatbot";
  console.log("Using endpoint:", endpoint);

  try {
    console.log("Sending fetch request with body:", JSON.stringify({ message: input, roleId: role }));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input, roleId: role }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    console.log("Fetch response status:", res.status, "ok:", res.ok);
    console.log("Fetch response headers:", [...res.headers.entries()]);

    if (!res.ok) {
      const errorText = await res.text();
      console.log("Fetch failed with response:", errorText);
      output.innerHTML = `<em style='color: #e74c3c'>Error: ${errorText}</em>`;
      return;
    }

    let data;
    try {
      data = await res.json();
      console.log("Parsed response data:", data);
    } catch (jsonError) {
      console.error("Failed to parse JSON response:", jsonError);
      output.innerHTML = `<em style='color: #e74c3c'>Error: Failed to parse server response.</em>`;
      return;
    }

    if (data && typeof data.reply === "string") {
      // Strip markdown before rendering
      const formattedText = stripMarkdown(data.reply);
      console.log("Setting output to formatted reply:", formattedText);
      output.textContent = formattedText;

      // Add to chat history
      chatHistory.push({
        input: input,
        role: role,
        response: formattedText
      });
    } else {
      console.log("No valid reply in response data:", data);
      output.textContent = "No response received.";
    }
  } catch (err) {
    console.error("Fetch or network error:", err.message);
    output.innerHTML = `<em style='color: #e74c3c'>Network error: ${err.message}</em>`;
  } finally {
    document.getElementById("input").value = "";
    console.log("Cleared input field");
  }
}