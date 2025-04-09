const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-slect");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-slect");
const gridGallery = document.querySelector(".gallery-grid");

const API_KEY = "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"; 

const examplePrompts = [
    "A magic forest with glowing plants and fairy homes among giant mushrooms", 
    "A dragon sleeping on gold coins in a crystal cave", 
    "An old steampunk airship floating through golden clouds at sunset", 
    "A future Mars colony with glass domes and gardens against red mountains",
    "An underwater kingdom with merpeople and glowing coral buildings", 
    "A floating island with waterfalls pouring into clouds below", 
    "A witch's cottage in fall with magic herbs in the garden", 
    "A robot painting in a sunny studio with art supplies around it", 
    "A magical library with floating glowing books and spiral staircases", 
    "A Japanese shrine during cherry blossom season with lanterns and misty mountains",
];

(() => {
  const savedTheme =localStorage.getItem("theme");
  const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
  document.body.classList.toggle("dark-theme", isDarkTheme);
  themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

// Switch between light and dark theme
const toggleTheme = () => {
  const isDarkTheme =  document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
};

const getImageDimensions = (aspectRatio, baseSize = 512) => {
    const [width, height] = aspectRatio.split("/").map(Number); 
    const scaleFactor =baseSize / Math.sqrt(width * height); 
    
    let calculatedWidth = Math.round(width * scaleFactor); 
    let calculatedHeight = Math.round(height * scaleFactor); 

    // Ensure dimensions are multiples of 16 (AI model 
       calculatedWidth = Math.floor(calculatedWidth / 16) * 16;
       calculatedHeight = Math.floor(calculatedHeight / 16) * 16;

       return {width: calculatedHeight, height: calculatedHeight };
};



const updateImageCard = (imgIndex, imgUrl) => {
    const imgCard = document.getElementById(`img-card-${imgIndex}`)
    if(!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `  <img src="${imgUrl}"  class="result-img" />
                        <div class="img-overlay">
                            <a herf="${imgUrl}" class="img-download-btn" dowload="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </button>
                        </div>`;
};

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) => {
     const MODEL_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
     const {width, height} = getImageDimensions(aspectRatio);

     const imagepromises = Array.from({length: imageCount}, async(_, i) => { 
     try {
     const response = await fetch(MODEL_URL, {
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
        inputs: promptText,
        parameters: { width, height },
        options: {wait_for_model: true, user_cache: false},
        }),
     });

     if (!response.ok) throw new Error ((await responce.json())?.error);

     const result = await response.blob();
     updateImageCard(i, URL.createObjectURL( result));
     } catch (error) {
        console.log(error);
     }
    });

    await Promise.allSettled(imagepromises);
};

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) => {
    gridGallery.innerHTML = "";

    for (let i = 0; i < imageCount; i++) {
       gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio: ${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                    </div>`;
        
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
}

const handleFormSubmit = (e) => {
    e.preventDefault();

    const selectedModel = modelSelect.value;
    const imageCount =parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";
    const promptText = promptInput.value.trim();

   createImageCards(selectedModel, imageCount, aspectRatio, promptText);
};

promptBtn.addEventListener("click", () => {
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
})

promptForm.addEventListener("submit", handleFormSubmit);
themeToggle.addEventListener("click", toggleTheme);