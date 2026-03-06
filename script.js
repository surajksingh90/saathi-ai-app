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


/* ================== SPLASH SCREEN ================== */

window.onload = function () {

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

    const messages = document.getElementById("messages");

    const greeting =
      userName
        ? `Hi ${userName} 😊 main Saathi hoon. Aaj tum kaisa mehsoos kar rahe ho?`
        : "Hi 😊 main Saathi hoon. Aaj tum kaisa mehsoos kar rahe ho?";

    const aiMsg = document.createElement("div");
    aiMsg.className = "message ai";
    aiMsg.innerText = greeting;

    messages.appendChild(aiMsg);
    messages.scrollTop = messages.scrollHeight;

    speakText(greeting);

  }, 600);

}


/* ================== INPUT + ENTER SEND ================== */

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

  alert("Mic access allow karo 🙏");

};


/* ================== NORMALIZE HINDI ================== */

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


/* ================== TYPING ================== */

function showTyping() {

  document.getElementById("typing").classList.remove("hidden");

}

function hideTyping() {

  document.getElementById("typing").classList.add("hidden");

}


/* ================== SEND MESSAGE ================== */


function sendMessage() {

  let input = document.getElementById("userInput");
  let text = input.value;

  if (text === "") return;

  addMessage(text, "user");

  input.value = "";

  let aiReply = "Main yahin hoon 🤍";

  setTimeout(() => {

    addMessage(aiReply, "ai");

    saveMessage(text, aiReply);

  }, 1000);

}

function addMessage(text, sender) {

  let chat = document.getElementById("messages");

  let msg = document.createElement("div");
  msg.className = "message " + sender;

  msg.innerText = text;

  chat.appendChild(msg);

  chat.scrollTop = chat.scrollHeight;

}

/*
function sendMessage() {

  const input = document.getElementById("userInput");
  const text = input.value.trim();

  if (text === "") return;

  const messages = document.getElementById("messages");

  const userMsg = document.createElement("div");

  userMsg.className = "message user";
  userMsg.innerText = text;

  messages.appendChild(userMsg);

  messages.scrollTop = messages.scrollHeight;

  input.value = "";

  saveMessage(userName, text, userMood);


  let reply =
    userName
      ? `Main yahin hoon ${userName} 🤍`
      : "Main yahin hoon 🤍";

  const lowerText = normalizeHindi(text);


  if (
    lowerText.startsWith("mera naam") ||
    lowerText.startsWith("my name is")
  ) {

    userName = text.split(" ").pop();

  }

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

  showTyping();

  setTimeout(() => {

    hideTyping();

    const aiMsg = document.createElement("div");

    aiMsg.className = "message ai";
    aiMsg.innerText = reply;

    messages.appendChild(aiMsg);

    messages.scrollTop = messages.scrollHeight;

    speakText(reply);

  }, 1000);

  startInactivityTimer();

}     */


/* ================== INACTIVITY ================== */

function startInactivityTimer() {

  clearTimeout(inactivityTimer);

  inactivityTimer = setTimeout(() => {

    const messages = document.getElementById("messages");

    const aiMsg = document.createElement("div");

    aiMsg.className = "message ai";
    aiMsg.innerText = "Main yahin hoon 🤍 sab theek hai?";

    messages.appendChild(aiMsg);

    messages.scrollTop = messages.scrollHeight;

    speakText("Main yahin hoon sab theek hai");

  }, 30000);

}


/* ================== AI VOICE ================== */

function speakText(text) {

  if (!("speechSynthesis" in window)) return;

  const cleanText = cleanTextForSpeech(text);

  const utterance = new SpeechSynthesisUtterance(cleanText);

  utterance.lang = "hi-IN";
  utterance.rate = 0.9;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();

  if (!selectedVoice) {

    selectedVoice =
      voices.find(v => v.lang === "hi-IN");

  }

  if (selectedVoice) utterance.voice = selectedVoice;

  window.speechSynthesis.cancel();

  window.speechSynthesis.speak(utterance);

}


/* ================== REMOVE EMOJI ================== */

function cleanTextForSpeech(text) {

  return text.replace(
    /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])+/g,
    ""
  );

}


/* ================== FIREBASE SAVE ================== */

async function saveMessage(userName, message, mood) {

  if (!window.db) return;

  const { collection, addDoc } = await import(
    "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js"
  );

  try {

    await addDoc(collection(window.db, "chats"), {

      user: userName || "Anonymous",
      text: message,
      mood: mood,
      timestamp: new Date()

    });

    console.log("Chat Saved");

  } catch (error) {

    console.error("Save Error:", error);

  }

}

import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

async function saveMessage(userText, aiText) {

  try {

    await addDoc(collection(db, "chats"), {
      user: userText,
      ai: aiText,
      timestamp: new Date()
    });

    console.log("Chat saved");

  } catch (e) {
    console.error("Error saving chat", e);
  }

}