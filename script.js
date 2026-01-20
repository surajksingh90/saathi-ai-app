/* ================== GLOBAL STATE ================== */
let lastSpokenText = "";
let selectedVoice = null;

let userName = null;
let userMood = "normal"; // normal | happy | sad
let inactivityTimer = null;


/* ================== SPEECH RECOGNITION ================== */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.lang = "hi-IN";
recognition.continuous = false;
recognition.interimResults = false;

/* ================== VOICE LOAD FIX ================== */
window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};

/* ================== SPLASH & WELCOME ================== */
window.onload = function () {
  setTimeout(() => {
    document.getElementById("splash").classList.add("hidden");
    document.getElementById("welcome").classList.remove("hidden");
  }, 2500);
};

function startApp() {
  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");

  // 🟦 Saathi AI greeting message on start
  setTimeout(() => {
    const messages = document.getElementById("messages");

    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";

    const greeting = userName
      ? `Hi ${userName} 😊 main Saathi hoon. Aaj tum kaisa mehsoos kar rahe ho?`
      : "Hi 😊 main Saathi hoon. Aaj tum kaisa mehsoos kar rahe ho?";

    aiMsg.innerText = greeting;
    messages.appendChild(aiMsg);
    messages.scrollTop = messages.scrollHeight;

    speakText(greeting);

  }, 600);
}

/* ================== INPUT & ENTER SEND ================== */
const userInput = document.getElementById("userInput");

userInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
});

/* ================== MIC BUTTON ================== */
const micBtn = document.getElementById("micBtn");

micBtn.addEventListener("click", () => {
  recognition.start();
});

recognition.onresult = function (event) {
  const voiceText = event.results[0][0].transcript;
  userInput.value = voiceText;
  sendMessage();
};

recognition.onerror = function () {
  alert("Mic access allow karo bhai 🙏");
};

/* ================== HINDI → HINGLISH NORMALIZE ================== */
function normalizeHindi(text) {
  const map = {
    "अच्छा": "acha",
    "अच्छी": "acha",
    "अच्छा महसूस": "acha",
    "ठीक": "thik",
    "ठीक हूं": "thik",
    "बढ़िया": "badhiya",
    "खुश": "khush",
    "दुखी": "dukhi",
    "उदास": "sad",
    "बुरा": "bura"
  };

  let normalized = text;
  for (let key in map) {
    normalized = normalized.replaceAll(key, map[key]);
  }
  return normalized.toLowerCase();
}

/* ================== TYPING INDICATOR ================== */
function showTyping() {
  document.getElementById("typing").classList.remove("hidden");
}

function hideTyping() {
  document.getElementById("typing").classList.add("hidden");
}

/* ================== SEND MESSAGE ================== */
function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (text === "") return;

  const messages = document.getElementById("messages");

  // USER MESSAGE
  const userMsg = document.createElement("div");
  userMsg.className = "message user";
  userMsg.innerText = text;
  messages.appendChild(userMsg);

  input.value = "";

  /* ---------- MEMORY + EMOTION LOGIC ---------- */
  let reply = userName
    ? `Main yahin hoon ${userName} 🤍`
    : "Main yahin hoon 🤍";

  const lowerText = normalizeHindi(text);

  // NAME DETECTION (once)
  if (
    lowerText.startsWith("mera naam") ||
    lowerText.startsWith("my name is")
  ) {
    userName = text.split(" ").pop();
  }

  if (
    lowerText.includes("acha") ||
    lowerText.includes("accha") ||
    lowerText.includes("badhiya") ||
    lowerText.includes("khush")
  ) {
    userMood = "happy";
    reply = userName
      ? `Sunke achha laga ${userName} 🤗 aaj thoda halka feel ho raha hai kya?`
      : "Sunke achha laga 🤗 aaj thoda halka feel ho raha hai kya?";
  }
  else if (
    lowerText.includes("ajib") ||
    lowerText.includes("weird") ||
    lowerText.includes("samajh")
  ) {
    reply = "Samajh rahi hoon 🤍 kabhi-kabhi aisa lagta hai, tum akele nahi ho";
  }
  else if (
    lowerText.includes("dukhi") ||
    lowerText.includes("sad") ||
    lowerText.includes("bura") ||
    lowerText.includes("thik nahi")
  ) {
    userMood = "sad";
    reply = userName
      ? `Mujhe afsos hai ${userName} 😔 main tumhare saath hoon`
      : "Mujhe afsos hai tum aisa mehsoos kar rahe ho 😔 main tumhare saath hoon";
  }
  else if (
    lowerText === "ok" ||
    lowerText === "bas" ||
    lowerText === "fir"
  ) {
    reply = "Theek hai 🤍 jab mann ho tab baat kar lena, main yahin hoon";
  }

  /* ---------- AI TYPING + REPLY ---------- */
  showTyping();

  const delay = Math.floor(Math.random() * 800) + 800; // 800–1600ms

  setTimeout(() => {
    hideTyping();

    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";
    aiMsg.innerText = reply;
    messages.appendChild(aiMsg);
    messages.scrollTop = messages.scrollHeight;

    speakText(reply);
  }, delay);
  
  startInactivityTimer();

}

function startInactivityTimer() {
  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {
    const messages = document.getElementById("messages");

    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";
    aiMsg.innerText = "Main yahin hoon 🤍 sab theek hai?";
    messages.appendChild(aiMsg);
    messages.scrollTop = messages.scrollHeight;

    speakText("Main yahin hoon sab theek hai?");
  }, 30000); // 30 seconds
}


/* ================== AI VOICE ================== */
function speakText(text) {
  if (!("speechSynthesis" in window)) return;

  const cleanText = cleanTextForSpeech(text);
  if (cleanText === lastSpokenText) return;

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = "hi-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();

  if (!selectedVoice) {
    selectedVoice =
      voices.find(v => v.lang === "hi-IN" && v.name.toLowerCase().includes("female")) ||
      voices.find(v => v.lang === "hi-IN");
  }

  if (selectedVoice) utterance.voice = selectedVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  lastSpokenText = cleanText;
}

/* ================== EMOJI REMOVE ================== */
function cleanTextForSpeech(text) {
  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
    ""
  );
}
