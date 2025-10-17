import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import routes from "./routes/index.js";

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", routes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: "Internal server error",
    message: "Something went wrong on our end"
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Not found",
    message: "The requested resource was not found"
  });
});

export default app;
