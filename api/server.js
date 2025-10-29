import app from "./src/app.js";
import groqService from "./src/services/groqService.js";

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ AI Chatbot API running on port ${PORT}`);
  console.log(
    `🤖 Groq integration: ${groqService.isConfigured() ? "Enabled" : "Disabled (set GROQ_API_KEY)"}`,
  );
  console.log(`📝 Model: ${groqService.getStatus().model}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
});
