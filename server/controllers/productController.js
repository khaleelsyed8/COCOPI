const Product = require("../models/Product");

/* ─────────────────────────────────────────
   GET /api/products
   Returns all active products
───────────────────────────────────────── */
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    console.error("GetProducts error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET /api/products/:id
   Returns a single product
───────────────────────────────────────── */
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, product });
  } catch (err) {
    /* Invalid ObjectId format */
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    }
    console.error("GetProduct error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   POST /api/products  (admin only)
   Create a new product
───────────────────────────────────────── */
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error("CreateProduct error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   PUT /api/products/:id  (admin only)
   Update a product
───────────────────────────────────────── */
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("UpdateProduct error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   DELETE /api/products/:id  (admin only)
   Soft-delete — sets isActive: false
───────────────────────────────────────── */
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }
    res.status(200).json({ success: true, message: "Product de-listed." });
  } catch (err) {
    console.error("DeleteProduct error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   POST /api/products/seed  (dev only)
   Seeds the 3 Cocopi products into MongoDB
   so the frontend can fetch them from the DB.
   Remove or protect this route in production.
───────────────────────────────────────── */
exports.seedProducts = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development") {
      return res.status(403).json({ success: false, message: "Seed only available in development." });
    }

    await Product.deleteMany({});

    const products = await Product.insertMany([
      {
        name:   "Noir Profond",
        tag:    "Single Origin",
        origin: "Ecuador · 85%",
        desc:   "Deep dark chocolate. Notes of dried cherry, tobacco leaf, and ancient forest floor.",
        price:  1200,
        img:    "https://images.unsplash.com/photo-1548741487-18d363dc4469?w=700&q=80",
        stock:  50,
      },
      {
        name:   "Velours",
        tag:    "Milk Truffle",
        origin: "Belgium · 42%",
        desc:   "Silken milk chocolate truffles with sea salt caramel and tonka bean ganache.",
        price:  1850,
        img:    "https://images.unsplash.com/photo-1620706857370-e1b9770e8bb1?w=700&q=80",
        stock:  35,
      },
      {
        name:   "Blanche Ivoire",
        tag:    "White",
        origin: "Ivory Coast",
        desc:   "Creamy white couverture with hints of vanilla, condensed milk, and toasted coconut.",
        price:  1450,
        img:    "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=700&q=80",
        stock:  40,
      },
    ]);

    res.status(201).json({
      success: true,
      message: `${products.length} products seeded.`,
      products,
    });
  } catch (err) {
    console.error("Seed error:", err);
    res.status(500).json({ success: false, message: "Seed failed." });
  }
};