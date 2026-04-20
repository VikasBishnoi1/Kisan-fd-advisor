const messagesEl = document.getElementById("messages");
const listenBtn = document.getElementById("listenBtn");
const explainBtn = document.getElementById("explainBtn");
const amountInput = document.getElementById("amount");
const rateInput = document.getElementById("rate");
const monthsInput = document.getElementById("months");
const calcBtn = document.getElementById("calcBtn");
const resultEl = document.getElementById("result");

function addMessage(text, isUser = false) {
  const msg = document.createElement("p");
  msg.textContent = text;
  msg.style.padding = "8px 10px";
  msg.style.margin = "4px 0";
  msg.style.borderRadius = "8px";
  msg.style.fontSize = "14px";

  if (isUser) {
    msg.style.backgroundColor = "#d1ecf1";
    msg.style.textAlign = "right";
  } else {
    msg.style.backgroundColor = "#f8f9fa";
    msg.style.textAlign = "left";
  }

  messagesEl.appendChild(msg);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

// Voice input (Hindi or English)
if ("SpeechRecognition" in window || "webkitSpeechRecognition" in window) {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Hindi input (change to en-IN for English-only input)
  recognition.lang = "hi-IN";      // Hindi
  // recognition.lang = "en-IN";   // uncomment to use English only

  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    const transcript = event.results[0][0].transcript.trim();
    addMessage("🎤 आपने कहा: " + transcript, true);

    // Send to backend for FD explanation (local backend)
    fetch("https://kisan-fd-advisor-1.onrender.com/api/fd/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: transcript }),
    })
      .then((res) => res.json())
      .then((data) => {
        addMessage("🧠 सलाहकार: " + data.response);
        speakText(data.response);
      })
      .catch((err) => addMessage("❌ त्रुटि: " + err.message));
  };

  recognition.onerror = (event) => {
    addMessage("🔊 आवाज़ त्रुटि: " + event.error);
  };

  listenBtn.addEventListener("click", () => {
    listenBtn.disabled = true;
    listenBtn.textContent = "🎙️ सुन रहा हूँ...";
    recognition.start();
  });

  recognition.onend = () => {
    listenBtn.disabled = false;
    listenBtn.textContent = "🎙️ आवाज़ सुनें";
  };
} else {
  listenBtn.disabled = true;
  listenBtn.textContent = "🎤 माइक्रोफोन समर्थित नहीं";
}

// Speak text using browser TTS (English only)
function speakText(text) {
  if ("speechSynthesis" in window) {
    const utter = new SpeechSynthesisUtterance(text);

    // TTS in English (more reliable)
    utter.lang = "en-US";

    // Optional: use hi-IN if you tested on your device:
    // utter.lang = "hi-IN";

    utter.rate = 0.9;
    speechSynthesis.speak(utter);
  }
}

// Example explanation button (Hindi)
explainBtn.addEventListener("click", () => {
  const example =
    "फिक्स्ड डिपॉजिट (FD) 12 महीने के लिए 8.5% ब्याज दर के साथ €10,000 लगाने पर लगभग ₹850 ब्याज मिलेगा। यह किसानों के लिए फसल कटाई के बाद सुरक्षित बचत का एक अच्छा तरीका है।";
  addMessage("💡 उदाहरण: " + example);
  speakText(example);
});

// Manual FD calculation (calls backend)
calcBtn.addEventListener("click", () => {
  const amount = parseFloat(amountInput.value);
  const rate = parseFloat(rateInput.value);
  const months = parseFloat(monthsInput.value);

  if (isNaN(amount) || isNaN(rate) || isNaN(months)) {
    resultEl.textContent = "कृपया मान्य संख्या दर्ज करें।";
    return;
  }

  // Send to backend for FD calculation (local backend)
  fetch("https://kisan-fd-advisor-1.onrender.com/api/fd/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, rate, months }),
  })
    .then((res) => res.json())
    .then((data) => {
      resultEl.innerHTML = `
        <p>निवेश: ₹${data.amount.toFixed(2)}</p>
        <p>ब्याज: ₹${data.interest.toFixed(2)}</p>
        <p>कुल मैच्योरिटी: ₹${data.maturity.toFixed(2)}</p>
      `;
    })
    .catch((err) => (resultEl.textContent = "❌ त्रुटि: " + err.message));
});