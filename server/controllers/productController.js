const Product = require("../models/Product");

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive)
      return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, product });
  } catch (err) {
    if (err.name === "CastError")
      return res.status(400).json({ success: false, message: "Invalid product ID." });
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ success: true, product });
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, product });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, { isActive: false }, { new: true }
    );
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found." });
    res.status(200).json({ success: true, message: "Product de-listed." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
};

exports.seedProducts = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development")
      return res.status(403).json({ success: false, message: "Dev only." });

    await Product.deleteMany({});
    const products = await Product.insertMany([
      {
        name: "Noir Profond", tag: "Single Origin", origin: "Ecuador · 85%",
        desc: "Deep dark chocolate. Notes of dried cherry, tobacco leaf, and ancient forest floor.",
        price: 1200, stock: 50, weight: 80, category: "dark",
        img: "https://res.cloudinary.com/dsbitwfjx/image/upload/v1778042888/ChatGPT_Image_May_6_2026_10_17_57_AM_yk938h.png",
      },
      {
        name: "Velours", tag: "Milk Truffle", origin: "Belgium · 42%",
        desc: "Silken milk chocolate truffles with sea salt caramel and tonka bean ganache.",
        price: 1850, stock: 35, weight: 80, category: "milk",
        img: "https://res.cloudinary.com/dsbitwfjx/image/upload/v1778032540/d895b410-a290-4654-885e-0509697a4ba0_hqukk1.png",
      },
      {
        name: "Blanche Ivoire", tag: "White", origin: "Ivory Coast",
        desc: "Creamy white couverture with hints of vanilla, condensed milk, and toasted coconut.",
        price: 1450, stock: 40, weight: 80, category: "white",
        img: "https://res.cloudinary.com/dsbitwfjx/image/upload/v1778032654/7575d2a6-d305-4216-85dc-bec51ee8e5a5_ybatmv.png",
      },
    ]);
    res.status(201).json({ success: true, message: `${products.length} products seeded.`, products });
  } catch (err) {
    res.status(500).json({ success: false, message: "Seed failed." });
  }
};