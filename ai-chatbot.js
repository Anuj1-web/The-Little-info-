const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatMessages = document.getElementById("chatMessages");

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  appendMessage("You", message, "user");
  userInput.value = "";

  try {
    const reply = await getAIResponse(message);
    appendMessage("Little AI", reply, "bot");
  } catch (error) {
    appendMessage("Little AI", "⚠️ Sorry, there was an error. Try again later.", "bot");
    console.error(error);
  }
});

// Append message to chat window
function appendMessage(sender, text, type) {
  const msg = document.createElement("div");
  msg.className = `message ${type}`;
  msg.innerHTML = `<strong>${sender}:</strong> ${text}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Placeholder for AI response logic
async function getAIResponse(message) {
  // Replace with your backend or OpenAI API call here
  return new Promise((resolve) => {
    setTimeout(() => {
      const cannedResponses = [
        "Here's a quick summary of that topic!",
        "Let me explain that...",
        "This video seems to be about history and culture.",
        "That's an interesting question. Here's what I found.",
      ];
      const reply = cannedResponses[Math.floor(Math.random() * cannedResponses.length)];
      resolve(reply);
    }, 1000);
  });
}
