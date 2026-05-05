const express = require("express");
const router  = express.Router();

const {
  register,
  login,
  getMe,
  updateMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/protect");

/* Public routes */
router.post("/register", register);
router.post("/login",    login);

/* Protected routes — require valid JWT */
router.get ("/me", protect, getMe);
router.put ("/me", protect, updateMe);

module.exports = router;