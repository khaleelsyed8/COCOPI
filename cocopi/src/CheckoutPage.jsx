import { useState } from "react";
import "./CheckoutPage.css";
import api from "./api";

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
   STATE → CITY MAP
   State is selected first; city list populates based on it.
───────────────────────────────────────── */
const STATE_CITIES = {
  "Andhra Pradesh": ["Visakhapatnam","Vijayawada","Guntur","Nellore","Kurnool","Rajahmundry","Tirupati","Kakinada","Eluru","Anantapur"],
  "Arunachal Pradesh": ["Itanagar","Naharlagun","Pasighat","Tezpur"],
  "Assam": ["Guwahati","Silchar","Dibrugarh","Jorhat","Nagaon","Tinsukia","Tezpur","Bongaigaon"],
  "Bihar": ["Patna","Gaya","Bhagalpur","Muzaffarpur","Purnia","Darbhanga","Bihar Sharif","Arrah"],
  "Chhattisgarh": ["Raipur","Bhilai","Durg","Bilaspur","Korba","Rajnandgaon","Jagdalpur"],
  "Goa": ["Panaji","Margao","Vasco da Gama","Mapusa","Ponda"],
  "Gujarat": ["Ahmedabad","Surat","Vadodara","Rajkot","Bhavnagar","Jamnagar","Gandhinagar","Anand","Bharuch"],
  "Haryana": ["Faridabad","Gurgaon","Panipat","Ambala","Yamunanagar","Rohtak","Hisar","Karnal","Sonipat"],
  "Himachal Pradesh": ["Shimla","Dharamshala","Mandi","Solan","Kullu","Manali","Baddi"],
  "Jharkhand": ["Ranchi","Jamshedpur","Dhanbad","Bokaro","Deoghar","Hazaribagh","Giridih"],
  "Karnataka": ["Bengaluru","Mysuru","Mangaluru","Hubballi","Belagavi","Kalaburagi","Ballari","Davangere","Shimoga","Tumkur","Udupi","Hassan"],
  "Kerala": ["Thiruvananthapuram","Kochi","Kozhikode","Thrissur","Kollam","Palakkad","Alappuzha","Kannur","Kottayam","Malappuram"],
  "Madhya Pradesh": ["Bhopal","Indore","Jabalpur","Gwalior","Ujjain","Sagar","Dewas","Satna","Ratlam","Rewa"],
  "Maharashtra": ["Mumbai","Pune","Nagpur","Thane","Nashik","Aurangabad","Solapur","Kolhapur","Amravati","Nanded","Sangli","Malegaon"],
  "Manipur": ["Imphal","Thoubal","Bishnupur","Churachandpur"],
  "Meghalaya": ["Shillong","Tura","Jowai"],
  "Mizoram": ["Aizawl","Lunglei","Champhai"],
  "Nagaland": ["Kohima","Dimapur","Mokokchung"],
  "Odisha": ["Bhubaneswar","Cuttack","Rourkela","Brahmapur","Sambalpur","Puri","Balasore","Bhadrak"],
  "Punjab": ["Ludhiana","Amritsar","Jalandhar","Patiala","Bathinda","Mohali","Firozpur","Hoshiarpur"],
  "Rajasthan": ["Jaipur","Jodhpur","Kota","Bikaner","Ajmer","Udaipur","Bhilwara","Alwar","Sikar","Bharatpur"],
  "Sikkim": ["Gangtok","Namchi","Gyalshing"],
  "Tamil Nadu": ["Chennai","Coimbatore","Madurai","Tiruchirappalli","Salem","Tirunelveli","Erode","Vellore","Thoothukudi","Tiruppur","Dindigul","Thanjavur"],
  "Telangana": ["Hyderabad","Warangal","Karimnagar","Nizamabad","Khammam","Ramagundam","Mahbubnagar"],
  "Tripura": ["Agartala","Dharmanagar","Udaipur","Kailashahar"],
  "Uttar Pradesh": ["Lucknow","Kanpur","Agra","Varanasi","Meerut","Allahabad","Bareilly","Aligarh","Moradabad","Saharanpur","Ghaziabad","Noida","Mathura","Gorakhpur"],
  "Uttarakhand": ["Dehradun","Haridwar","Roorkee","Haldwani","Rudrapur","Kashipur","Rishikesh","Mussoorie"],
  "West Bengal": ["Kolkata","Howrah","Durgapur","Asansol","Siliguri","Bardhaman","Malda","Jalpaiguri","Kharagpur"],
  "Delhi": ["New Delhi","Central Delhi","North Delhi","South Delhi","East Delhi","West Delhi","Dwarka","Rohini","Pitampura","Lajpat Nagar"],
  "Jammu & Kashmir": ["Srinagar","Jammu","Anantnag","Sopore","Baramulla","Kathua"],
  "Ladakh": ["Leh","Kargil"],
  "Puducherry": ["Puducherry","Karaikal","Mahe","Yanam"],
};

const ALL_STATES = Object.keys(STATE_CITIES).sort();

function DeliveryStep({ data, setData, onNext }) {
  const [errors, setErrors] = useState({});

  const set = (key, val) => {
    setData((d) => {
      // When state changes, reset city
      if (key === "state") return { ...d, state: val, city: "" };
      return { ...d, [key]: val };
    });
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const cities = data.state ? (STATE_CITIES[data.state] || []) : [];

  const validate = () => {
    const e = {};
    if (!data.firstName.trim())                           e.firstName = "Required";
    if (!data.lastName.trim())                            e.lastName  = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))  e.email     = "Valid email required";
    if (!/^[6-9]\d{9}$/.test(data.phone))                e.phone     = "Valid 10-digit mobile required";
    if (!data.address.trim())                             e.address   = "Required";
    if (!data.state)                                      e.state     = "Select a state first";
    if (!data.city)                                       e.city      = "Select a city";
    if (!/^\d{6}$/.test(data.pincode))                   e.pincode   = "Valid 6-digit PIN required";
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

      {/* State FIRST */}
      <div className={`co-field${errors.state ? " errored" : ""}`}>
        <label className="co-label">State *</label>
        <select
          className="co-input co-select"
          value={data.state}
          onChange={(e) => set("state", e.target.value)}
          aria-invalid={!!errors.state}
        >
          <option value="">Select state</option>
          {ALL_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {errors.state && <span className="co-field-error" role="alert">{errors.state}</span>}
      </div>

      {/* City — depends on state */}
      <div className={`co-field${errors.city ? " errored" : ""}${!data.state ? " co-field-disabled" : ""}`}>
        <label className="co-label">
          City * {!data.state && <span className="co-label-hint">(select state first)</span>}
        </label>
        <select
          className="co-input co-select"
          value={data.city}
          onChange={(e) => set("city", e.target.value)}
          disabled={!data.state}
          aria-invalid={!!errors.city}
        >
          <option value="">
            {data.state ? `Select city in ${data.state}` : "Select state first"}
          </option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.city && <span className="co-field-error" role="alert">{errors.city}</span>}
      </div>

      <div className="co-row">
        <Field label="PIN Code" placeholder="560001" value={data.pincode}
          onChange={(v) => set("pincode", v)} error={errors.pincode}
          autoComplete="postal-code" half />
      </div>

      <button className="co-next-btn" type="submit">
        <span>Continue to Payment →</span>
      </button>
    </form>
  );
}

/* ─────────────────────────────────────────
   STEP 2 — PAYMENT (Cash on Delivery only)
───────────────────────────────────────── */
function PaymentStep({ onNext, onBack }) {
  return (
    <div className="co-form">
      <h2 className="co-section-title">Payment Method</h2>

      {/* CoD — only option */}
      <div className="co-cod-selected">
        <div className="co-cod-icon">🏠</div>
        <div className="co-cod-info">
          <span className="co-cod-title">Cash on Delivery</span>
          <span className="co-cod-sub">Pay when your order arrives at your door.</span>
        </div>
        <div className="co-cod-check">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>

      <div className="co-cod-notice">
        <LockIcon />
        <div>
          <p style={{ marginBottom: ".3rem", fontWeight: 600 }}>
            Online payments coming soon
          </p>
          <p>
            We currently accept Cash on Delivery only. An additional ₹49 handling
            fee applies. No payment is collected until your order is delivered.
          </p>
        </div>
      </div>

      <div className="co-btn-row">
        <button type="button" className="co-back-btn" onClick={onBack}>← Back</button>
        <button className="co-next-btn" onClick={onNext} style={{ flex: 1 }}>
          <span>Review Order →</span>
        </button>
      </div>
    </div>
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

export default function CheckoutPage({ cart, navigate, clearCart }) {
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
      clearCart && clearCart(); // Clear cart after successful order
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