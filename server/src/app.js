import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import questionsRoutes from "./routes/questions.js";



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/questions", questionsRoutes);

app.get("/", (req, res) => res.send("DNATE MSL Practice Gym API Running"));

const PORT = process.env.PORT || 5000;
app.listen(PORT);
