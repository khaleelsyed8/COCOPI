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

/* Place an order — no auth required (supports guest checkout) */
router.post("/", placeOrder);

/* Get logged-in user's own orders */
router.get("/mine", protect, getMyOrders);

/* Admin — get all orders */
router.get("/", protect, adminOnly, getAllOrders);

/* Get / update a specific order */
router.get  ("/:id",        protect, getOrder);
router.patch("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;