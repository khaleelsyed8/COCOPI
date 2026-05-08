import { useState, useEffect, useCallback } from "react";
import "./AdminPage.css";
import {api} from "./api";
import { useAuth } from "./useAuth";

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const Icon = {
  orders:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>,
  products: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="m7.5 4.27 9 5.15M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/></svg>,
  users:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  overview: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
  back:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>,
  edit:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg>,
  trash:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  plus:     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  check:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ─────────────────────────────────────────
   STATUS BADGE
───────────────────────────────────────── */
const STATUS_COLORS = {
  placed:     "#8b6f47",
  confirmed:  "#2563eb",
  processing: "#d97706",
  shipped:    "#7c3aed",
  delivered:  "#16a34a",
  cancelled:  "#dc2626",
  pending:    "#6b7280",
  paid:       "#16a34a",
  failed:     "#dc2626",
};

function StatusBadge({ status }) {
  return (
    <span className="adm-badge" style={{ background: STATUS_COLORS[status] || "#6b7280" }}>
      {status}
    </span>
  );
}

/* ─────────────────────────────────────────
   STAT CARD
───────────────────────────────────────── */
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="adm-stat-card">
      <span className="adm-stat-label">{label}</span>
      <span className="adm-stat-value" style={accent ? { color: "var(--gold)" } : {}}>
        {value}
      </span>
      {sub && <span className="adm-stat-sub">{sub}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────
   OVERVIEW TAB
───────────────────────────────────────── */
function OverviewTab() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/overview")
      .then((d) => setData(d.overview))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="adm-loading">Loading overview…</div>;
  if (!data)   return <div className="adm-error">Failed to load overview.</div>;

  return (
    <div className="adm-overview">
      <div className="adm-stat-grid">
        <StatCard
          label="Total Revenue"
          value={`₹${data.totalRevenue.toLocaleString("en-IN")}`}
          sub="Excluding cancelled orders"
          accent
        />
        <StatCard label="Total Orders"   value={data.totalOrders}   sub="All time" />
        <StatCard label="Customers"      value={data.totalUsers}    sub="Registered accounts" />
        <StatCard label="Active Products" value={data.totalProducts} sub="In store" />
      </div>

      {/* Status breakdown */}
      <div className="adm-section">
        <h3 className="adm-section-title">Orders by Status</h3>
        <div className="adm-status-grid">
          {data.ordersByStatus.map((s) => (
            <div key={s._id} className="adm-status-cell">
              <StatusBadge status={s._id} />
              <span className="adm-status-count">{s.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="adm-section">
        <h3 className="adm-section-title">Recent Orders</h3>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Amount</th>
                <th>Payment</th><th>Status</th><th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td className="adm-mono">{o.orderNumber}</td>
                  <td>{o.user?.name || "Guest"}<br/>
                    <span className="adm-sub">{o.user?.email}</span>
                  </td>
                  <td className="adm-mono">₹{o.total.toLocaleString("en-IN")}</td>
                  <td><StatusBadge status={o.paymentMethod} /></td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="adm-sub">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDERS TAB — full order details
───────────────────────────────────────── */
const ORDER_STATUSES = ["all","placed","confirmed","processing","shipped","delivered","cancelled"];
const NEXT_STATUS = {
  placed: "confirmed", confirmed: "processing",
  processing: "shipped", shipped: "delivered",
};

function OrderRow({ order, onAdvance, onCancel, updating }) {
  const [expanded, setExpanded] = useState(false);
  const o = order;

  return (
    <>
      <tr
        key={o._id}
        className={expanded ? "adm-row-expanded" : ""}
        style={{ cursor: "pointer" }}
        onClick={() => setExpanded(!expanded)}
      >
        <td className="adm-mono adm-bold">
          <span className="adm-expand-toggle">{expanded ? "▾" : "▸"}</span>
          {o.orderNumber}
        </td>
        <td>
          <span className="adm-bold">{o.user?.name || "Guest"}</span>
          <br/><span className="adm-sub">{o.user?.email || "—"}</span>
        </td>
        <td>
          {/* Item thumbnails summary */}
          <div className="adm-items-thumb-row">
            {o.items?.slice(0, 3).map((item, idx) => (
              <img
                key={idx}
                src={item.img}
                alt={item.name}
                className="adm-item-thumb"
                title={`${item.name} × ${item.qty}`}
              />
            ))}
            {o.items?.length > 3 && (
              <span className="adm-items-more">+{o.items.length - 3}</span>
            )}
          </div>
          <span className="adm-sub">{o.items?.length} item(s)</span>
        </td>
        <td className="adm-mono adm-bold">₹{o.total.toLocaleString("en-IN")}</td>
        <td><StatusBadge status={o.paymentMethod} /></td>
        <td><StatusBadge status={o.status} /></td>
        <td className="adm-sub">
          {new Date(o.createdAt).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </td>
        <td onClick={(e) => e.stopPropagation()}>
          <div className="adm-action-row">
            {NEXT_STATUS[o.status] && (
              <button
                className="adm-action-btn adm-action-advance"
                onClick={() => onAdvance(o)}
                disabled={updating === o._id}
                title={`Mark as ${NEXT_STATUS[o.status]}`}
              >
                {updating === o._id ? "…" : `→ ${NEXT_STATUS[o.status]}`}
              </button>
            )}
            {o.status !== "cancelled" && o.status !== "delivered" && (
              <button
                className="adm-action-btn adm-action-cancel"
                onClick={() => onCancel(o)}
                disabled={updating === o._id}
              >
                Cancel
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* ── Expanded detail row ── */}
      {expanded && (
        <tr className="adm-detail-row">
          <td colSpan={8} style={{ padding: 0 }}>
            <div className="adm-detail-panel">

              {/* Items */}
              <div className="adm-detail-section">
                <h4 className="adm-detail-heading">Items Ordered</h4>
                <div className="adm-detail-items">
                  {o.items?.map((item, idx) => (
                    <div key={idx} className="adm-detail-item">
                      <img src={item.img} alt={item.name} className="adm-detail-item-img" />
                      <div className="adm-detail-item-info">
                        <span className="adm-detail-item-name">{item.name}</span>
                        <span className="adm-detail-item-origin">{item.origin}</span>
                      </div>
                      <div className="adm-detail-item-nums">
                        <span className="adm-detail-item-qty">× {item.qty}</span>
                        <span className="adm-detail-item-price">
                          ₹{(item.price * item.qty).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Price breakdown */}
                <div className="adm-detail-totals">
                  <div className="adm-detail-total-line">
                    <span>Subtotal</span>
                    <span>₹{o.subtotal?.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="adm-detail-total-line">
                    <span>Shipping</span>
                    <span>{o.shipping === 0 ? "FREE" : `₹${o.shipping}`}</span>
                  </div>
                  <div className="adm-detail-total-line">
                    <span>GST (18%)</span>
                    <span>₹{o.gst?.toLocaleString("en-IN")}</span>
                  </div>
                  {o.codFee > 0 && (
                    <div className="adm-detail-total-line">
                      <span>COD Fee</span><span>₹{o.codFee}</span>
                    </div>
                  )}
                  <div className="adm-detail-total-line adm-detail-grand-total">
                    <span>Total</span>
                    <span>₹{o.total?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              <div className="adm-detail-section">
                <h4 className="adm-detail-heading">Deliver To</h4>
                {o.delivery ? (
                  <div className="adm-detail-address">
                    <span className="adm-detail-address-name">
                      {o.delivery.firstName} {o.delivery.lastName}
                    </span>
                    <span>{o.delivery.address}
                      {o.delivery.apt ? `, ${o.delivery.apt}` : ""}
                    </span>
                    <span>
                      {o.delivery.city}, {o.delivery.state} – {o.delivery.pincode}
                    </span>
                    <span className="adm-sub">📞 {o.delivery.phone}</span>
                    <span className="adm-sub">✉️ {o.delivery.email}</span>
                  </div>
                ) : (
                  <span className="adm-sub">No address recorded</span>
                )}
              </div>

              {/* Payment */}
              <div className="adm-detail-section">
                <h4 className="adm-detail-heading">Payment</h4>
                <div className="adm-detail-address">
                  <StatusBadge status={o.paymentMethod} />
                  <span className="adm-sub" style={{ marginTop: ".3rem" }}>
                    Status: <StatusBadge status={o.paymentStatus || "pending"} />
                  </span>
                </div>
              </div>

            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function OrdersTab() {
  const [orders,   setOrders]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("all");
  const [updating, setUpdating] = useState(null);

  const load = useCallback((status) => {
    setLoading(true);
    const q = status !== "all" ? `?status=${status}` : "";
    api.get(`/admin/orders${q}`)
      .then((d) => setOrders(d.orders))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(filter); }, [filter, load]);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order._id);
    try {
      const d = await api.patch(`/admin/orders/${order._id}/status`, { status: next });
      setOrders((prev) => prev.map((o) => o._id === order._id ? d.order : o));
    } catch {}
    setUpdating(null);
  };

  const cancel = async (order) => {
    if (!window.confirm(`Cancel order ${order.orderNumber}?`)) return;
    setUpdating(order._id);
    try {
      const d = await api.patch(`/admin/orders/${order._id}/status`, { status: "cancelled" });
      setOrders((prev) => prev.map((o) => o._id === order._id ? d.order : o));
    } catch {}
    setUpdating(null);
  };

  return (
    <div className="adm-tab-content">
      <div className="adm-filter-row">
        {ORDER_STATUSES.map((s) => (
          <button
            key={s}
            className={`adm-filter-btn${filter === s ? " active" : ""}`}
            onClick={() => setFilter(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="adm-loading">Loading orders…</div>
      ) : (
        <div className="adm-table-wrap">
          <p className="adm-table-hint">Click any row to see full order details</p>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Order #</th><th>Customer</th><th>Items</th>
                <th>Total</th><th>Payment</th><th>Status</th>
                <th>Date</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 && (
                <tr><td colSpan={8} className="adm-empty">No orders found.</td></tr>
              )}
              {orders.map((o) => (
                <OrderRow
                  key={o._id}
                  order={o}
                  onAdvance={advance}
                  onCancel={cancel}
                  updating={updating}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   PRODUCT FORM MODAL
───────────────────────────────────────── */
const EMPTY_PRODUCT = {
  name: "", tag: "", origin: "", desc: "",
  price: "", stock: "", weight: 80, img: "",
  category: "dark", isActive: true,
};

function ProductModal({ product, onClose, onSaved }) {
  const [form,    setForm]    = useState(product || EMPTY_PRODUCT);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    if (!form.name || !form.price || !form.img) {
      setError("Name, price and image URL are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      const d = product?._id
        ? await api.put(`/admin/products/${product._id}`, payload)
        : await api.post("/admin/products", payload);
      onSaved(d.product);
      onClose();
    } catch (err) {
      setError(err.message || "Save failed.");
    }
    setSaving(false);
  };

  return (
    <div className="adm-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="adm-modal">
        <div className="adm-modal-header">
          <h2 className="adm-modal-title">{product ? "Edit Product" : "Add Product"}</h2>
          <button className="adm-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Image preview */}
        {form.img && (
          <div className="adm-img-preview">
            <img src={form.img} alt="preview" />
          </div>
        )}

        <div className="adm-modal-body">
          <div className="adm-form-row">
            <label>Name *</label>
            <input value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="Noir Profond" />
          </div>
          <div className="adm-form-row">
            <label>Tag</label>
            <input value={form.tag} onChange={(e) => set("tag", e.target.value)}
              placeholder="Single Origin" />
          </div>
          <div className="adm-form-row">
            <label>Origin</label>
            <input value={form.origin} onChange={(e) => set("origin", e.target.value)}
              placeholder="Ecuador · 85%" />
          </div>
          <div className="adm-form-row">
            <label>Description</label>
            <textarea value={form.desc} onChange={(e) => set("desc", e.target.value)}
              rows={3} placeholder="Tasting notes…" />
          </div>
          <div className="adm-form-grid">
            <div className="adm-form-row">
              <label>Price (₹) *</label>
              <input type="number" value={form.price}
                onChange={(e) => set("price", e.target.value)} placeholder="1200" />
            </div>
            <div className="adm-form-row">
              <label>Stock</label>
              <input type="number" value={form.stock}
                onChange={(e) => set("stock", e.target.value)} placeholder="50" />
            </div>
            <div className="adm-form-row">
              <label>Weight (g)</label>
              <input type="number" value={form.weight}
                onChange={(e) => set("weight", e.target.value)} placeholder="80" />
            </div>
            <div className="adm-form-row">
              <label>Category</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="dark">Dark</option>
                <option value="milk">Milk</option>
                <option value="white">White</option>
                <option value="truffle">Truffle</option>
                <option value="gift">Gift</option>
              </select>
            </div>
          </div>
          <div className="adm-form-row">
            <label>Cloudinary Image URL *</label>
            <input value={form.img} onChange={(e) => set("img", e.target.value)}
              placeholder="https://res.cloudinary.com/…" />
          </div>
          <div className="adm-form-row adm-form-row-check">
            <label>
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)} />
              &nbsp; Listed (visible in store)
            </label>
          </div>

          {error && <p className="adm-form-error">{error}</p>}
        </div>

        <div className="adm-modal-footer">
          <button className="adm-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="adm-btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Product"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PRODUCTS TAB
───────────────────────────────────────── */
function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // null | "new" | product object

  useEffect(() => {
    api.get("/admin/products")
      .then((d) => setProducts(d.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const onSaved = (saved) => {
    setProducts((prev) => {
      const exists = prev.find((p) => p._id === saved._id);
      return exists
        ? prev.map((p) => p._id === saved._id ? saved : p)
        : [saved, ...prev];
    });
  };

  const remove = async (product) => {
    if (!window.confirm(`De-list "${product.name}"?`)) return;
    try {
      await api.delete(`/admin/products/${product._id}`);
      setProducts((prev) =>
        prev.map((p) => p._id === product._id ? { ...p, isActive: false } : p)
      );
    } catch {}
  };

  return (
    <div className="adm-tab-content">
      <div className="adm-tab-header">
        <span className="adm-tab-count">{products.length} products</span>
        <button className="adm-btn-primary adm-btn-sm" onClick={() => setModal("new")}>
          {Icon.plus} Add Product
        </button>
      </div>

      {loading ? (
        <div className="adm-loading">Loading products…</div>
      ) : (
        <div className="adm-product-grid">
          {products.map((p) => (
            <div key={p._id} className={`adm-product-card${!p.isActive ? " delisted" : ""}`}>
              <div className="adm-product-img">
                <img src={p.img} alt={p.name} />
                {!p.isActive && <span className="adm-delisted-badge">Delisted</span>}
              </div>
              <div className="adm-product-info">
                <span className="adm-product-tag">{p.tag}</span>
                <h3 className="adm-product-name">{p.name}</h3>
                <span className="adm-product-origin">{p.origin}</span>
                <div className="adm-product-meta">
                  <span className="adm-product-price">
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                  <span className="adm-product-stock">
                    {p.stock} in stock
                  </span>
                </div>
              </div>
              <div className="adm-product-actions">
                <button className="adm-icon-btn" onClick={() => setModal(p)} title="Edit">
                  {Icon.edit}
                </button>
                <button className="adm-icon-btn adm-icon-btn-danger"
                  onClick={() => remove(p)} title="De-list">
                  {Icon.trash}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === "new" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   USERS TAB
───────────────────────────────────────── */
function UsersTab() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/users")
      .then((d) => setUsers(d.users))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="adm-tab-content">
      <div className="adm-tab-header">
        <span className="adm-tab-count">{users.length} users</span>
      </div>

      {loading ? (
        <div className="adm-loading">Loading users…</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Role</th>
                <th>Orders</th><th>Total Spent</th><th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr><td colSpan={6} className="adm-empty">No users yet.</td></tr>
              )}
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="adm-bold">{u.name}</td>
                  <td className="adm-sub">{u.email}</td>
                  <td>
                    <span className={`adm-badge ${u.role === "admin" ? "adm-badge-admin" : ""}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="adm-mono">{u.orderCount}</td>
                  <td className="adm-mono">
                    ₹{u.totalSpent.toLocaleString("en-IN")}
                  </td>
                  <td className="adm-sub">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   ADMIN PAGE ROOT
───────────────────────────────────────── */
const TABS = [
  { id: "overview",  label: "Overview",  icon: Icon.overview  },
  { id: "orders",    label: "Orders",    icon: Icon.orders    },
  { id: "products",  label: "Products",  icon: Icon.products  },
  { id: "users",     label: "Users",     icon: Icon.users     },
];

function MobileAdminBar({ tab, setTab, logout, navigate }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="adm-mobile-bar">
        <span className="adm-mobile-logo">COC<span className="ColoredItalic">O</span>PI <span className="account">Admin</span></span>
        <div className="adm-mobile-bar-right">
          <button
  className={`adm-mobile-hamburger${open ? " open" : ""}`}
  onClick={() => setOpen(!open)}
  aria-label={open ? "Close menu" : "Open menu"}
  aria-expanded={open}
>
  <span /><span /><span />
</button>
        </div>
      </div>

      {open && (
        <div className="adm-mobile-drawer" onClick={() => setOpen(false)}>
          <div className="adm-mobile-drawer-inner" onClick={e => e.stopPropagation()}>
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`adm-mobile-nav-btn${tab === t.id ? " active" : ""}`}
                onClick={() => { setTab(t.id); setOpen(false); }}
              >
                {t.icon}<span>{t.label}</span>
              </button>
            ))}
            <div className="adm-mobile-drawer-footer">
              <button className="adm-mobile-nav-btn" onClick={() => navigate("home")}>
                ← Back to Store
              </button>
              <button className="adm-mobile-nav-btn adm-mobile-logout"
                onClick={() => { logout(); navigate("home"); }}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function AdminPage({ navigate }) {
  const [tab,     setTab]     = useState("overview");
  const { user, logout }      = useAuth();

  /* Guard — non-admin users should never see this */
  if (!user || user.role !== "admin") {
    return (
      <div className="adm-access-denied">
        <h2>Access Denied</h2>
        <p>You don't have permission to view this page.</p>
        <button onClick={() => navigate("home")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="adm-page">
    <MobileAdminBar tab={tab} setTab={setTab} logout={logout} navigate={navigate} />
      {/* Sidebar */}
      <aside className="adm-sidebar">
        <div className="adm-sidebar-brand">
          <span className="adm-sidebar-logo">COC<span className="ColoredItalic">O</span>PI</span>
          <span className="adm-sidebar-sub">Admin</span>
        </div>

        <nav className="adm-sidebar-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`adm-sidebar-link${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="adm-sidebar-footer">
          <div className="adm-sidebar-user">
            <span className="adm-sidebar-user-name">{user.name}</span>
            <span className="adm-sidebar-user-role">Administrator</span>
          </div>
          <button className="adm-sidebar-back" onClick={() => navigate("home")}
            title="Back to store">
            {Icon.back}
          </button>
          <button className="adm-sidebar-logout" onClick={() => { logout(); navigate("home"); }}
            title="Sign out">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="adm-main">
        <div className="adm-topbar">
          <h1 className="adm-page-title">
            {TABS.find((t) => t.id === tab)?.label}
          </h1>
          <span className="adm-topbar-date">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long", year: "numeric",
              month: "long", day: "numeric",
            })}
          </span>
        </div>

        <div className="adm-content">
          {tab === "overview" && <OverviewTab />}
          {tab === "orders"   && <OrdersTab />}
          {tab === "products" && <ProductsTab />}
          {tab === "users"    && <UsersTab />}
        </div>
      </main>
    </div>
  );
}