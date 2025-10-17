import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post("/api/chat", (req, res) => {
  const userMessage = req.body.message?.toLowerCase() || "";
  let reply = "I didn’t understand that.";

  if (userMessage.includes("hello")) {
    reply = "Hey there! 👋 How can I help you today?";
  } else if (userMessage.includes("bye")) {
    reply = "Goodbye! 👋 Have a great day!";
  } else if (userMessage.includes("your name")) {
    reply = "I’m Chatty — your friendly bot 🤖";
  }

  res.json({ reply });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ API running on port ${PORT}`));
