const mongoose = require("mongoose");

/* ─ Each line item in the order ─ */
const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name:    { type: String, required: true }, // Snapshot at time of order
  origin:  { type: String, required: true },
  img:     { type: String, required: true },
  price:   { type: Number, required: true }, // Price at time of order (not live)
  qty:     { type: Number, required: true, min: 1 },
}, { _id: false });

/* ─ Delivery address snapshot ─ */
const deliverySchema = new mongoose.Schema({
  firstName: String,
  lastName:  String,
  phone:     String,
  address:   String,
  apt:       String,
  city:      String,
  state:     String,
  pincode:   String,
}, { _id: false });

/* ─ Order schema ─ */
const orderSchema = new mongoose.Schema(
  {
    /* The user who placed it — optional (guest checkout possible later) */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    items:    { type: [orderItemSchema],  required: true },
    delivery: { type: deliverySchema,     required: true },

    /* Payment */
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "wallet", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    /* Pricing snapshot */
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0    },
    gst:      { type: Number, required: true },
    codFee:   { type: Number, default: 0    },
    total:    { type: Number, required: true },

    /* Order lifecycle */
    status: {
      type: String,
      enum: ["placed", "confirmed", "processing", "shipped", "delivered", "cancelled"],
      default: "placed",
    },

    /* Human-readable order ID shown to customers — e.g. CP20240001 */
    orderNumber: {
      type: String,
      unique: true,
    },

    notes: { type: String, default: "" },
  },
  {
    timestamps: true,
  }
);

/* ─────────────────────────────────────────
   AUTO-GENERATE orderNumber before save
   Format: CP + 8-digit timestamp suffix
───────────────────────────────────────── */
orderSchema.pre("save", async function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `CP${Date.now().toString().slice(-8)}`;
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);