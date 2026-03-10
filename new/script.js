const welcomeScreen = document.getElementById("welcome-screen");
const startBtn = document.getElementById("start-btn");
const hud = document.getElementById("hud");
const gameTitle = document.getElementById("game-title");
const scoreLine = document.getElementById("score-line");
const resultScreen = document.getElementById("result-screen");
const resultText = document.getElementById("result-text");
const nextBtn = document.getElementById("next-btn");
const skipLevelBtn = document.getElementById("skip-level-btn");

const game1Area = document.getElementById("game1-area");
const game2Area = document.getElementById("game2-area");
const game3Area = document.getElementById("game3-area");
const game4Area = document.getElementById("game4-area");

const fallingLayer = document.getElementById("falling-layer");
const bgHeartsLayer = document.getElementById("bg-hearts-layer");
const pairsGrid = document.getElementById("pairs-grid");
const sequenceGrid = document.getElementById("sequence-grid");
const mazeGrid = document.getElementById("maze-grid");
const mazeButtons = document.querySelectorAll(".maze-btn");
const finalConfettiLayer = document.getElementById("final-confetti-layer");

const targetEmoji = "❤️";
const fallPool = ["❤️", "🩷", "💝", "💖", "💗", "🥰", "😘", "🌸", "🌷", "🌺", "🫶"];

let nextAction = null;
let currentGame = 0;

let catchScore = 0;
let catchActive = false;
let spawnTimer;

let firstCard = null;
let lockPairs = false;
let matchedPairs = 0;

let seqOrder = [];
let seqStep = 0;
let acceptingSequenceInput = false;

const mazeSize = 8;
const mazeStart = { x: 0, y: 0 };
const mazeGoal = { x: 7, y: 7 };
const wallCells = new Set([
    "1,0", "1,1", "1,2", "3,1", "3,2", "3,3", "5,2", "5,3", "5,4", "2,5", "3,5", "4,5", "6,1", "6,2", "6,3",
]);

let mazePlayer = { ...mazeStart };
let mazeMovesLeft = 40;
let mazeHeartsCollected = 0;
let mazeSpeedMoves = 0;
let mazeSkipTurn = false;
let mazeActive = false;
let mazeHearts = new Set();
let mazeBonuses = new Set();
let mazeTraps = new Set();
let finalConfettiInterval = null;

function hideAllGames() {
    game1Area.classList.add("hidden");
    game2Area.classList.add("hidden");
    game3Area.classList.add("hidden");
    game4Area.classList.add("hidden");
}

function stopAllTimers() {
    clearInterval(spawnTimer);
    catchActive = false;
    acceptingSequenceInput = false;
    lockPairs = false;
    mazeActive = false;
}

function setBgHeartsEnabled(enabled) {
    document.body.classList.toggle("no-bg-hearts", !enabled);
}

function clearFinalCelebration() {
    document.body.classList.remove("final-celebration");
    clearInterval(finalConfettiInterval);
    finalConfettiInterval = null;
    finalConfettiLayer.innerHTML = "";
}

function spawnConfettiBatch(count = 16) {
    const palette = ["💖", "💗", "🩷", "💕", "💘", "❤️", "✨", "🎉"];

    for (let i = 0; i < count; i += 1) {
        const c = document.createElement("span");
        c.className = "confetti-heart";
        c.textContent = palette[Math.floor(Math.random() * palette.length)];
        c.style.left = `${Math.random() * 100}vw`;
        c.style.fontSize = `${16 + Math.random() * 24}px`;
        c.style.animationDuration = `${3 + Math.random() * 3.2}s`;
        c.style.animationDelay = `${Math.random() * 0.25}s`;

        c.addEventListener("animationend", () => c.remove());
        finalConfettiLayer.appendChild(c);
    }
}

function launchFinalConfetti() {
    clearInterval(finalConfettiInterval);
    finalConfettiLayer.innerHTML = "";

    // стартовый всплеск
    spawnConfettiBatch(64);

    // дальше непрерывный мягкий поток
    finalConfettiInterval = setInterval(() => {
        if (!document.body.classList.contains("final-celebration")) return;
        spawnConfettiBatch(8);
    }, 500);
}

function setResultButton(text) {
    nextBtn.textContent = text;
}

function showResult(message, action = null, buttonText = "Следующая игра") {
    resultText.textContent = message;
    nextAction = action;

    if (action) {
        clearFinalCelebration();
        setResultButton(buttonText);
        nextBtn.classList.remove("hidden");
    } else {
        nextBtn.classList.add("hidden");
    }

    resultScreen.classList.remove("hidden");
}

function updateHud(title, score) {
    gameTitle.textContent = title;
    scoreLine.textContent = score;
}

function finishCatchGame() {
    catchActive = false;
    clearInterval(spawnTimer);
    showResult("Все эти сердечки тебе, я тебя очень сильно люблю ❤️!", startPairsGame);
}

function createFaller() {
    const item = document.createElement("span");
    item.className = "faller";

    const emoji = fallPool[Math.floor(Math.random() * fallPool.length)];
    item.textContent = emoji;
    item.dataset.target = String(emoji === targetEmoji);
    item.style.left = `${Math.random() * 96}vw`;
    item.style.fontSize = `${20 + Math.random() * 24}px`;
    item.style.animationDuration = `${2.6 + Math.random() * 2.8}s`;

    item.addEventListener("click", () => {
        if (!catchActive) return;

        if (item.dataset.target === "true") {
            catchScore += 1;
            updateHud('1 игра, поймай 10 сердечек❤️', `Поймано: ${catchScore}/10`);
            if (catchScore >= 10) {
                finishCatchGame();
            }
        }

        item.remove();
    });

    item.addEventListener("animationend", () => item.remove());
    fallingLayer.appendChild(item);
}

function startCatchGame() {
    nextBtn.classList.remove("hidden");
    setBgHeartsEnabled(false);
    clearFinalCelebration();
    currentGame = 1;
    hideAllGames();
    resultScreen.classList.add("hidden");
    welcomeScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    game1Area.classList.remove("hidden");

    catchScore = 0;
    catchActive = true;
    fallingLayer.innerHTML = "";
    updateHud('1 игра, поймай 10 сердечек ❤️', "Поймано: 0/10");

    clearInterval(spawnTimer);
    spawnTimer = setInterval(() => {
        if (!catchActive) return;
        for (let i = 0; i < 4; i += 1) createFaller();
    }, 380);
}

function startPairsGame() {
    nextBtn.classList.remove("hidden");
    setBgHeartsEnabled(true);
    clearFinalCelebration();
    currentGame = 2;
    clearInterval(spawnTimer);
    catchActive = false;

    hideAllGames();
    resultScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    game2Area.classList.remove("hidden");

    updateHud("2 игра, отгадай пары", "Найдено пар: 0/18");

    firstCard = null;
    lockPairs = false;
    matchedPairs = 0;
    pairsGrid.innerHTML = "";

    const symbols = ["🩷", "❤️", "🧡", "💛", "💚", "💙", "💜", "🤍", "🩵", "💗", "💖", "💝", "🌸", "🌷", "🌺", "💐", "🪻", "✨"];
    const deck = [...symbols, ...symbols]
        .sort(() => Math.random() - 0.5)
        .map((symbol, index) => ({ id: index, symbol }));

    deck.forEach((cardData) => {
        const card = document.createElement("button");
        card.className = "card";
        card.type = "button";
        card.textContent = cardData.symbol;
        card.dataset.symbol = cardData.symbol;

        card.addEventListener("click", () => {
            if (lockPairs || card.classList.contains("matched") || card === firstCard) return;

            card.classList.add("flipped");

            if (!firstCard) {
                firstCard = card;
                return;
            }

            if (firstCard.dataset.symbol === card.dataset.symbol) {
                firstCard.classList.add("matched");
                card.classList.add("matched");
                matchedPairs += 1;
                updateHud("2 игра, отгадай пары", `Найдено пар: ${matchedPairs}/18`);
                firstCard = null;

                if (matchedPairs >= 18) {
                    showResult("Ты умничка, ты справилась, потому что ты самая умная и лучшая девочка на свете, спасибо тебе за то, что ты есть❤️", startSequenceGame);
                }
            } else {
                lockPairs = true;
                const previous = firstCard;
                firstCard = null;
                setTimeout(() => {
                    previous.classList.remove("flipped");
                    card.classList.remove("flipped");
                    lockPairs = false;
                }, 700);
            }
        });

        pairsGrid.appendChild(card);
    });
}

function highlightTile(tile, delay) {
    return new Promise((resolve) => {
        setTimeout(() => {
            tile.classList.add("active");
            setTimeout(() => {
                tile.classList.remove("active");
                resolve();
            }, 350);
        }, delay);
    });
}

async function playSequence() {
    acceptingSequenceInput = false;
    updateHud("3 игра, запомни порядок", "Запоминай последовательность...");

    for (let i = 0; i < seqOrder.length; i += 1) {
        const tile = sequenceGrid.children[seqOrder[i]];
        // eslint-disable-next-line no-await-in-loop
        await highlightTile(tile, 120);
    }

    seqStep = 0;
    acceptingSequenceInput = true;
    updateHud("3 игра, запомни порядок", `Повтори: 0/${seqOrder.length}`);
}

function startSequenceGame() {
    nextBtn.classList.remove("hidden");
    setBgHeartsEnabled(true);
    clearFinalCelebration();
    currentGame = 3;
    hideAllGames();
    resultScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    game3Area.classList.remove("hidden");

    sequenceGrid.innerHTML = "";
    const emojis = ["🌸", "🩷", "💜", "💙", "💚", "💛", "🧡", "❤️", "💐", "✨"];

    for (let i = 0; i < 10; i += 1) {
        const tile = document.createElement("button");
        tile.className = "seq-tile";
        tile.type = "button";
        tile.textContent = emojis[i];
        tile.dataset.index = String(i);

        tile.addEventListener("click", () => {
            if (!acceptingSequenceInput) return;

            const clicked = Number(tile.dataset.index);
            const needed = seqOrder[seqStep];

            if (clicked === needed) {
                tile.classList.add("revealed");
                seqStep += 1;
                updateHud("3 игра, запомни порядок", `Повтори: ${seqStep}/${seqOrder.length}`);

                if (seqStep >= seqOrder.length) {
                    acceptingSequenceInput = false;
                    showResult("У тебя прекрасная память, потому что ты моя девочка, я тебя безумно люблю, будь со мной всегда✨", startMazeGame);
                }
            } else {
                acceptingSequenceInput = false;
                updateHud("3 игра, запомни порядок", "Ошибка! Смотри заново 👀");
                setTimeout(() => {
                    Array.from(sequenceGrid.children).forEach((btn) => btn.classList.remove("revealed"));
                    playSequence();
                }, 800);
            }
        });

        sequenceGrid.appendChild(tile);
    }

    const indices = [...Array(10).keys()];
    seqOrder = indices.sort(() => Math.random() - 0.5);
    playSequence();
}

function updateMazeHud(note = "") {
    const speed = mazeSpeedMoves > 0 ? ` • Буст: ${mazeSpeedMoves}` : "";
    const extra = note ? ` • ${note}` : "";
    updateHud("4 игра, лабиринт любви", `Сердечки: ${mazeHeartsCollected}/5 • Ходы: ${mazeMovesLeft}${speed}${extra}`);
}

function randomCell(used) {
    while (true) {
        const x = Math.floor(Math.random() * mazeSize);
        const y = Math.floor(Math.random() * mazeSize);
        const key = `${x},${y}`;
        if (key === `${mazeStart.x},${mazeStart.y}` || key === `${mazeGoal.x},${mazeGoal.y}`) continue;
        if (wallCells.has(key) || used.has(key)) continue;
        used.add(key);
        return key;
    }
}

function setupMazeItems() {
    const used = new Set();
    mazeHearts = new Set();
    mazeBonuses = new Set();
    mazeTraps = new Set();

    for (let i = 0; i < 5; i += 1) mazeHearts.add(randomCell(used));
    for (let i = 0; i < 3; i += 1) mazeBonuses.add(randomCell(used));
    for (let i = 0; i < 3; i += 1) mazeTraps.add(randomCell(used));
}

function renderMaze() {
    mazeGrid.innerHTML = "";

    for (let y = 0; y < mazeSize; y += 1) {
        for (let x = 0; x < mazeSize; x += 1) {
            const cell = document.createElement("div");
            const key = `${x},${y}`;
            cell.className = "maze-cell";

            if (wallCells.has(key)) {
                cell.classList.add("wall");
                cell.textContent = "🧱";
            } else if (x === mazePlayer.x && y === mazePlayer.y) {
                cell.classList.add("player");
                cell.textContent = "💖";
            } else if (key === `${mazeGoal.x},${mazeGoal.y}`) {
                cell.textContent = "💌";
            } else if (mazeHearts.has(key)) {
                cell.textContent = "❤️";
            } else if (mazeBonuses.has(key)) {
                cell.textContent = "⚡";
            } else if (mazeTraps.has(key)) {
                cell.textContent = "🕸️";
            }

            mazeGrid.appendChild(cell);
        }
    }
}

function finishMazeWin() {
    mazeActive = false;
    hideAllGames();
    hud.classList.add("hidden");
    setBgHeartsEnabled(true);
    document.body.classList.add("final-celebration");
    launchFinalConfetti();
    showResult("Девочка моя, спасибо тебе за все, спасибо за то что ты есть, я тебя безумно сильно люблю, ты у меня самая лучшая девочка, самая красивая, добрая, умная, я очень рад что ты у меня есть, у тебя самый нежный голос, самые лучшие волосы, губы, глаза, руки, нос, щечки, и абсолютно все в тебе - прекрасно, спасибо тебе! я всегда буду с тобой, прости за все, надеюсь тебе понравиться, спасибо за терпение, любовь моя!❤️✨");
}

function finishMazeLose() {
    mazeActive = false;
    hideAllGames();
    hud.classList.add("hidden");
    setBgHeartsEnabled(true);
    document.body.classList.add("final-celebration");
    launchFinalConfetti();
    showResult("Почти! Попробуй ещё 💕", startMazeGame, "Повторить");
}

function processMazeCell() {
    const key = `${mazePlayer.x},${mazePlayer.y}`;
    let note = "";

    if (mazeHearts.has(key)) {
        mazeHearts.delete(key);
        mazeHeartsCollected += 1;
        note = "+❤️";
    }

    if (mazeBonuses.has(key)) {
        mazeBonuses.delete(key);
        mazeSpeedMoves = 3;
        note = "ускорение x2";
    }

    if (mazeTraps.has(key)) {
        mazeTraps.delete(key);
        mazeSkipTurn = true;
        note = "ловушка!";
    }

    return note;
}

function moveMaze(direction) {
    if (!mazeActive) return;

    if (mazeSkipTurn) {
        mazeSkipTurn = false;
        mazeMovesLeft -= 1;
        updateMazeHud("пропуск хода");
        if (mazeMovesLeft <= 0) finishMazeLose();
        return;
    }

    const vectors = {
        up: { x: 0, y: -1 },
        down: { x: 0, y: 1 },
        left: { x: -1, y: 0 },
        right: { x: 1, y: 0 },
    };

    const vector = vectors[direction];
    if (!vector) return;

    const steps = mazeSpeedMoves > 0 ? 2 : 1;
    let note = "";

    for (let i = 0; i < steps; i += 1) {
        const nx = mazePlayer.x + vector.x;
        const ny = mazePlayer.y + vector.y;
        const key = `${nx},${ny}`;

        if (nx < 0 || ny < 0 || nx >= mazeSize || ny >= mazeSize || wallCells.has(key)) break;
        mazePlayer = { x: nx, y: ny };
        note = processMazeCell() || note;
    }

    mazeMovesLeft -= 1;
    if (mazeSpeedMoves > 0) mazeSpeedMoves -= 1;

    renderMaze();
    updateMazeHud(note);

    if (mazeHeartsCollected >= 5 && mazePlayer.x === mazeGoal.x && mazePlayer.y === mazeGoal.y) {
        finishMazeWin();
        return;
    }

    if (mazeMovesLeft <= 0) finishMazeLose();
}

function startMazeGame() {
    nextBtn.classList.remove("hidden");
    setBgHeartsEnabled(true);
    clearFinalCelebration();
    currentGame = 4;
    hideAllGames();
    resultScreen.classList.add("hidden");
    hud.classList.remove("hidden");
    game4Area.classList.remove("hidden");

    mazePlayer = { ...mazeStart };
    mazeMovesLeft = 40;
    mazeHeartsCollected = 0;
    mazeSpeedMoves = 0;
    mazeSkipTurn = false;
    mazeActive = true;

    setupMazeItems();
    renderMaze();
    updateMazeHud();
}

function skipCurrentLevel() {
    stopAllTimers();

    if (currentGame === 1) {
        showResult("Уровень пропущен ✅", startPairsGame, "Следующая игра");
        return;
    }

    if (currentGame === 2) {
        showResult("Уровень пропущен ✅", startSequenceGame, "Следующая игра");
        return;
    }

    if (currentGame === 3) {
        showResult("Уровень пропущен ✅", startMazeGame, "Следующая игра");
        return;
    }

    if (currentGame === 4) {
        showResult("Уровень пропущен ✅", startCatchGame, "Следующая игра");
    }
}

mazeButtons.forEach((btn) => {
    btn.addEventListener("click", () => moveMaze(btn.dataset.dir));
});

window.addEventListener("keydown", (event) => {
    if (currentGame !== 4 || !mazeActive) return;

    const key = event.key.toLowerCase();
    const map = {
        arrowup: "up",
        w: "up",
        arrowdown: "down",
        s: "down",
        arrowleft: "left",
        a: "left",
        arrowright: "right",
        d: "right",
    };

    if (map[key]) {
        event.preventDefault();
        moveMaze(map[key]);
    }
});


function initBackgroundHearts() {
    bgHeartsLayer.innerHTML = "";
    const decorative = ["🩷", "💗", "💕", "💖", "🌸"];

    for (let i = 0; i < 28; i += 1) {
        const heart = document.createElement("span");
        heart.className = "bg-heart";
        heart.textContent = decorative[Math.floor(Math.random() * decorative.length)];
        heart.style.left = `${Math.random() * 100}vw`;
        heart.style.fontSize = `${14 + Math.random() * 22}px`;
        heart.style.animationDuration = `${10 + Math.random() * 12}s`;
        heart.style.animationDelay = `${Math.random() * -20}s`;
        bgHeartsLayer.appendChild(heart);
    }
}

initBackgroundHearts();

startBtn.addEventListener("click", startCatchGame);
skipLevelBtn.addEventListener("click", skipCurrentLevel);

nextBtn.addEventListener("click", () => {
    resultScreen.classList.add("hidden");
    if (nextAction) nextAction();
});
