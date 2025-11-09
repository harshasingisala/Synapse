// scripts/intro.js
const introMessages = [
  "Initializing Synapse...",
  "Optimizing neural pathways...",
  "Adapting your learning environment...",
  "Welcome to Synapse — your AI study companion!"
];

let currentIndex = 0;
const introTitle = document.querySelector(".intro-title");

function showNextMessage() {
  if (currentIndex < introMessages.length) {
    introTitle.classList.remove("fade-out");
    introTitle.classList.add("fade-in");
    introTitle.textContent = introMessages[currentIndex];

    setTimeout(() => {
      introTitle.classList.remove("fade-in");
      introTitle.classList.add("fade-out");
      currentIndex++;
      setTimeout(showNextMessage, 1000); // wait before next text
    }, 4000); // show each text for 4s
  } else {
    // Reveal start button after last message
    const startBtn = document.getElementById("startBtn");
    startBtn.style.opacity = "1";
    startBtn.style.pointerEvents = "auto";
  }
}

// Start sequence
window.addEventListener("load", () => {
  document.getElementById("startBtn").style.opacity = "0";
  document.getElementById("startBtn").style.pointerEvents = "none";
  setTimeout(showNextMessage, 500);
});
