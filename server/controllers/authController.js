const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/* ─────────────────────────────────────────
   HELPER — sign and return a JWT
───────────────────────────────────────── */
const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);

  /* Strip password before sending */
  const userData = {
    _id:       user._id,
    name:      user.name,
    email:     user.email,
    role:      user.role,
    createdAt: user.createdAt,
  };

  res.status(statusCode).json({
    success: true,
    token,
    user: userData,
  });
};

/* ─────────────────────────────────────────
   POST /api/auth/register
───────────────────────────────────────── */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    /* Check if email already in use */
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res);
  } catch (err) {
    /* Mongoose validation errors */
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

/* ─────────────────────────────────────────
   POST /api/auth/login
───────────────────────────────────────── */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    /* Explicitly select password — it's excluded by default */
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({
        success: false,
        /* Intentionally vague — don't confirm whether email exists */
        message: "Incorrect email or password.",
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error. Please try again." });
  }
};

/* ─────────────────────────────────────────
   GET /api/auth/me  (protected)
   Returns the logged-in user's profile
───────────────────────────────────────── */
exports.getMe = async (req, res) => {
  try {
    /* req.user is attached by the protect middleware */
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   PUT /api/auth/me  (protected)
   Update name or saved addresses
───────────────────────────────────────── */
exports.updateMe = async (req, res) => {
  try {
    const allowed = ["name", "savedAddresses"];
    const updates = {};
    allowed.forEach((key) => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new:          true,  // Return updated document
      runValidators: true,
    });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("UpdateMe error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};