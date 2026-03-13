const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const submitBtn = document.querySelector(".generate-btn");
const countSelect = document.getElementById("count-select");
const gridGallery = document.querySelector(".gallery-grid");

let generatedUrls = [];

// ==== Random Prompts ====
const examplePrompts = [
    "A mystical forest with glowing mushrooms",
    "A futuristic city with flying cars and neon lights",
    "A majestic dragon sitting on a pile of gold",
    "A cozy cabin in the mountains during winter",
    "A cyberpunk samurai in a rainy street",
    "An astronaut riding a horse on Mars"
];

// ==== Theme Toggle ====
themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    themeToggle.querySelector("i").className = isDark ? "fa-solid fa-sun" : "fa-solid fa-moon";
});

// ==== Random Prompt Button ====
promptBtn.addEventListener("click", () => {
    const randomPrompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = randomPrompt;
});

// ==== Image Card Update ====
const updateImageCard = (index, imgUrl) => {
    const card = document.getElementById(`img-card-${index}`);
    if (!card) return;
    generatedUrls.push(imgUrl);
    card.classList.remove("loading");
    card.innerHTML = `
        <img src="${imgUrl}" class="result-img" alt="AI Generated Image">
        <div class="img-overlay">
            <a href="${imgUrl}" download="ai-image-${index}.png" class="img-download-btn">
                <i class="fa-solid fa-download"></i>
            </a>
        </div>
    `;
};

// ==== Main Generation Logic ====
const generateImages = async (imageCount, promptText) => {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Generating...`;

    try {
        const response = await fetch(`/api/generate?prompt=${encodeURIComponent(promptText)}&count=${imageCount}`);
        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Failed to generate");
        }

        gridGallery.innerHTML = "";
        // data.urls now contains the Base64 strings
        data.urls.forEach((url, i) => {
            // Re-create the card structure before updating
            gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}"></div>`;
            updateImageCard(i, url);
        });

    } catch (err) {
        console.error(err);
        gridGallery.innerHTML = `<p style="color:red; text-align:center;">${err.message}</p>`;
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-wand-sparkles"></i> Generate`;
    }
};

// ==== Form Event ====
promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = promptInput.value.trim();
    if (!text) return;

    // Clear old images
    generatedUrls.forEach(url => URL.revokeObjectURL(url));
    generatedUrls = [];
    gridGallery.innerHTML = "";

    let count = parseInt(countSelect.value);
    if (isNaN(count) || count < 1) count = 1;

    const defaultRatio = "1/1";

    for (let i = 0; i < count; i++) {
        gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${defaultRatio}">
                <div class="spinner"></div>
            </div>
        `;
    }

    generateImages(count, text);
});