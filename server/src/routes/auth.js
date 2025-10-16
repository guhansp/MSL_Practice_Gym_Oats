import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, organization } =
      req.body;

    if (!email || !password || !first_name || !last_name)
      return res.status(400).json({ message: "Missing required fields" });

    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [
      email,
    ]);
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "User already exists" });

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const result = await pool.query(
      `INSERT INTO users (
        email,
        password_hash,
        first_name,
        last_name,
        role,
        organization,
        email_verified
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, email, first_name, last_name, role, organization, created_at`,
      [
        email,
        hash,
        first_name,
        last_name,
        role || "msl",
        organization || "DNATE Practice Gym",
        false,
      ]
    );

    const user = result.rows[0];

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [
      email,
    ]);
    if (userResult.rows.length === 0)
      return res.status(400).json({ message: "Invalid credentials" });

    const user = userResult.rows[0];        
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ user_id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
