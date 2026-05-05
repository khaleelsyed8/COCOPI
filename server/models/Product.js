const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    tag: {
      type: String,
      required: true,
      trim: true, // e.g. "Single Origin", "Milk Truffle"
    },
    origin: {
      type: String,
      required: true,
      trim: true, // e.g. "Ecuador · 85%"
    },
    desc: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    img: {
      type: String,
      required: true, // URL string
    },
    stock: {
      type: Number,
      required: true,
      default: 100,
      min: [0, "Stock cannot be negative"],
    },
    isActive: {
      type: Boolean,
      default: true, // Can be de-listed without deleting
    },
    /* Future fields — ready to use */
    category:   { type: String, default: "chocolate" },
    weight:     { type: Number, default: 80 },  // grams
    ingredients:{ type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

/* Text index — enables search by name, tag, origin */
productSchema.index({ name: "text", tag: "text", origin: "text" });

module.exports = mongoose.model("Product", productSchema);