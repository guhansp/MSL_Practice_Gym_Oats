import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import sessionsRoutes from "./routes/sessions.js";
import dataRoutes from "./routes/data.js";
import goalsRoutes from "./routes/goals.js";
import responsesRoutes from "./routes/responses.js";
import conversationRoutes from "./routes/conversations.js";
// import pool from "./routes/db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "DNATE MSL Practice Gym API Running",
    version: "1.0.0",
    status: "healthy",
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: "/api/auth",
      sessions: "/api/sessions",
      data: "/api/data",
      goals: "/api/goals",
      responses: "/api/responses",
      conversation: "/api/conversation"
    }
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/data", dataRoutes);
app.use("/api/goals", goalsRoutes);
app.use("/api/responses", responsesRoutes);
app.use("/api/conversation", conversationRoutes);


app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("DNATE MSL Practice Gym API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT);
