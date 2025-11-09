const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  appendMessage("user", text);
  userInput.value = "";

  try {
    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: text }),
    });

    const data = await res.json();
    if (res.ok) {
      appendMessage("ai", data.reply);
    } else {
      appendMessage("ai", "⚠️ Error: " + data.detail);
    }
  } catch (err) {
    appendMessage("ai", "⚠️ Unable to reach Synapse backend.");
  }
}

function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.textContent = text;
  msgDiv.classList.add(sender === "user" ? "user-msg" : "ai-msg");
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}


// Send message
async function sendMessage() {
  const text = userInput.value.trim();
  if (!text) return;

  // Show user message immediately
  addMessage(text, "user");
  userInput.value = "";

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({ query: text }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Server error");
    }

    const data = await res.json();
    addMessage(data.reply || "⚠️ No reply received", "ai");

  } catch (err) {
    console.error("Chat error:", err);
    addMessage("⚠️ Error: " + err.message, "ai");
  }
}

// Button + Enter key
sendBtn.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});
