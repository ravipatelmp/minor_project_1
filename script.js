const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const submitBtn = document.querySelector(".generate-btn");
const countSelect = document.getElementById("count-select");
const gridGallery = document.querySelector(".gallery-grid");

// अपनी API Key यहाँ डालें
const API_KEY = "ef4e7f96c184600127fe0c7ca14d692cb3e32de44ea7b303e1aa21feaa052571a97a231d18812fdd5e4f1686f5cb97a5"; 

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

    // सभी इमेज के लिए रिक्वेस्ट भेजें
    const requests = Array.from({ length: imageCount }, async (_, i) => {
        try {
            const formData = new FormData();
            formData.append("prompt", promptText);

            const response = await fetch("https://clipdrop-api.co/text-to-image/v1", {
                method: "POST",
                headers: { "x-api-key": API_KEY },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Error ${response.status}`);
            }

            const buffer = await response.arrayBuffer();
            const blob = new Blob([buffer], { type: "image/png" });
            const url = URL.createObjectURL(blob);
            updateImageCard(i, url);

        } catch (err) {
            console.error("Error:", err.message);
            const card = document.getElementById(`img-card-${i}`);
            if (card) {
                card.classList.remove("loading");
                card.innerHTML = `<p style="color:red; font-size:12px; padding:10px; text-align:center;">Failed: ${err.message}</p>`;
            }
        }
    });

    await Promise.allSettled(requests);
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa-solid fa-wand-sparkles"></i> Generate`;
};

// ==== Form Event ====
promptForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = promptInput.value.trim();
    if (!text) return;

    // पुरानी इमेजेस की मेमोरी साफ़ करें
    generatedUrls.forEach(url => URL.revokeObjectURL(url));
    generatedUrls = [];
    gridGallery.innerHTML = "";

    const count = parseInt(countSelect.value);
    
    // हमने ratio-select को हटाकर डिफ़ॉल्ट "1/1" कर दिया है
    const defaultRatio = "1/1"; 

    // गैलरी में लोडिंग कार्ड्स जोड़ें
    for (let i = 0; i < count; i++) {
        gridGallery.innerHTML += `
            <div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${defaultRatio}">
                <div class="spinner"></div>
            </div>
        `;
    }

    // इमेज जनरेट करना शुरू करें
    generateImages(count, text);
});