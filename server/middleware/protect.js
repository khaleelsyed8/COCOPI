const jwt  = require("jsonwebtoken");
const User = require("../models/User");

/* ─────────────────────────────────────────
   PROTECT MIDDLEWARE
   Attach this to any route that needs a
   logged-in user:
     router.get("/me", protect, getMe)
───────────────────────────────────────── */
const protect = async (req, res, next) => {
  let token;

  /* JWT is sent as: Authorization: Bearer <token> */
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorised — no token provided.",
    });
  }

  try {
    /* Verify signature + expiry */
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    /* Attach user to request (without password) */
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User belonging to this token no longer exists.",
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Token invalid or expired. Please log in again.",
    });
  }
};

/* ─────────────────────────────────────────
   ADMIN MIDDLEWARE
   Use after protect:
     router.delete("/:id", protect, adminOnly, deleteProduct)
───────────────────────────────────────── */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") return next();
  return res.status(403).json({
    success: false,
    message: "Access denied — admins only.",
  });
};

module.exports = { protect, adminOnly };