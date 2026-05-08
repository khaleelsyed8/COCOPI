const express = require("express");
const router  = express.Router();

const {
  placeOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const { protect, adminOnly } = require("../middleware/protect");

/* ─ Optional auth middleware ─
   Attaches req.user if a valid JWT is present,
   but does NOT block the request if there's no token.
   This lets logged-in users have orders attributed to them
   while still allowing guest checkout. */
const optionalAuth = async (req, res, next) => {
  const jwt  = require("jsonwebtoken");
  const User = require("../models/User");

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) return next();

  try {
    const token   = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user      = await User.findById(decoded.id).select("-password");
  } catch {
    /* Invalid token — just treat as guest */
  }
  next();
};

/* Place an order — optional auth so logged-in users are recorded */
router.post("/", optionalAuth, placeOrder);

/* Get logged-in user's own orders */
router.get("/mine", protect, getMyOrders);

/* Admin — get all orders */
router.get("/", protect, adminOnly, getAllOrders);

/* Get / update a specific order */
router.get  ("/:id",        protect, getOrder);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;