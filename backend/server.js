// backend/server.js

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 8080;

// Middleware
app.use(cors());
app.use(express.json());

// Simple FD calculator (simple interest)
function calculateFd(amount, ratePercent, months) {
  const rate = ratePercent / 100;
  const years = months / 12;

  const interest = amount * rate * years;
  const maturity = amount + interest;

  return {
    amount: amount,
    interest: interest,
    maturity: maturity,
  };
}

// Hindi‑first explanations (no Punjabi)
function explainFdt(question) {
  if (!question || question.trim() === "") {
    return "कृपया अपना सवाल पूछें, जैसे फिक्स्ड डिपॉजिट (FD) की दर या टेन्योर के बारे में।";
  }

  const q = question.toLowerCase();

  if (q.includes("fd") || q.includes("jisdi") || q.includes("interest") || q.includes("rate") || q.includes("fixed deposit")) {
    return "फिक्स्ड डिपॉजिट (FD) एक सुरक्षित बचत विकल्प है जहां आप पैसे को एक निश्चित समय के लिए लॉक करते हैं। उदाहरण के लिए, 12 महीने के लिए 8.5% सालाना ब्याज का अर्थ है कि हर 100 रुपये पर आपको लगभग 8.5 रुपये ब्याज मिलेगा।";

  } else if (q.includes("kisan") || q.includes("farmer") || q.includes("kheti") || q.includes("farm")) {
    return "किसान फसल कटाई के बाद FD में अपनी आय रख सकते हैं। इस तरह पैसा सुरक्षित रहता है और ब्याज के साथ बढ़ता है, जब तक अगली फसल के लिए पैसे की जरूरत नहीं पड़ती।";

  } else if (q.includes("calculate") || q.includes("how much") || q.includes("kitna")) {
    return "आप FD की राशि, ब्याज दर और टेन्योर (महीने) दर्ज करके गणना कर सकते हैं। सिस्टम आपको बताएगा कि कितना ब्याज और कुल राशि मिलेगी।";

  } else {
    // English fallback for very unclear question
    return "This is a simple fixed deposit (FD) assistant. Ask about interest rates, tenure, or how FDs help farmers. You will get easy Hindi explanations.";
  }
}

// Routes

// POST /api/fd/calculate
app.post("/api/fd/calculate", (req, res) => {
  const { amount, rate, months } = req.body;

  if (
    typeof amount !== "number" ||
    typeof rate !== "number" ||
    typeof months !== "number"
  ) {
    return res.status(400).json({ error: "Invalid input" });
  }

  const result = calculateFd(amount, rate, months);
  res.json(result);
});

// POST /api/fd/explain
app.post("/api/fd/explain", (req, res) => {
  const { question } = req.body;

  const response = explainFdt(question);
  res.json({ response });
});

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Kisan FD backend is running 🚀" });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});