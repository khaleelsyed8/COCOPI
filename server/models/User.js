const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

/* ─────────────────────────────────────────
   ADDRESS SUB-SCHEMA
   Reused in both User (saved addresses) and Order
───────────────────────────────────────── */
const addressSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName:  { type: String, required: true, trim: true },
  phone:     { type: String, required: true },
  address:   { type: String, required: true },
  apt:       { type: String, default: "" },
  city:      { type: String, required: true },
  state:     { type: String, required: true },
  pincode:   { type: String, required: true },
}, { _id: false });

/* ─────────────────────────────────────────
   USER SCHEMA
───────────────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Never returned in queries unless explicitly asked
    },
    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
    savedAddresses: [addressSchema],

    /* For future use */
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // Adds createdAt + updatedAt automatically
  }
);

/* ─────────────────────────────────────────
   HASH PASSWORD BEFORE SAVE
   Only re-hashes if password field was modified
───────────────────────────────────────── */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/* ─────────────────────────────────────────
   INSTANCE METHOD — compare passwords
   Used in login: bcrypt.compare(plain, hashed)
───────────────────────────────────────── */
userSchema.methods.matchPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);