const welcomeScreen = document.getElementById("welcome-screen");
const startBtn = document.getElementById("start-btn");
const hud = document.getElementById("hud");
const scoreEl = document.getElementById("score");
const layer = document.getElementById("falling-layer");
const result = document.getElementById("result");
const nextBtn = document.getElementById("next-btn");

const targetEmoji = "❤️";
const pool = ["❤️", "🩷", "💝", "💖", "💗", "🥰", "😘", "🌸", "🌷", "🌺", "🫶"];

let score = 0;
let gameActive = false;
let spawnTimer;

function updateScore() {
    scoreEl.textContent = String(score);
}

function clearFallers() {
    layer.innerHTML = "";
}

function finishGame() {
    gameActive = false;
    clearInterval(spawnTimer);
    result.classList.remove("hidden");
}

function createFaller() {
    const item = document.createElement("span");
    item.className = "faller";

    const emoji = pool[Math.floor(Math.random() * pool.length)];
    const isTarget = emoji === targetEmoji;

    item.textContent = emoji;
    item.dataset.target = String(isTarget);
    item.style.left = `${Math.random() * 96}vw`;
    item.style.fontSize = `${20 + Math.random() * 24}px`;
    item.style.animationDuration = `${2.6 + Math.random() * 2.8}s`;

    item.addEventListener("click", () => {
        if (!gameActive) return;

        if (item.dataset.target === "true") {
            score += 1;
            updateScore();
            if (score >= 10) {
                finishGame();
            }
        }

        item.remove();
    });

    item.addEventListener("animationend", () => item.remove());
    layer.appendChild(item);
}

function startGame() {
    score = 0;
    updateScore();
    gameActive = true;
    clearFallers();

    welcomeScreen.classList.add("hidden");
    result.classList.add("hidden");
    hud.classList.remove("hidden");

    clearInterval(spawnTimer);
    spawnTimer = setInterval(() => {
        if (!gameActive) return;

        // Много объектов, как просили
        for (let i = 0; i < 4; i += 1) {
            createFaller();
        }
    }, 380);
}

startBtn.addEventListener("click", startGame);
nextBtn.addEventListener("click", startGame);