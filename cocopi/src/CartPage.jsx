import { useState } from "react";
import "./CartPage.css";

/* ─ Inline back-arrow icon ─ */
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

/* ─ Cacao Pod (self-contained) ─ */
function CacaoPod({ size = 28, color = "var(--gold)" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none"
      xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ display: "block" }}>
      <ellipse cx="40" cy="48" rx="14" ry="20" stroke={color} strokeWidth="1.6" fill="none" />
      <path d="M30 36 Q40 28 50 36" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M28 42 Q40 34 52 42" stroke={color} strokeWidth="1.1" fill="none" />
      <path d="M27 50 Q40 42 53 50" stroke={color} strokeWidth="1.1" fill="none" />
      <path d="M28 58 Q40 50 52 58" stroke={color} strokeWidth="1.1" fill="none" />
      <path d="M40 28 Q40 22 40 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M40 22 Q30 14 20 18 Q28 22 34 26" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M40 22 Q50 14 60 18 Q52 22 46 26" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <ellipse cx="37" cy="46" rx="2.2" ry="3" fill={color} opacity="0.25" />
      <ellipse cx="43" cy="46" rx="2.2" ry="3" fill={color} opacity="0.25" />
      <ellipse cx="40" cy="53" rx="2.2" ry="3" fill={color} opacity="0.2" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   EMPTY CART STATE
───────────────────────────────────────── */
function EmptyCart({ navigate }) {
  return (
    <div className="cart-empty">
      <div className="cart-empty-pod">
        <CacaoPod size={64} color="rgba(96,70,59,0.2)" />
      </div>
      <h2 className="cart-empty-title">Your cart is empty.</h2>
      <p className="cart-empty-sub">
        Discover our single-origin collection and add something extraordinary.
      </p>
      <button className="cart-empty-cta" onClick={() => navigate("home")}>
        <span>Explore Collection</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   CART ITEM ROW
───────────────────────────────────────── */
function CartItem({ item, updateQty, removeFromCart }) {
  /* Parse numeric price from "₹1,200" → 1200 */
  const numericPrice = parseInt(item.price.replace(/[^\d]/g, ""), 10);
  const lineTotal = numericPrice * item.qty;

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        <img src={item.img} alt={item.name} loading="lazy" />
        {/* Origin tag overlay */}
        <span className="cart-item-origin-tag">{item.tag}</span>
      </div>

      <div className="cart-item-details">
        <div className="cart-item-header">
          <div>
            <p className="cart-item-origin">{item.origin}</p>
            <h3 className="cart-item-name">{item.name}</h3>
          </div>
          <button
            className="cart-item-remove"
            onClick={() => removeFromCart(item.name)}
            aria-label={`Remove ${item.name}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <p className="cart-item-desc">{item.desc}</p>

        <div className="cart-item-footer">
          {/* Qty stepper */}
          <div className="cart-qty">
            <button
              className="cart-qty-btn"
              onClick={() => updateQty(item.name, -1)}
              aria-label="Decrease quantity"
            >−</button>
            <span className="cart-qty-val">{item.qty}</span>
            <button
              className="cart-qty-btn"
              onClick={() => updateQty(item.name, 1)}
              aria-label="Increase quantity"
            >+</button>
          </div>
          <span className="cart-item-price">
            ₹{lineTotal.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   PROMO CODE INPUT
───────────────────────────────────────── */
function PromoInput() {
  const [code,    setCode]    = useState("");
  const [status,  setStatus]  = useState(null); // null | "ok" | "err"
  const VALID_CODES = { "COCOPI10": 10, "BEAN20": 20 };

  const apply = () => {
    if (VALID_CODES[code.toUpperCase()]) {
      setStatus("ok");
    } else {
      setStatus("err");
    }
  };

  return (
    <div className="cart-promo">
      <div className={`cart-promo-input-wrap${status === "err" ? " errored" : ""}${status === "ok" ? " success" : ""}`}>
        <input
          type="text"
          className="cart-promo-input"
          placeholder="Promo code"
          value={code}
          onChange={(e) => { setCode(e.target.value); setStatus(null); }}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          aria-label="Promo code"
        />
        <button className="cart-promo-btn" onClick={apply} type="button">Apply</button>
      </div>
      {status === "ok"  && <p className="cart-promo-msg ok">Code applied! {VALID_CODES[code.toUpperCase()]}% off.</p>}
      {status === "err" && <p className="cart-promo-msg err">Invalid or expired code.</p>}
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDER SUMMARY SIDEBAR
───────────────────────────────────────── */
function OrderSummary({ cart, navigate }) {
  const subtotal = cart.reduce((sum, i) => {
    return sum + parseInt(i.price.replace(/[^\d]/g, ""), 10) * i.qty;
  }, 0);

  const shipping  = subtotal >= 2000 ? 0 : 199;
  const gst       = Math.round(subtotal * 0.18);
  const total     = subtotal + shipping + gst;

  return (
    <aside className="cart-summary">
      <h2 className="cart-summary-title">Order Summary</h2>

      <div className="cart-summary-lines">
        <div className="cart-summary-line">
          <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} items)</span>
          <span>₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <div className="cart-summary-line">
          <span>Shipping</span>
          <span>{shipping === 0
            ? <span className="cart-free">FREE</span>
            : `₹${shipping}`}
          </span>
        </div>
        <div className="cart-summary-line">
          <span>GST (18%)</span>
          <span>₹{gst.toLocaleString("en-IN")}</span>
        </div>
      </div>

      {subtotal < 2000 && (
        <div className="cart-free-ship-bar">
          <div className="cart-free-ship-track">
            <div
              className="cart-free-ship-fill"
              style={{ width: `${Math.min((subtotal / 2000) * 100, 100)}%` }}
            />
          </div>
          <p className="cart-free-ship-label">
            Add ₹{(2000 - subtotal).toLocaleString("en-IN")} more for free shipping
          </p>
        </div>
      )}

      <PromoInput />

      <div className="cart-summary-total-line">
        <span>Total</span>
        <span className="cart-total-price">₹{total.toLocaleString("en-IN")}</span>
      </div>

      <button className="cart-checkout-btn" onClick={() => navigate("checkout")}>
        <span>Proceed to Checkout →</span>
      </button>

      <p className="cart-secure-note">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Secure checkout · SSL encrypted
      </p>
    </aside>
  );
}

/* ─────────────────────────────────────────
   CART PAGE ROOT
───────────────────────────────────────── */
export default function CartPage({ cart, removeFromCart, updateQty, navigate }) {
  return (
    <div className="cart-page">
      {/* Page header */}
      <div className="cart-page-header">
        <div className="cart-page-header-inner">
          <button className="cart-back-btn" onClick={() => navigate("home")}>
            <BackIcon /> Continue Shopping
          </button>
          <div className="cart-page-title-wrap">
            <CacaoPod size={22} />
            <h1 className="cart-page-title">Your Cart</h1>
            <span className="cart-page-count">
              {cart.reduce((s, i) => s + i.qty, 0)} items
            </span>
          </div>
        </div>
      </div>

      <div className="cart-body">
        {cart.length === 0 ? (
          <EmptyCart navigate={navigate} />
        ) : (
          <div className="cart-layout">
            {/* Left — item list */}
            <div className="cart-items-col">
              <div className="cart-items-header">
                <span>Product</span>
                <span>Total</span>
              </div>
              <div className="cart-items-list">
                {cart.map((item) => (
                  <CartItem
                    key={item.name}
                    item={item}
                    updateQty={updateQty}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            </div>

            {/* Right — summary */}
            <OrderSummary cart={cart} navigate={navigate} />
          </div>
        )}
      </div>
    </div>
  );
}