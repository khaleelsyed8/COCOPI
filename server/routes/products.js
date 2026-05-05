const express = require("express");
const router  = express.Router();

const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/protect");

/* Public routes */
router.get("/",     getProducts);
router.get("/:id",  getProduct);

/* Dev-only seed route — seeds the 3 Cocopi products */
router.post("/seed", seedProducts);

/* Admin-only routes */
router.post  ("/",    protect, adminOnly, createProduct);
router.put   ("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;