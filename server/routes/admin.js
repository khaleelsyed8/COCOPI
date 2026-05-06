const express = require("express");
const router  = express.Router();

const {
  getOverview,
  getOrders,
  updateOrderStatus,
  getUsers,
  seedAdmin,
} = require("../controllers/adminController");

const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/protect");

/* ─ Seed admin (dev only, no auth needed since no admin exists yet) ─ */
router.post("/seed-admin", seedAdmin);
router.get("/ping", (req, res) => res.json({ success: true, message: "admin router alive" }));

/* ─ All routes below require admin JWT ─ */
router.use(protect, adminOnly);

/* Overview */
router.get("/overview", getOverview);

/* Orders */
router.get   ("/orders",             getOrders);
router.patch ("/orders/:id/status",  updateOrderStatus);

/* Products */
router.get   ("/products",     getAllProducts);
router.post  ("/products",     createProduct);
router.put   ("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

/* Users */
router.get("/users", getUsers);

module.exports = router;