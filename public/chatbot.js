console.log("chatbot.js loaded successfully at", new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));

// Store chat history and onboarding state
let chatHistory = [];
let onboardingActive = false;
let currentStep = null;
let onboardingContext = {};

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  const output = document.getElementById("output");
  const roleSelect = document.getElementById("role");
  const input = document.getElementById("input");
  const sendButton = document.getElementById("sendButton");
  const downloadButton = document.getElementById("downloadButton");
  const configureButton = document.getElementById("configureButton");
  const exitConfigButton = document.getElementById("exitConfigButton");
  const progress = document.getElementById("progress");
  const chatContainer = document.querySelector(".chat-container");

  if (output) {
    console.log("Output element found, setting static message");
    output.textContent = "Static message: Connection Established.";
  } else {
    console.error("Output element not found");
  }

  if (sendButton) {
    console.log("Send button found, adding event listener");
    sendButton.addEventListener("click", function (event) {
      event.preventDefault();
      console.log("Send button clicked");
      if (onboardingActive) {
        handleOnboardingResponse();
      } else {
        sendMessage();
      }
    });
  } else {
    console.error("Send button not found");
  }

  if (downloadButton) {
    console.log("Download button found, adding event listener");
    downloadButton.addEventListener("click", function () {
      console.log("Download button clicked, generating report card");
      downloadReportCard();
    });
  } else {
    console.error("Download button not found");
  }

  if (configureButton) {
    console.log("Configure button found, adding event listener");
    configureButton.addEventListener("click", function () {
      console.log("Configure button clicked, starting onboarding");
      startOnboarding();
    });
  } else {
    console.error("Configure button not found");
  }

  if (exitConfigButton) {
    console.log("Exit config button found, adding event listener");
    exitConfigButton.addEventListener("click", function () {
      console.log("Exit config button clicked, exiting onboarding");
      exitOnboarding();
    });
  } else {
    console.error("Exit config button not found");
  }

  // Enable/disable send button based on input
  if (roleSelect && input && sendButton) {
    input.addEventListener("input", () => {
      sendButton.disabled = !input.value.trim();
    });
  }
});

// Start onboarding
async function startOnboarding() {
  onboardingActive = true;
  const savedState = localStorage.getItem("onboardingState");
  if (savedState) {
    const { step, context } = JSON.parse(savedState);
    currentStep = step;
    onboardingContext = context;
  } else {
    currentStep = "business_strategy";
    onboardingContext = {};
  }
  document.getElementById("role").disabled = true;
  document.getElementById("sendButton").textContent = "Submit Answer";
  document.getElementById("configureButton").disabled = true;
  document.getElementById("configureButton").style.display = "none";
  document.getElementById("exitConfigButton").style.display = "inline-block";
  document.getElementById("downloadButton").style.display = "none";
  document.querySelector(".chat-container").classList.add("config-mode"); // Add config-mode class
  document.getElementById("output").innerHTML = "<em>Starting system configuration...</em>";
  await fetchOnboardingQuestion();
}

// Exit onboarding
function exitOnboarding() {
  onboardingActive = false;
  currentStep = null;
  // Optionally keep onboardingContext in localStorage to allow resuming
  document.getElementById("role").disabled = false;
  document.getElementById("sendButton").textContent = "Send";
  document.getElementById("configureButton").disabled = false;
  document.getElementById("configureButton").style.display = "inline-block";
  document.getElementById("exitConfigButton").style.display = "none";
  document.getElementById("downloadButton").style.display = "inline-block";
  document.querySelector(".chat-container").classList.remove("config-mode"); // Remove config-mode class
  document.getElementById("progress").textContent = "";
  document.getElementById("output").textContent = "Configuration exited. You can now use the assistant normally.";
  // Ensure textarea is restored
  const inputContainer = document.getElementById("input").parentElement;
  const currentInput = document.getElementById("input");
  if (currentInput.tagName.toLowerCase() !== "textarea") {
    const textarea = document.createElement("textarea");
    textarea.id = "input";
    textarea.placeholder = "Type your message or answer here...";
    textarea.setAttribute("aria-label", "Message or answer input");
    inputContainer.replaceChild(textarea, currentInput);
  }
}

// Fetch and display onboarding question
const steps = [
  "business_strategy",
  "operational_efficiency",
  "technical_infrastructure",
  "compliance_ethics",
  "marketing_growth",
  "financial_optimization",
  "system_support"
];

async function fetchOnboardingQuestion() {
  const output = document.getElementById("output");
  const progress = document.getElementById("progress");
  const inputContainer = document.getElementById("input").parentElement;
  output.innerHTML = "<em>Fetching question...</em>";
  if (progress) {
    const stepIndex = steps.indexOf(currentStep) + 1;
    progress.textContent = `Step ${stepIndex} of ${steps.length}: ${currentStep.replace('_', ' ').toUpperCase()}`;
  }

  try {
    const response = await fetch("http://127.0.0.1:5001/archeos-1/us-central1/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ step: currentStep, context: onboardingContext })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Fetch failed:", errorText);
      output.innerHTML = `<em style='color: #e74c3c'>Error: ${errorText}</em>`;
      return;
    }

    const data = await response.json();
    if (data.question) {
      output.textContent = data.question;
      if (data.options) {
        // Replace textarea with dropdown
        const textarea = document.getElementById("input");
        const select = document.createElement("select");
        select.id = "input";
        select.setAttribute("aria-label", "Select an option");
        data.options.forEach(opt => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });
        inputContainer.replaceChild(select, textarea);
      } else {
        // Ensure textarea is present
        const currentInput = document.getElementById("input");
        if (currentInput.tagName.toLowerCase() !== "textarea") {
          const textarea = document.createElement("textarea");
          textarea.id = "input";
          textarea.placeholder = "Type your answer here...";
          textarea.setAttribute("aria-label", "Answer input");
          inputContainer.replaceChild(textarea, currentInput);
        }
      }
    } else {
      output.textContent = "No question received. Please try again.";
    }
  } catch (err) {
    console.error("Fetch error:", err.message);
    output.innerHTML = `<em style='color: #e74c3c'>Network error: ${err.message}</em>`;
  }
}

// Handle onboarding response
async function handleOnboardingResponse() {
  const inputElement = document.getElementById("input");
  const input = inputElement.tagName.toLowerCase() === "select"
    ? inputElement.value
    : inputElement.value.trim();
  const output = document.getElementById("output");

  if (!input) {
    console.log("No input provided");
    output.innerHTML = "<em style='color: #e74c3c'>Please enter an answer.</em>";
    return;
  }

  if (currentStep === "feedback") {
    console.log("Feedback received:", input);
    await saveFeedback(input);
    onboardingActive = false;
    document.getElementById("role").disabled = false;
    document.getElementById("sendButton").textContent = "Send";
    document.getElementById("configureButton").disabled = false;
    document.getElementById("configureButton").style.display = "inline-block";
    document.getElementById("exitConfigButton").style.display = "none";
    document.getElementById("downloadButton").style.display = "inline-block";
    document.querySelector(".chat-container").classList.remove("config-mode"); // Remove config-mode class
    document.getElementById("progress").textContent = "";
    output.textContent = "Thank you for your feedback! You can now use the assistant normally.";
    document.getElementById("input").value = "";
    return;
  }

  onboardingContext[currentStep] = input;
  console.log("Onboarding response recorded:", { step: currentStep, answer: input });

  const currentIndex = steps.indexOf(currentStep);
  if (currentIndex < steps.length - 1) {
    currentStep = steps[currentIndex + 1];
    localStorage.setItem("onboardingState", JSON.stringify({ step: currentStep, context: onboardingContext }));
    await fetchOnboardingQuestion();
  } else {
    await completeOnboarding();
    localStorage.removeItem("onboardingState");
    onboardingActive = true; // Keep onboardingActive true for feedback
    currentStep = "feedback";
    output.textContent = "Onboarding complete! System configured. Was this process helpful? (Yes/No)";
  }

  if (inputElement.tagName.toLowerCase() !== "select") {
    inputElement.value = "";
  }
}

// Complete onboarding and save config
async function completeOnboarding() {
  try {
    const response = await fetch("http://127.0.0.1:5001/archeos-1/us-central1/save-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ context: onboardingContext })
    });

    if (!response.ok) {
      console.error("Failed to save config:", await response.text());
      document.getElementById("output").innerHTML = "<em style='color: #e74c3c'>Error saving configuration. Please try again.</em>";
    }
  } catch (err) {
    console.error("Config save error:", err.message);
    document.getElementById("output").innerHTML = `<em style='color: #e74c3c'>Network error: ${err.message}</em>`;
  }
}

// Handle feedback response
async function saveFeedback(feedback) {
  try {
    const response = await fetch("http://127.0.0.1:5001/archeos-1/us-central1/save-feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedback, context: onboardingContext })
    });

    if (!response.ok) {
      console.error("Failed to save feedback:", await response.text());
    }
  } catch (err) {
    console.error("Feedback save error:", err.message);
  }
}

// Strip markdown and preserve structure
function stripMarkdown(text) {
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/^\s*[-*]\s+/gm, '');
  text = text.replace(/\n{2,}/g, '\n\n');
  return text.trim();
}

// Generate and download the report card
function downloadReportCard() {
  if (chatHistory.length === 0) {
    alert("No chat history available to generate a report card.");
    return;
  }

  let reportContent = "Operating System Chatbot Report Card\n";
  reportContent += "=========================\n\n";
  chatHistory.forEach((entry, index) => {
    reportContent += `Interaction ${index + 1}:\n`;
    reportContent += `User Message: ${entry.input}\n`;
    reportContent += `Role: ${entry.role}\n`;
    reportContent += `Response: ${entry.response}\n`;
    reportContent += "-------------------------\n\n";
  });
  reportContent += `Generated on: ${new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })}\n`;

  const blob = new Blob([reportContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Chatbot_Report_Card.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  console.log("Report card downloaded at", new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
}

// Send message to chatbot
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

  output.innerHTML = "<em>Connecting to system...</em>";
  console.log("Set output to 'Connecting...'");

  const endpoint = "http://127.0.0.1:5001/archeos-1/us-central1/chatbot";
  console.log("Using endpoint:", endpoint);

  try {
    console.log("Sending fetch request with body:", JSON.stringify({ message: input, roleId: role }));
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

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
      const formattedText = stripMarkdown(data.reply);
      console.log("Setting output to formatted reply:", formattedText);
      output.textContent = formattedText;
      chatHistory.push({ input, role, response: formattedText });
    } else {
      console.log("No valid reply in response data:", data);
      output.textContent = "No response received. Please try again.";
    }
  } catch (err) {
    console.error("Fetch or network error:", err.message);
    output.innerHTML = `<em style='color: #e74c3c'>Network error: ${err.message}</em>`;
  } finally {
    document.getElementById("input").value = "";
    console.log("Cleared input field at", new Date().toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  }
}