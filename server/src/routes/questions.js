import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    
    const filePath = path.resolve("data/questions.json");
    
    const fileData = fs.readFileSync(filePath, "utf8");
    const questions = JSON.parse(fileData);
    
    res.status(200).json({
      message: "Questions loaded successfully",
      total: questions.questions.length,
      data: questions.questions
    });
  } catch (err) {
    console.error("Error reading questions.json:", err);
    res.status(500).json({ message: "Failed to load questions file" });
  }
});

router.get("/:id", (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }
    const filePath = path.resolve("data/questions.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const questions = JSON.parse(fileData);
    const question = questions.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }
    res.status(200).json({
      message: "Question loaded successfully",
      data: question
    });
}




catch (err) {
    console.error("Error reading questions.json:", err);
    res.status(500).json({ message: "Failed to load questions file" });
  }
});



router.get("/:id/personas", (req, res) => {
  try {
    const questionId = parseInt(req.params.id, 10);
    if (isNaN(questionId)) {
      return res.status(400).json({ message: "Invalid question ID" });
    }    
    const filePath = path.resolve("data/questions.json");
    const fileData = fs.readFileSync(filePath, "utf8");
    const questions = JSON.parse(fileData);    
    const question = questions.questions.find(q => q.id === questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }   
    res.status(200).json({
      message: "Persona IDs retrieved successfully",
      personas: question.persona  
    });
  } catch (err) {
    console.error("Error loading question personas:", err);
    res.status(500).json({ message: "Failed to load question personas" });
  }
});



export default router;
