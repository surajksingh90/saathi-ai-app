/* ================== GLOBAL STATE ================== */

let selectedVoice = null;
let userName = null;
let userMood = "normal";
let inactivityTimer = null;


/* ================== SPEECH RECOGNITION ================== */

const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();

recognition.lang = "hi-IN";
recognition.continuous = false;
recognition.interimResults = false;


/* ================== LOAD VOICES ================== */

window.speechSynthesis.onvoiceschanged = () => {
  window.speechSynthesis.getVoices();
};


/* ================== SPLASH SCREEN ================== */

window.onload = () => {

  setTimeout(() => {

    document.getElementById("splash").classList.add("hidden");
    document.getElementById("welcome").classList.remove("hidden");

  }, 2500);

};


/* ================== START APP ================== */

function startApp() {

  document.getElementById("welcome").classList.add("hidden");
  document.getElementById("chat").classList.remove("hidden");

  setTimeout(() => {

    const greeting =
      userName
        ? `Hi ${userName} 😊 main Saathi hoon. Aaj tum kaisa mehsoos kar rahe ho?`
        : "Hi 😊 main Saathi hoon. Aaj tum kaisa mehsoos kar rahe ho?";

    addMessage(greeting, "ai");
    speakText(greeting);

  }, 600);

}


/* ================== ENTER SEND ================== */

const userInput = document.getElementById("userInput");

userInput.addEventListener("keydown", (event) => {

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

recognition.onresult = (event) => {

  const voiceText = event.results[0][0].transcript;

  userInput.value = voiceText;

  sendMessage();

};

recognition.onerror = () => {

  alert("Mic access allow karo 🙏");

};


/* ================== HINDI NORMALIZE ================== */

function normalizeHindi(text) {

  const map = {

    "अच्छा": "acha",
    "अच्छी": "acha",
    "ठीक": "thik",
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


/* ================== SEND MESSAGE ================== */

function sendMessage() {

  const input = document.getElementById("userInput");
  const text = input.value.trim();

  if (text === "") return;

  addMessage(text, "user");

  input.value = "";

  const lowerText = normalizeHindi(text);

  let reply = "Main yahin hoon 🤍";


  /* NAME DETECT */

  if (
    lowerText.startsWith("mera naam") ||
    lowerText.startsWith("my name is")
  ) {

    userName = text.split(" ").pop();

  }


  /* MOOD DETECT */

  if (
    lowerText.includes("acha") ||
    lowerText.includes("badhiya") ||
    lowerText.includes("khush")
  ) {

    userMood = "happy";

    reply =
      userName
        ? `Sunke achha laga ${userName} 🤗`
        : "Sunke achha laga 🤗";

  }

  else if (
    lowerText.includes("dukhi") ||
    lowerText.includes("sad") ||
    lowerText.includes("bura")
  ) {

    userMood = "sad";

    reply =
      userName
        ? `Mujhe afsos hai ${userName} 😔 main tumhare saath hoon`
        : "Mujhe afsos hai 😔 main tumhare saath hoon";

  }


  setTimeout(() => {

    addMessage(reply, "ai");
    speakText(reply);

    saveMessage(text, reply);

  }, 800);

  startInactivityTimer();

}


/* ================== ADD MESSAGE ================== */

function addMessage(text, sender) {

  const chat = document.getElementById("messages");

  const msg = document.createElement("div");

  msg.className = "message " + sender;
  msg.innerText = text;

  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

}


/* ================== INACTIVITY MESSAGE ================== */

function startInactivityTimer() {

  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {

    const msg = "Main yahin hoon 🤍 sab theek hai?";

    addMessage(msg, "ai");
    speakText(msg);

  }, 30000);

}


/* ================== AI VOICE ================== */

function speakText(text) {

  if (!("speechSynthesis" in window)) return;

  const cleanText = text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
    ""
  );

  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.lang = "hi-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();

  if (!selectedVoice) {

    selectedVoice = voices.find(v => v.lang === "hi-IN");

  }

  if (selectedVoice) utterance.voice = selectedVoice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

}


/* ================== FIREBASE SAVE ================== */

async function saveMessage(userText, aiText) {

  if (!window.db) return;

  const { collection, addDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
  );

  try {

    await addDoc(collection(window.db, "chats"), {

      user: userText,
      ai: aiText,
      mood: userMood,
      timestamp: new Date()

    });

    console.log("Chat saved");

  }

  catch (error) {

    console.error("Save error:", error);

  }

}