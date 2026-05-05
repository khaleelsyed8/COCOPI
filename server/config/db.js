const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // These are the recommended options for Mongoose 8+
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas unreachable
      socketTimeoutMS: 45000,
    });

    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection failed: ${err.message}`);
    console.error("    Check your MONGO_URI in .env and that your IP is whitelisted in Atlas.");
    process.exit(1); // Kill server — no point running without DB
  }
};

// Log disconnection events so you know if Atlas drops
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️   MongoDB disconnected.");
});

module.exports = connectDB;