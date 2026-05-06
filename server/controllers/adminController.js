const User    = require("../models/User");
const Product = require("../models/Product");
const Order   = require("../models/Order");
const bcrypt  = require("bcryptjs");

/* ─────────────────────────────────────────
   GET /api/admin/overview
   Dashboard summary stats
───────────────────────────────────────── */
exports.getOverview = async (req, res) => {
  try {
    const [
      totalOrders,
      totalUsers,
      totalProducts,
      revenueAgg,
      recentOrders,
      ordersByStatus,
    ] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: "customer" }),
      Product.countDocuments({ isActive: true }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email")
        .select("orderNumber total status paymentMethod createdAt"),
      Order.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.status(200).json({
      success: true,
      overview: {
        totalOrders,
        totalUsers,
        totalProducts,
        totalRevenue,
        recentOrders,
        ordersByStatus,
      },
    });
  } catch (err) {
    console.error("GetOverview error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET /api/admin/orders
   All orders with pagination + status filter
───────────────────────────────────────── */
exports.getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status && status !== "all" ? { status } : {};

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate("user", "name email"),
      Order.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error("Admin GetOrders error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   PATCH /api/admin/orders/:id/status
───────────────────────────────────────── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["placed","confirmed","processing","shipped","delivered","cancelled"];
    if (!valid.includes(status))
      return res.status(400).json({ success: false, message: "Invalid status." });

    const order = await Order.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    ).populate("user", "name email");

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found." });

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("UpdateOrderStatus error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET /api/admin/users
───────────────────────────────────────── */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select("-password");

    /* Attach order count to each user */
    const usersWithCounts = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        const spent = await Order.aggregate([
          { $match: { user: u._id, status: { $ne: "cancelled" } } },
          { $group: { _id: null, total: { $sum: "$total" } } },
        ]);
        return {
          ...u.toObject(),
          orderCount,
          totalSpent: spent[0]?.total || 0,
        };
      })
    );

    res.status(200).json({ success: true, count: users.length, users: usersWithCounts });
  } catch (err) {
    console.error("GetUsers error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   POST /api/admin/seed-admin
   Creates the admin account if it doesn't exist.
   Only works in development.
───────────────────────────────────────── */
exports.seedAdmin = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development")
      return res.status(403).json({ success: false, message: "Dev only." });

    const existing = await User.findOne({ role: "admin" });
    if (existing)
      return res.status(200).json({
        success: true,
        message: "Admin already exists.",
        email: existing.email,
      });

    const admin = await User.create({
      name:     "Cocopi Admin",
      email:    process.env.ADMIN_EMAIL    || "admin@cocopi.com",
      password: process.env.ADMIN_PASSWORD || "Cocopi@Admin2025",
      role:     "admin",
    });

    res.status(201).json({
      success: true,
      message: "Admin account created.",
      email:    admin.email,
      password: process.env.ADMIN_PASSWORD || "Cocopi@Admin2025",
      note:     "Change this password immediately after first login.",
    });
  } catch (err) {
    console.error("SeedAdmin error:", err);
    res.status(500).json({ success: false, message: "Failed to create admin." });
  }
};