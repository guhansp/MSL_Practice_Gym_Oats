// ----------------------
// DNATE MSL Practice Gym Backend
// ----------------------

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Route imports
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import questionsRoutes from "./routes/questions.js";
import sessionsRoutes from "./routes/sessions.js";
import dataRoutes from "./routes/data.js";
import goalsRoutes from "./routes/goals.js";
import responsesRoutes from "./routes/responses.js";
import conversationRoutes from "./routes/conversations.js";

// ----------------------
// 🔧 Environment Setup
// ----------------------
dotenv.config({ path: "./.env" }); // ✅ Proper .env import

// ----------------------
// ⚙️ Express App Setup
// ----------------------
const app = express();

const PORT = process.env.PORT || 3001;
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: ORIGIN, credentials: true }));
app.use(express.json());

// ----------------------
// 🩺 Health Check
// ----------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Server is healthy and running 🚀" });
});

// ----------------------
// 🌐 Root Info Endpoint
// ----------------------
app.get("/", (req, res) => {
  res.json({
    message: "DNATE MSL Practice Gym API Running",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      dashboard: "/api/dashboard",
      questions: "/api/questions",
      sessions: "/api/sessions",
      data: "/api/data",
      goals: "/api/goals",
      responses: "/api/responses",
      conversation: "/api/conversation",
      health: "/api/health",
    },
  });
});

// ----------------------
// 📦 API Routes
// ----------------------
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/responses", responsesRoutes);
app.use("/api/conversation", conversationRoutes);

// ----------------------
// 🚀 Start Server
// ----------------------
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
  console.log(`🌍 CORS Origin: ${ORIGIN}`);
});