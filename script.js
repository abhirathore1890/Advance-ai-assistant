// 1. Configuration & Data
const assistantData = {
    "youtube": "https://youtube.com", "facebook": "https://facebook.com", "instagram": "https://instagram.com",
    "whatsapp": "https://web.whatsapp.com", "gmail": "https://mail.google.com", "github": "https://github.com",
    "amazon": "https://amazon.in", "flipkart": "https://flipkart.com", "maps": "https://maps.google.com"
};

const chat = document.getElementById("chat");
const inputField = document.getElementById("input");
const voiceBtn = document.getElementById("voice-btn");
const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;

// --- 2. Smart UI Functions ---
function addMessage(text, cls, isImage = false) {
    let msg = isImage ? document.createElement("img") : document.createElement("p");
    msg.className = isImage ? "bot-img" : cls;
    
    if (isImage) {
        msg.src = text;
        msg.loading = "lazy";
        msg.onclick = () => window.open(text);
    } else {
        msg.innerText = text;
    }
    
    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

function speak(text) {
    window.speechSynthesis.cancel();
    let speech = new SpeechSynthesisUtterance(text);
    speech.lang = "hi-IN";
    speech.pitch = 1.1; 
    speech.rate = 1;
    window.speechSynthesis.speak(speech);
}

// --- 3. Advanced Engine (The Brain) ---
async function getReply(message) {
    message = message.toLowerCase().trim();

    // 🌐 Online/Offline Check
    if (!navigator.onLine) return "Aapka internet off hai. Kripya connection check karein.";

    // 📸 AI Image Generation
    if (message.includes("photo") || message.includes("generate")) {
        let prompt = message.replace("photo", "").replace("generate", "").replace("banao", "").trim();
        if(!prompt) prompt = "beautiful landscape";
        const imgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true`;
        addMessage(`Theek hai, ${prompt} ki tasveer bana rahi hoon...`, "bot");
        addMessage(imgUrl, "bot", true);
        return "Ye rahi aapki image!";
    }

    // 🌡️ Weather Logic
    if (message.includes("weather") || message.includes("mausam")) {
        let city = message.replace("weather", "").replace("mausam", "").replace("kaisa hai", "").trim();
        if(!city) city = "Delhi";
        window.open(`https://www.google.com/search?q=weather+in+${city}`);
        return `${city} ka mausam check kar rahi hoon.`;
    }

    // 📰 News Logic
    if (message.includes("news") || message.includes("khabar")) {
        window.open("https://news.google.com");
        return "Aaj ki mukhya khabrein ye rahi.";
    }

    // 🔋 Battery status (Advanced)
    if (message.includes("battery")) {
        const battery = await navigator.getBattery();
        let status = battery.charging ? "charging par hai" : "charging par nahi hai";
        return `Aapki device battery ${Math.round(battery.level * 100)}% hai aur wo ${status}.`;
    }

    // 📍 Real-time Location
    if (message.includes("location") || message.includes("kahan hoon")) {
        return new Promise(resolve => {
            navigator.geolocation.getCurrentPosition(
                p => resolve(`Aap abhi Lat: ${p.coords.latitude.toFixed(2)}, Long: ${p.coords.longitude.toFixed(2)} par hain.`),
                () => resolve("Maaf kijiye, mujhe location permission nahi mili.")
            );
        });
    }

    // 🔢 Calculator (Smart eval)
    if (/[0-9]/.test(message) && (message.includes("+") || message.includes("-") || message.includes("*") || message.includes("/"))) {
        try {
            let res = eval(message.replace(/[^-()\d/*+.]/g, ''));
            return `Iska calculation hai: ${res}`;
        } catch (e) { return "Calculation me galti ho gayi."; }
    }

    // 📝 Memory (To-Do & Name)
    if (message.includes("mera naam")) return "Aapka naam Sia hai, aapne hi bataya tha!";
    if (message.includes("yaad dilao")) {
        let task = message.replace("yaad dilao", "").trim();
        let tasks = JSON.parse(localStorage.getItem("sia_tasks")) || [];
        tasks.push(task);
        localStorage.setItem("sia_tasks", JSON.stringify(tasks));
        return `Theek hai Sia, maine list me add kar diya: ${task}`;
    }

    // 🌐 Web Shortcuts
    for (let key in assistantData) {
        if (message.includes("open " + key) || message === key) {
            window.open(assistantData[key]);
            return `${key.toUpperCase()} khul gaya hai.`;
        }
    }

    // 🔍 Google Search (Fallback)
    if (message.includes("search") || message.includes("google")) {
        let q = message.replace("search", "").replace("google", "").trim();
        window.open(`https://www.google.com/search?q=${q}`);
        return `Google par ${q} dhoond rahi hoon.`;
    }

    // Greetings
    if (message.includes("hello") || message.includes("hi")) return "Hello Sia! Main aapki kaise madad kar sakti hoon?";
    if (message.includes("time") || message.includes("samay")) return `Abhi ${new Date().toLocaleTimeString()} ho rahe hain.`;

    return "Maaf kijiye Sia, main ise samajh nahi paayi. Kya main iska Google search karoon?";
}

// --- 4. Controller Functions ---
async function sendMessage() {
    let text = inputField.value.trim();
    if (!text) return;

    addMessage(text, "user");
    inputField.value = "";

    let reply = await getReply(text);
    if (reply) {
        setTimeout(() => {
            addMessage(reply, "bot");
            speak(reply);
        }, 600);
    }
}

function startVoice() {
    if (!SpeechRecognition) return alert("Aapka browser voice support nahi karta.");
    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";
    rec.onstart = () => { voiceBtn.style.transform = "scale(1.2)"; voiceBtn.style.boxShadow = "0 0 15px red"; };
    rec.onresult = (e) => { inputField.value = e.results[0][0].transcript; sendMessage(); };
    rec.onend = () => { voiceBtn.style.transform = "scale(1)"; voiceBtn.style.boxShadow = "none"; };
    rec.start();
}

// Enter key trigger
inputField.addEventListener("keypress", (e) => { if (e.key === "Enter") sendMessage(); });
