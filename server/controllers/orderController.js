const Order   = require("../models/Order");
const Product = require("../models/Product");

/* ─────────────────────────────────────────
   POST /api/orders
   Place a new order — validates stock,
   calculates totals server-side (never
   trust the client for pricing).
───────────────────────────────────────── */
exports.placeOrder = async (req, res) => {
  try {
    const { items, delivery, paymentMethod } = req.body;

    /* ── Validate required fields ── */
    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Order must contain at least one item." });
    }
    if (!delivery || !paymentMethod) {
      return res.status(400).json({ success: false, message: "Delivery address and payment method are required." });
    }

    /* ── Server-side price calculation ──
       Fetch each product from DB to get the real price.
       This prevents clients from sending fake low prices. */
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product "${item.name}" is no longer available.`,
        });
      }

      if (product.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Only ${product.stock} units of "${product.name}" left in stock.`,
        });
      }

      subtotal += product.price * item.qty;

      orderItems.push({
        product: product._id,
        name:    product.name,
        origin:  product.origin,
        img:     product.img,
        price:   product.price,  // Real price from DB
        qty:     item.qty,
      });

      /* Decrement stock */
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.qty },
      });
    }

    /* ── Calculate totals ── */
    const shipping = subtotal >= 2000 ? 0 : 199;
    const gst      = Math.round(subtotal * 0.18);
    const codFee   = paymentMethod === "cod" ? 49 : 0;
    const total    = subtotal + shipping + gst + codFee;

    /* ── Create order ── */
    const order = await Order.create({
      user:          req.user ? req.user._id : null, // Supports guest orders
      items:         orderItems,
      delivery,
      paymentMethod,
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      subtotal,
      shipping,
      gst,
      codFee,
      total,
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully.",
      order: {
        _id:         order._id,
        orderNumber: order.orderNumber,
        total:       order.total,
        status:      order.status,
        createdAt:   order.createdAt,
      },
    });
  } catch (err) {
    console.error("PlaceOrder error:", err);
    res.status(500).json({ success: false, message: "Server error placing order." });
  }
};

/* ─────────────────────────────────────────
   GET /api/orders/mine  (protected)
   Returns the logged-in user's order history
───────────────────────────────────────── */
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 }) // Newest first
      .select("orderNumber total status paymentMethod createdAt items"); // Only what the UI needs

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("GetMyOrders error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET /api/orders/:id  (protected)
   Returns a single order — only if it
   belongs to the logged-in user (or admin)
───────────────────────────────────────── */
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.product", "name img");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    /* Security check — users can only see their own orders */
    const isOwner = order.user && order.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Not authorised to view this order." });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    console.error("GetOrder error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   GET /api/orders  (admin only)
   Returns ALL orders
───────────────────────────────────────── */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error("GetAllOrders error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};

/* ─────────────────────────────────────────
   PATCH /api/orders/:id/status  (admin only)
   Update order status (confirmed → shipped etc.)
───────────────────────────────────────── */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["placed","confirmed","processing","shipped","delivered","cancelled"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error("UpdateOrderStatus error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
};