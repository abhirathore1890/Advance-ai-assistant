// Assistant Data
const assistantData = {
    "youtube": "https://youtube.com", "facebook": "https://facebook.com", "instagram": "https://instagram.com",
    "whatsapp": "https://web.whatsapp.com", "gmail": "https://mail.google.com", "github": "https://github.com"
};

const chat = document.getElementById("chat");
const inputField = document.getElementById("input");
const voiceBtn = document.getElementById("voice-btn");
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

function addMessage(text, cls, isImage = false) {
    let msg = isImage ? document.createElement("img") : document.createElement("p");
    msg.className = isImage ? "bot-img" : cls;
    if (isImage) { msg.src = text; msg.onclick = () => window.open(text); }
    else { msg.innerText = text; }
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
    window.speechSynthesis.cancel();
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    window.speechSynthesis.speak(speech);
}

async function getReply(message) {
    message = message.toLowerCase().trim();

    // Features: Image, Battery, Location, Math, Search
    if (message.includes("photo") || message.includes("generate")) {
        let p = message.replace("photo","").replace("generate","").trim() || "AI Art";
        const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(p)}?nologo=true`;
        addMessage(`Theek hai Sia, ${p} bana rahi hoon...`, "bot");
        addMessage(url, "bot", true);
        return "Ye rahi aapki image!";
    }

    if (message.includes("battery")) {
        const b = await navigator.getBattery();
        return `Aapki battery ${Math.round(b.level * 100)}% hai.`;
    }

    if (message.includes("location")) {
        return new Promise(res => navigator.geolocation.getCurrentPosition(p => 
            res(`Aap Lat: ${p.coords.latitude.toFixed(2)} par hain.`)));
    }

    for (let key in assistantData) {
        if (message.includes("open " + key)) { window.open(assistantData[key]); return key + " khol rahi hoon."; }
    }

    if (message.includes("hi") || message.includes("hello")) return "Hello Sia! Main taiyaar hoon.";
    if (message.includes("time")) return "Abhi " + new Date().toLocaleTimeString() + " ho rahe hain.";

    return "Maaf kijiye, main ye samajh nahi paayi. Kya main Google search karoon?";
}

async function sendMessage() {
    let text = inputField.value.trim();
    if (!text) return;
    addMessage(text, "user");
    inputField.value = "";
    let reply = await getReply(text);
    if(reply) { setTimeout(() => { addMessage(reply, "bot"); speak(reply); }, 600); }
}

function handleEnter(e) { if (e.key === "Enter") sendMessage(); }

function startVoice() {
    if (!SpeechRecognition) return alert("Browser support nahi karta.");
    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";
    rec.onstart = () => voiceBtn.style.background = "red";
    rec.onresult = (e) => { inputField.value = e.results[0][0].transcript; sendMessage(); };
    rec.onend = () => voiceBtn.style.background = "#10b981";
    rec.start();
}
