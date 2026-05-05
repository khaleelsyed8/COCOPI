require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const morgan      = require("morgan");
const rateLimit   = require("express-rate-limit");
const connectDB   = require("./config/db");

/* ─────────────────────────────────────────
   CONNECT TO MONGODB ATLAS
───────────────────────────────────────── */
connectDB();

const app = express();

/* ─────────────────────────────────────────
   SECURITY & PARSING MIDDLEWARE
───────────────────────────────────────── */

/* CORS — only allow requests from the React frontend */
app.use(cors({
  origin: process.env.CLIENT_URL || ["http://192.168.1.5:3000", "http://localhost:3000"],
  credentials: true,
}));

/* Parse JSON bodies — limit size to prevent payload attacks */
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

/* HTTP request logger — only in development */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

/* ─────────────────────────────────────────
   RATE LIMITING
   Prevents brute-force attacks on auth routes
───────────────────────────────────────── */

/* General API limiter — 100 requests per 15 minutes per IP */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again in 15 minutes." },
});

/* Strict limiter for auth — 10 attempts per 15 minutes */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts. Please try again later." },
});

app.use("/api/", apiLimiter);
app.use("/api/auth/login",    authLimiter);
app.use("/api/auth/register", authLimiter);

/* ─────────────────────────────────────────
   ROUTES
───────────────────────────────────────── */
app.use("/api/auth",     require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));

/* ─────────────────────────────────────────
   HEALTH CHECK
   Useful for deployment platforms to ping
───────────────────────────────────────── */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Cocopi API is running.",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/* ─────────────────────────────────────────
   404 HANDLER — unknown routes
───────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

/* ─────────────────────────────────────────
   GLOBAL ERROR HANDLER
   Catches anything not caught in controllers
───────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === "development"
      ? err.message
      : "Something went wrong. Please try again.",
  });
});

/* ─────────────────────────────────────────
   START SERVER
───────────────────────────────────────── */
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🍫 Cocopi server running on http://192.168.1.5:${PORT}`);
  console.log(`    Environment: ${process.env.NODE_ENV}`);
});