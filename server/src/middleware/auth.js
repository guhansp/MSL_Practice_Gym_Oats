import jwt from "jsonwebtoken";

export function verifyToken(req, res, next) {
  try {
    
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: "Missing Authorization header" });    }

   
    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Token not provided" });    }

   
    const decoded = jwt.verify(token, process.env.JWT_SECRET);   
    req.user = decoded;    
    next();
  } catch (err) {
    console.error("verifyToken error:", err.message);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
