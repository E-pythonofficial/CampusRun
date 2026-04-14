import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Import your Routes
import authRoutes from "./routes/auth.js";

// --- INITIALIZE CONFIG ---
dotenv.config();
const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- 2. AUTO-CREATE UPLOADS FOLDER ---
const uploadDir = path.join(__dirname, "uploads"); // Simpler pathing
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
    console.log("📁 Created missing uploads directory");
}

// --- 3. MIDDLEWARES ---
app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:8080", 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// These handle standard JSON/URL-encoded requests
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// --- 4. STATIC FOLDERS ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- 5. ROUTES ---
app.use("/api/auth", authRoutes);

// Root Health Check
app.get("/", (req, res) => {
  res.status(200).json({ 
    message: "Campus Run API is running 🚀",
    timestamp: new Date().toISOString()
  });
});

// --- 6. GLOBAL ERROR HANDLING ---
app.use((err, req, res, next) => {
  console.error(`❌ Error: ${err.message}`);
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

// CHANGE: Added '0.0.0.0' to allow network-wide access
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server is live on:`);
  console.log(`   🏠 Local:   http://localhost:${PORT}`);
  console.log(`   📱 Network: http://localhost:${PORT}`); 
});