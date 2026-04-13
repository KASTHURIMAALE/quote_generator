let allQuotes = [];
let filteredQuotes = [];
let history = [];
let favorites = JSON.parse(localStorage.getItem("favQuotes")) || [];
let autoPlayInterval = null;

async function loadQuotes() {
    try {
        const response = await fetch('quotes.json');
        allQuotes = await response.json();
        filteredQuotes = [...allQuotes];
        displayNewQuote();
    } catch (e) { console.error("Error loading JSON"); }
}

function displayNewQuote() {
    const container = document.getElementById("quoteContainer");
    container.classList.add("fade-out");

    setTimeout(() => {
        if (filteredQuotes.length === 0) return;
        const quote = filteredQuotes[Math.floor(Math.random() * filteredQuotes.length)];
        
        // Update History
        if (document.getElementById("quote").innerText !== "Loading inspiration...") {
            addQuoteToHistory(document.getElementById("quote").innerText, document.getElementById("author").innerText);
        }

        document.getElementById("quote").innerText = quote.text;
        document.getElementById("author").innerText = quote.author;
        
        updateFavIcon(quote.text);
        changeBackground(quote.category);
        
        container.classList.remove("fade-out");
        container.classList.add("fade-in");
        
        if(autoPlayInterval) resetProgressBar();
    }, 400);
}

function changeBackground(category) {
    // Fetches a random high-quality image based on the category
    const url = `https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&q=80`; // Default
    // In a real app, you'd use: `https://source.unsplash.com/1600x900/?${category}`
    // But for 2026 stability, we use a beautiful CSS gradient combined with nature vibes
    document.body.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('https://picsum.photos/1600/900?${category}')`;
}

function addQuoteToHistory(text, author) {
    history.unshift({ text, author });
    if (history.length > 10) history.pop();
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById("history-list");
    list.innerHTML = history.map(q => `
        <div class="history-item">
            <p>"${q.text}"</p>
            <small>— ${q.author}</small>
        </div>
    `).join("");
}

function toggleHistory() {
    document.getElementById("sidebar").classList.toggle("open");
}

function toggleAutoPlay() {
    const btn = document.getElementById("auto-btn");
    const progress = document.getElementById("progress-bar");
    
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        btn.classList.remove("active-btn");
        progress.style.width = "0%";
    } else {
        autoPlayInterval = setInterval(displayNewQuote, 5000);
        btn.classList.add("active-btn");
        showToast("Auto-Play ON");
    }
}

function resetProgressBar() {
    const progress = document.getElementById("progress-bar");
    progress.style.transition = "none";
    progress.style.width = "0%";
    setTimeout(() => {
        progress.style.transition = "width 5s linear";
        progress.style.width = "100%";
    }, 50);
}

function toggleFavorite() {
    const currentText = document.getElementById("quote").innerText;
    const index = favorites.indexOf(currentText);
    if (index === -1) {
        favorites.push(currentText);
        showToast("Saved to Favorites!");
    } else {
        favorites.splice(index, 1);
        showToast("Removed Favorite");
    }
    localStorage.setItem("favQuotes", JSON.stringify(favorites));
    updateFavIcon(currentText);
}

function updateFavIcon(text) {
    const icon = document.querySelector("#fav-btn i");
    icon.className = favorites.includes(text) ? "fas fa-heart" : "far fa-heart";
}

function searchQuotes() {
    const term = document.getElementById("searchInput").value.toLowerCase();
    filteredQuotes = allQuotes.filter(q => q.text.toLowerCase().includes(term) || q.author.toLowerCase().includes(term));
}

function filterQuotes() {
    const cat = document.getElementById("categoryFilter").value;
    filteredQuotes = (cat === "all") ? allQuotes : allQuotes.filter(q => q.category === cat);
    displayNewQuote();
}

function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
}

function speakQuote() {
    const msg = new SpeechSynthesisUtterance(document.getElementById("quote").innerText);
    window.speechSynthesis.speak(msg);
}

function copyQuote() {
    navigator.clipboard.writeText(document.getElementById("quote").innerText);
    showToast("Copied!");
}

function showToast(msg) {
    const t = document.getElementById("toast");
    t.innerText = msg; t.className = "show";
    setTimeout(() => t.className = "", 3000);
}

loadQuotes();