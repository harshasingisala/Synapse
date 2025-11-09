// Minimal cinematic boot + login, then reveal → redirect to chat.html

const terminal = document.getElementById("bootTerminal");
const loginForm = document.getElementById("loginForm");
const unlockBtn = document.getElementById("unlockBtn");
const accessOverlay = document.getElementById("accessOverlay");
const accessBloom = document.getElementById("accessBloom");

const bootLines = [
  { t: "BOOTING COGNITIVE LATTICE …", d: 600 },
  { t: "LINKING NEURAL CLUSTERS …", d: 700 },
  { t: "STABILIZING QUANTUM CORE …", d: 800 },
  { t: "HEURISTIC FIREWALL: ARMED", d: 500 },
  { t: "CRYPTOGRAPHIC SALT: OK", d: 450 },
  { t: "ENTROPY POOL: SATURATED", d: 450 },
  { t: "MEMNET: CLEAN", d: 400 },
  { t: "READY.", d: 400 }
];

function typeLine(text) {
  return new Promise(resolve => {
    const line = document.createElement("div");
    line.className = "term-line";
    terminal.appendChild(line);

    let i = 0;
    const tick = () => {
      line.textContent = text.slice(0, i) + (i < text.length ? "▌" : "");
      i++;
      if (i <= text.length) {
        requestAnimationFrame(tick);
      } else {
        line.textContent = text;
        resolve();
      }
      terminal.scrollTop = terminal.scrollHeight;
    };
    tick();
  });
}

(async function bootSequence() {
  for (const step of bootLines) {
    await typeLine(step.t);
    await new Promise(r => setTimeout(r, step.d));
  }
  // Reveal form after boot
  loginForm.classList.add("form-reveal");
})();

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  unlockBtn.disabled = true;
  unlockBtn.classList.add("busy");
  unlockBtn.textContent = "VERIFYING …";

  // Fake verification delay
  await new Promise(r => setTimeout(r, 900));

  // Access Granted FX
  accessOverlay.classList.add("show");
  setTimeout(() => accessBloom.classList.add("expand"), 10);

  // Redirect after the bloom
  setTimeout(() => {
    window.location.href = "chat.html";
  }, 1400);
});
