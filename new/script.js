const heartsLayer = document.getElementById("hearts-layer");
const heartsCount = 36;

for (let i = 0; i < heartsCount; i += 1) {
    const heart = document.createElement("span");
    heart.className = "heart";
    heart.textContent = "❤";

    const size = 12 + Math.random() * 24;
    const left = Math.random() * 100;
    const delay = Math.random() * -18;
    const duration = 8 + Math.random() * 12;
    const opacity = 0.3 + Math.random() * 0.6;

    heart.style.fontSize = `${size}px`;
    heart.style.left = `${left}vw`;
    heart.style.animationDelay = `${delay}s`;
    heart.style.animationDuration = `${duration}s`;
    heart.style.opacity = opacity.toFixed(2);

    heartsLayer.appendChild(heart);
}