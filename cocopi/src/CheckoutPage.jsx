import { useState } from "react";
import "./CheckoutPage.css";
import {api} from "./api";

/* ─ Icons ─ */
const BackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M19 12H5M12 5l-7 7 7 7"/>
  </svg>
);

const LockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

/* ─ Field ─ */
function Field({ label, type = "text", placeholder, value, onChange, error, autoComplete, half }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`co-field${focused ? " focused" : ""}${error ? " errored" : ""}${half ? " half" : ""}`}>
      <label className="co-label">{label}</label>
      <input
        type={type}
        className="co-input"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={!!error}
      />
      {error && <span className="co-field-error" role="alert">{error}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────── */
function Steps({ current }) {
  const steps = ["Delivery", "Payment", "Review"];
  return (
    <div className="co-steps">
      {steps.map((s, i) => (
        <div key={s} className={`co-step${i <= current ? " active" : ""}${i < current ? " done" : ""}`}>
          <div className="co-step-dot">
            {i < current ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <span>{i + 1}</span>
            )}
          </div>
          <span className="co-step-label">{s}</span>
          {i < steps.length - 1 && <div className="co-step-line" />}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   STEP 1 — DELIVERY ADDRESS
───────────────────────────────────────── */
const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab",
  "Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh",
  "Uttarakhand","West Bengal","Delhi","Jammu & Kashmir","Ladakh","Puducherry",
];

function DeliveryStep({ data, setData, onNext }) {
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!data.firstName.trim())                         e.firstName = "Required";
    if (!data.lastName.trim())                          e.lastName  = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) e.email    = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(data.phone))              e.phone     = "Valid 10-digit mobile required";
    if (!data.address.trim())                           e.address   = "Required";
    if (!data.city.trim())                              e.city      = "Required";
    if (!data.state)                                    e.state     = "Select a state";
    if (!/^\d{6}$/.test(data.pincode))                 e.pincode   = "Valid 6-digit PIN required";
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <form className="co-form" onSubmit={submit} noValidate>
      <h2 className="co-section-title">Delivery Address</h2>

      <div className="co-row">
        <Field label="First Name" placeholder="Arjun" value={data.firstName}
          onChange={(v) => set("firstName", v)} error={errors.firstName}
          autoComplete="given-name" half />
        <Field label="Last Name" placeholder="Sharma" value={data.lastName}
          onChange={(v) => set("lastName", v)} error={errors.lastName}
          autoComplete="family-name" half />
      </div>

      <div className="co-row">
        <Field label="Email" type="email" placeholder="you@example.com"
          value={data.email} onChange={(v) => set("email", v)} error={errors.email}
          autoComplete="email" half />
        <Field label="Mobile Number" type="tel" placeholder="9XXXXXXXXX"
          value={data.phone} onChange={(v) => set("phone", v)} error={errors.phone}
          autoComplete="tel" half />
      </div>

      <Field label="Address Line" placeholder="House No, Street, Locality"
        value={data.address} onChange={(v) => set("address", v)} error={errors.address}
        autoComplete="street-address" />

      <Field label="Apartment / Floor (optional)" placeholder="Apt 4B, Tower C"
        value={data.apt} onChange={(v) => set("apt", v)}
        autoComplete="address-line2" />

      <div className="co-row">
        <Field label="City" placeholder="Mumbai" value={data.city}
          onChange={(v) => set("city", v)} error={errors.city}
          autoComplete="address-level2" half />
        <Field label="PIN Code" placeholder="400001" value={data.pincode}
          onChange={(v) => set("pincode", v)} error={errors.pincode}
          autoComplete="postal-code" half />
      </div>

      {/* State select */}
      <div className={`co-field${errors.state ? " errored" : ""}`}>
        <label className="co-label">State</label>
        <select
          className="co-input co-select"
          value={data.state}
          onChange={(e) => set("state", e.target.value)}
          aria-invalid={!!errors.state}
        >
          <option value="">Select state</option>
          {INDIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <span className="co-field-error" role="alert">{errors.state}</span>}
      </div>

      <button className="co-next-btn" type="submit">
        <span>Continue to Payment →</span>
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   STEP 2 — PAYMENT
───────────────────────────────────────── */
const PAYMENT_METHODS = [
  { id: "card",   label: "Credit / Debit Card",  icon: "💳" },
  { id: "upi",    label: "UPI",                  icon: "⚡" },
  { id: "wallet", label: "Wallets",               icon: "👜" },
  { id: "cod",    label: "Cash on Delivery",      icon: "🏠" },
];

/* Format card number with spaces */
const fmtCard = (v) => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
const fmtExp  = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

function PaymentStep({ data, setData, onNext, onBack, total }) {
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setData((d) => ({ ...d, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (data.method === "card") {
      if (data.cardNumber.replace(/\s/g, "").length < 16) e.cardNumber = "Enter valid 16-digit card number";
      if (!data.cardName.trim())  e.cardName = "Name on card required";
      if (!/^\d{2}\/\d{2}$/.test(data.expiry)) e.expiry = "MM/YY format";
      if (!/^\d{3,4}$/.test(data.cvv))          e.cvv = "3 or 4 digits";
    }
    if (data.method === "upi") {
      if (!/^[\w.\-_]+@[\w]+$/.test(data.upiId)) e.upiId = "Valid UPI ID required (e.g. name@upi)";
    }
    return e;
  };

  const submit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext();
  };

  return (
    <form className="co-form" onSubmit={submit} noValidate>
      <h2 className="co-section-title">Payment Method</h2>

      {/* Method selector */}
      <div className="co-payment-methods">
        {PAYMENT_METHODS.map((m) => (
          <label
            key={m.id}
            className={`co-method-card${data.method === m.id ? " selected" : ""}`}
          >
            <input
              type="radio"
              name="payment_method"
              value={m.id}
              checked={data.method === m.id}
              onChange={() => set("method", m.id)}
              className="co-method-radio"
            />
            <span className="co-method-icon">{m.icon}</span>
            <span className="co-method-label">{m.label}</span>
            {data.method === m.id && (
              <span className="co-method-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
            )}
          </label>
        ))}
      </div>

      {/* Card fields */}
      {data.method === "card" && (
        <div className="co-payment-fields">
          <Field label="Card Number" placeholder="1234 5678 9012 3456"
            value={data.cardNumber}
            onChange={(v) => set("cardNumber", fmtCard(v))}
            error={errors.cardNumber} autoComplete="cc-number" />
          <Field label="Name on Card" placeholder="As printed on card"
            value={data.cardName}
            onChange={(v) => set("cardName", v)}
            error={errors.cardName} autoComplete="cc-name" />
          <div className="co-row">
            <Field label="Expiry" placeholder="MM/YY"
              value={data.expiry}
              onChange={(v) => set("expiry", fmtExp(v))}
              error={errors.expiry} autoComplete="cc-exp" half />
            <Field label="CVV" type="password" placeholder="•••"
              value={data.cvv}
              onChange={(v) => set("cvv", v.replace(/\D/g, "").slice(0, 4))}
              error={errors.cvv} autoComplete="cc-csc" half />
          </div>
          {/* Card logos */}
          <div className="co-card-logos">
            <span>Visa</span><span>Mastercard</span><span>RuPay</span><span>Amex</span>
          </div>
        </div>
      )}

      {/* UPI field */}
      {data.method === "upi" && (
        <div className="co-payment-fields">
          <Field label="UPI ID" placeholder="yourname@upi"
            value={data.upiId}
            onChange={(v) => set("upiId", v)}
            error={errors.upiId} autoComplete="off" />
          <div className="co-upi-apps">
            {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
              <div key={app} className="co-upi-app-chip">{app}</div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet options */}
      {data.method === "wallet" && (
        <div className="co-payment-fields">
          <div className="co-wallet-grid">
            {["Paytm", "PhonePe", "Amazon Pay", "Mobikwik", "Freecharge", "Airtel"].map((w) => (
              <label key={w} className={`co-wallet-card${data.wallet === w ? " selected" : ""}`}>
                <input type="radio" name="wallet" value={w}
                  checked={data.wallet === w}
                  onChange={() => set("wallet", w)}
                  className="co-method-radio" />
                <span className="co-wallet-name">{w}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* COD notice */}
      {data.method === "cod" && (
        <div className="co-payment-fields">
          <div className="co-cod-notice">
            <LockIcon />
            <p>Cash on Delivery available for orders under ₹5,000. An additional ₹49 COD fee applies.</p>
          </div>
        </div>
      )}

      <div className="co-btn-row">
        <button type="button" className="co-back-btn" onClick={onBack}>← Back</button>
        <button type="submit" className="co-next-btn" style={{ flex: 1 }}>
          <span>Review Order →</span>
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────
   STEP 3 — REVIEW & PLACE ORDER
───────────────────────────────────────── */
function ReviewStep({ cart, delivery, payment, onBack, onPlace, placing, apiError }) {
  const subtotal = cart.reduce((s, i) => s + parseInt(i.price.replace(/[^\d]/g, ""), 10) * i.qty, 0);
  const shipping = subtotal >= 2000 ? 0 : 199;
  const gst      = Math.round(subtotal * 0.18);
  const cod      = payment.method === "cod" ? 49 : 0;
  const total    = subtotal + shipping + gst + cod;

  const methodLabel = {
    card:   `Card ending ····${payment.cardNumber?.slice(-4) || ""}`,
    upi:    `UPI — ${payment.upiId}`,
    wallet: `Wallet — ${payment.wallet || ""}`,
    cod:    "Cash on Delivery",
  }[payment.method];

  return (
    <div className="co-review">
      <h2 className="co-section-title">Review Your Order</h2>

      {/* Items */}
      <div className="co-review-items">
        {cart.map((item) => {
          const line = parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.qty;
          return (
            <div key={item.name} className="co-review-item">
              <img src={item.img} alt={item.name} className="co-review-item-img" loading="lazy" />
              <div className="co-review-item-info">
                <span className="co-review-item-origin">{item.origin}</span>
                <span className="co-review-item-name">{item.name}</span>
                <span className="co-review-item-qty">Qty: {item.qty}</span>
              </div>
              <span className="co-review-item-price">₹{line.toLocaleString("en-IN")}</span>
            </div>
          );
        })}
      </div>

      {/* Delivery + Payment summary */}
      <div className="co-review-meta">
        <div className="co-review-meta-block">
          <span className="co-review-meta-label">Deliver to</span>
          <p className="co-review-meta-val">
            {delivery.firstName} {delivery.lastName}<br />
            {delivery.address}{delivery.apt ? `, ${delivery.apt}` : ""}<br />
            {delivery.city}, {delivery.state} – {delivery.pincode}<br />
            <span style={{ opacity: 0.6 }}>{delivery.phone}</span>
          </p>
        </div>
        <div className="co-review-meta-block">
          <span className="co-review-meta-label">Payment</span>
          <p className="co-review-meta-val">{methodLabel}</p>
        </div>
      </div>

      {/* Price breakdown */}
      <div className="co-review-totals">
        <div className="co-review-line"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
        <div className="co-review-line"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
        <div className="co-review-line"><span>GST (18%)</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
        {cod > 0 && <div className="co-review-line"><span>COD Fee</span><span>₹{cod}</span></div>}
        <div className="co-review-line co-review-total">
          <span>Total</span>
          <span className="co-review-total-price">₹{total.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div className="co-btn-row">
        <button type="button" className="co-back-btn" onClick={onBack}>← Back</button>
        <button
          className="co-place-btn"
          onClick={onPlace}
          disabled={placing}
          style={{ flex: 1 }}
        >
          {placing
            ? <span className="co-spinner" />
            : <span><LockIcon /> &nbsp; Place Order · ₹{total.toLocaleString("en-IN")}</span>
          }
        </button>
      </div>
      {apiError && (
        <p className="co-api-error" role="alert">{apiError}</p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   SUCCESS STATE
───────────────────────────────────────── */
function OrderSuccess({ navigate, orderId }) {
  return (
    <div className="co-success">
      <div className="co-success-ring">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
          stroke="var(--gold)" strokeWidth="1.5" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>
      <h2 className="co-success-title">Order Placed!</h2>
      <p className="co-success-sub">
        Thank you for your order. Your confirmation has been sent to your email.
      </p>
      <div className="co-success-order-id">
        Order ID <span>#{orderId}</span>
      </div>
      <p className="co-success-note">
        Estimated delivery: 3–5 business days
      </p>
      <button className="co-next-btn" style={{ maxWidth: 280, margin: "1.5rem auto 0" }}
        onClick={() => navigate("home")}>
        <span>Continue Shopping</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   ORDER MINI-SUMMARY (sidebar/top strip)
───────────────────────────────────────── */
function MiniSummary({ cart }) {
  const [open, setOpen] = useState(false);
  const subtotal = cart.reduce((s, i) => s + parseInt(i.price.replace(/[^\d]/g, ""), 10) * i.qty, 0);
  const total    = subtotal + (subtotal >= 2000 ? 0 : 199) + Math.round(subtotal * 0.18);

  return (
    <div className="co-mini-summary">
      <button
        className="co-mini-summary-toggle"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <span className="co-mini-summary-left">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          {open ? "Hide" : "Show"} order summary
        </span>
        <span className="co-mini-summary-total">₹{total.toLocaleString("en-IN")}</span>
      </button>

      {open && (
        <div className="co-mini-summary-body">
          {cart.map((item) => (
            <div key={item.name} className="co-mini-item">
              <div className="co-mini-item-img-wrap">
                <img src={item.img} alt={item.name} />
                <span className="co-mini-item-qty">{item.qty}</span>
              </div>
              <span className="co-mini-item-name">{item.name}</span>
              <span className="co-mini-item-price">
                ₹{(parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.qty).toLocaleString("en-IN")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   CHECKOUT PAGE ROOT
───────────────────────────────────────── */
const EMPTY_DELIVERY = {
  firstName:"", lastName:"", email:"", phone:"",
  address:"", apt:"", city:"", pincode:"", state:"",
};
const EMPTY_PAYMENT = {
  method:"card", cardNumber:"", cardName:"", expiry:"", cvv:"",
  upiId:"", wallet:"",
};

export default function CheckoutPage({ cart, navigate }) {
  const [step,     setStep]     = useState(0);
  const [delivery, setDelivery] = useState(EMPTY_DELIVERY);
  const [payment,  setPayment]  = useState(EMPTY_PAYMENT);
  const [placing,  setPlacing]  = useState(false);
  const [orderId,  setOrderId]  = useState(null);
  const [orderErr, setOrderErr] = useState("");

  const placeOrder = async () => {
    setPlacing(true);
    setOrderErr("");
    try {
      /* Build items payload — cart items already have name/price/img.
         The server re-fetches prices from DB for security, so we also
         need to pass productId. Since we're fetching from /api/products,
         products now have a real _id from MongoDB. We store it as
         item.productId when addToCart is called from Collections. */
      const items = cart.map((i) => ({
        productId: i._id || i.productId,
        name:      i.name,
        qty:       i.qty,
      }));

      const data = await api.post("/orders", {
        items,
        delivery,
        paymentMethod: payment.method,
      });

      setOrderId(data.order.orderNumber);
    } catch (err) {
      setOrderErr(err.message || "Could not place order. Please try again.");
      setPlacing(false);
    }
  };

  if (orderId) {
    return (
      <div className="co-page">
        <div className="co-page-header">
          <span className="co-brand">COCOPI</span>
        </div>
        <div className="co-body">
          <OrderSuccess navigate={navigate} orderId={orderId} />
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      {/* Header */}
      <div className="co-page-header">
        <button className="co-header-back" onClick={() => step === 0 ? navigate("cart") : setStep(s => s - 1)}>
          <BackIcon />
        </button>
        <span className="co-brand">COCOPI</span>
        <div className="co-header-secure">
          <LockIcon /> <span>Secure Checkout</span>
        </div>
      </div>

      {/* Mobile order summary strip */}
      {cart.length > 0 && <MiniSummary cart={cart} />}

      <div className="co-body">
        <div className="co-layout">

          {/* Left — form steps */}
          <div className="co-form-col">
            <Steps current={step} />

            {step === 0 && (
              <DeliveryStep
                data={delivery}
                setData={setDelivery}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <PaymentStep
                data={payment}
                setData={setPayment}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
                total={0}
              />
            )}
            {step === 2 && (
              <ReviewStep
                cart={cart}
                delivery={delivery}
                payment={payment}
                onBack={() => setStep(1)}
                onPlace={placeOrder}
                placing={placing}
                apiError={orderErr}
              />
            )}
          </div>

          {/* Right — persistent order summary */}
          <aside className="co-order-aside">
            <h3 className="co-aside-title">Your Order</h3>
            {cart.map((item) => {
              const line = parseInt(item.price.replace(/[^\d]/g, ""), 10) * item.qty;
              return (
                <div key={item.name} className="co-aside-item">
                  <div className="co-aside-item-img">
                    <img src={item.img} alt={item.name} loading="lazy" />
                    <span className="co-aside-item-qty">{item.qty}</span>
                  </div>
                  <div className="co-aside-item-info">
                    <span className="co-aside-item-name">{item.name}</span>
                    <span className="co-aside-item-origin">{item.origin}</span>
                  </div>
                  <span className="co-aside-item-price">₹{line.toLocaleString("en-IN")}</span>
                </div>
              );
            })}
            <div className="co-aside-totals">
              {(() => {
                const sub = cart.reduce((s, i) => s + parseInt(i.price.replace(/[^\d]/g, ""), 10) * i.qty, 0);
                const sh  = sub >= 2000 ? 0 : 199;
                const gst = Math.round(sub * 0.18);
                const cod = payment.method === "cod" ? 49 : 0;
                const tot = sub + sh + gst + cod;
                return (
                  <>
                    <div className="co-aside-line"><span>Subtotal</span><span>₹{sub.toLocaleString("en-IN")}</span></div>
                    <div className="co-aside-line"><span>Shipping</span><span>{sh === 0 ? "FREE" : `₹${sh}`}</span></div>
                    <div className="co-aside-line"><span>GST (18%)</span><span>₹{gst.toLocaleString("en-IN")}</span></div>
                    {cod > 0 && <div className="co-aside-line"><span>COD Fee</span><span>₹49</span></div>}
                    <div className="co-aside-line co-aside-total"><span>Total</span>
                      <span className="co-aside-total-price">₹{tot.toLocaleString("en-IN")}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}