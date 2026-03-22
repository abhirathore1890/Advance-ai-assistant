const assistantData = {
    "youtube": "https://youtube.com", "facebook": "https://facebook.com", "instagram": "https://instagram.com",
    "whatsapp": "https://web.whatsapp.com", "gmail": "https://mail.google.com"
};

const chat = document.getElementById("chat");
const inputField = document.getElementById("input");
const voiceBtn = document.getElementById("voice-btn");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const activationRecognition = new SpeechRecognition();

// --- 1. Core UI Functions ---
function addMessage(text, cls, isImage = false) {
    let msg = isImage ? document.createElement("img") : document.createElement("p");
    msg.className = isImage ? "bot-img" : cls;
    if(isImage) { msg.src = text; msg.onclick = () => window.open(text); }
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

// --- 2. Advanced Features Logic ---
async function getReply(message) {
    message = message.toLowerCase().trim();

    // 📸 Image Generation
    if (message.includes("generate image") || message.includes("photo banao")) {
        let prompt = message.replace("generate image", "").replace("photo banao", "").trim();
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${Math.random()}`;
        addMessage(`AI ${prompt} ki photo bana rahi hoon...`, "bot");
        addMessage(imgUrl, "bot", true);
        speak("Ye dekhiye aapki image.");
        return null;
    }

    // 🔋 Battery Status
    if (message.includes("battery")) {
        const battery = await navigator.getBattery();
        return `Aapki device battery ${Math.round(battery.level * 100)}% hai.`;
    }

    // 📍 Location
    if (message.includes("location") || message.includes("kahan hoon")) {
        return new Promise(resolve => navigator.geolocation.getCurrentPosition(p => 
            resolve(`Aap Lat: ${p.coords.latitude.toFixed(2)}, Long: ${p.coords.longitude.toFixed(2)} par hain.`)));
    }

    // 🧹 Clear Chat
    if (message.includes("clear chat") || message.includes("sab delete")) {
        chat.innerHTML = "";
        return "Chat history saaf kar di gayi hai.";
    }

    // 📝 To-Do List
    if (message.includes("yaad dilao")) {
        let task = message.replace("yaad dilao", "").trim();
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(task);
        localStorage.setItem("tasks", JSON.stringify(tasks));
        return `Theek hai, maine yaad rakha: ${task}`;
    }

    // 🌐 Web Search & Shortcuts
    for (let key in assistantData) {
        if (message.includes("open " + key)) { window.open(assistantData[key]); return key + " khol rahi hoon."; }
    }

    if (message.includes("google") || message.includes("search")) {
        window.open(`https://www.google.com/search?q=${message.replace("search","").replace("google","")}`);
        return "Google par search kar rahi hoon.";
    }

    // 🕒 Time
    if (message.includes("time") || message.includes("samay")) return "Abhi " + new Date().toLocaleTimeString() + " hain.";

    return "Maaf kijiye, main ye samajh nahi paayi. Kya main Google search karoon?";
}

// --- 3. Voice & Wake Word Logic ---
function initSia() {
    activationRecognition.continuous = true;
    activationRecognition.lang = "en-US";
    activationRecognition.start();
    activationRecognition.onresult = (e) => {
        let transcript = e.results[e.results.length - 1][0].transcript.toLowerCase();
        if(transcript.includes("sia")) {
            speak("Ji, sun rahi hoon.");
            setTimeout(startManualVoice, 1000);
        }
    };
}

function startManualVoice() {
    const recognition = new SpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.onstart = () => voiceBtn.style.background = "red";
    recognition.onresult = (e) => {
        inputField.value = e.results[0][0].transcript;
        sendMessage();
    };
    recognition.onend = () => voiceBtn.style.background = "";
    recognition.start();
}

async function sendMessage() {
    let text = inputField.value.trim();
    if (!text) return;
    addMessage(text, "user");
    inputField.value = "";
    let reply = await getReply(text);
    if(reply) { addMessage(reply, "bot"); speak(reply); }
}
