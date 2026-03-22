// 1. Links ki Dictionary
const assistantData = {
    "youtube": "https://youtube.com", "facebook": "https://facebook.com", "instagram": "https://instagram.com",
    "twitter": "https://twitter.com", "linkedin": "https://linkedin.com", "whatsapp": "https://web.whatsapp.com",
    "snapchat": "https://snapchat.com", "reddit": "https://reddit.com", "pinterest": "https://pinterest.com",
    "gmail": "https://mail.google.com", "drive": "https://drive.google.com", "maps": "https://maps.google.com",
    "calendar": "https://calendar.google.com", "photos": "https://photos.google.com", "amazon": "https://amazon.in",
    "flipkart": "https://flipkart.com", "wikipedia": "https://wikipedia.org", "github": "https://github.com"
};

const chat = document.getElementById("chat");

function addMessage(text, cls) {
    let msg = document.createElement("p");
    msg.className = cls;
    msg.innerText = text;
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    window.speechSynthesis.speak(speech);
}

function getReply(message) {
    message = message.toLowerCase().trim();

    // Direct Website Shortcuts
    for (let key in assistantData) {
        if (message === key || message.includes("open " + key)) {
            window.open(assistantData[key]);
            return key.toUpperCase() + " khol rahi hoon.";
        }
    }

    // Greetings
    if (message.includes("hi") || message.includes("hello") || message.includes("नमस्ते")) return "नमस्ते! मैं Sia AI Assistant हूँ।";
    if (message.includes("suprabhat") || message.includes("good morning")) return "Suprabhat! Aapka din mangalmay ho.";

    // Math Logic
    if (/[0-9]/.test(message) && (message.includes("+") || message.includes("-") || message.includes("*") || message.includes("/"))) {
        try {
            let calc = message.replace(/[^-()\d/*+.]/g, ''); 
            return "Iska jawab hai: " + eval(calc);
        } catch (e) { return "Math thoda mushkil hai, firse puchiye."; }
    }

    // Search Logic (Maps/Google)
    if (message.includes("map") || message.includes("rasta")) {
        let place = message.replace("map", "").replace("rasta", "").replace("dikhao", "").trim();
        window.open(`https://www.google.com/maps/search/${place}`);
        return place ? place + " ka rasta dikha rahi hoon." : "Google Maps khol rahi hoon.";
    }

    if (message.includes("search") || message.includes("google")) {
        let query = message.replace("search", "").replace("google", "").trim();
        window.open("https://www.google.com/search?q=" + query);
        return "Google par search kar rahi hoon: " + query;
    }

    if (message.includes("समय") || message.includes("time")) {
        return "अभी समय है " + new Date().toLocaleTimeString();
    }

    return "Maaf kijiye, main ye samajh nahi paaya. Kya aap kuch aur puchna chahenge?";
}

function sendMessage() {
    let input = document.getElementById("input");
    let text = input.value.trim();
    if (text !== "") {
        addMessage(text, "user");
        let reply = getReply(text);
        setTimeout(() => { 
            addMessage(reply, "bot"); 
            speak(reply); 
        }, 500);
        input.value = "";
    }
}

function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        addMessage("Browser voice support nahi karta.", "bot");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    const voiceBtn = document.getElementById("voice-btn");

    recognition.onstart = () => {
        if(voiceBtn) voiceBtn.style.backgroundColor = "red";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById("input").value = transcript;
        sendMessage();
    };

    recognition.onerror = () => {
