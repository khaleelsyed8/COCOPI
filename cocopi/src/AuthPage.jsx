import { useState } from "react";
import "./AuthPage.css";
import { useAuth } from "./useAuth";

/* ─────────────────────────────────────────
   Cacao Pod SVG — duplicated here so AuthPage
   is self-contained (no cross-file import needed)
───────────────────────────────────────── */
function CacaoPod({ size = 36, color = "var(--gold)" }) {
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
      <path d="M40 22 Q30 18 22 18" stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M40 22 Q50 14 60 18 Q52 22 46 26" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M40 22 Q50 18 58 18" stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
      <ellipse cx="37" cy="46" rx="2.2" ry="3" fill={color} opacity="0.25" />
      <ellipse cx="43" cy="46" rx="2.2" ry="3" fill={color} opacity="0.25" />
      <ellipse cx="40" cy="53" rx="2.2" ry="3" fill={color} opacity="0.2" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   FIELD — reusable labeled input
───────────────────────────────────────── */
function Field({ label, type = "text", placeholder, value, onChange, error, autoComplete }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={`auth-field${focused ? " focused" : ""}${error ? " errored" : ""}`}>
      <label className="auth-label">{label}</label>
      <input
        type={type}
        className="auth-input"
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        aria-invalid={!!error}
      />
      {error && <span className="auth-field-error" role="alert">{error}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────
   DIVIDER with text
───────────────────────────────────────── */
function OrDivider() {
  return (
    <div className="auth-divider">
      <span className="auth-divider-line" />
      <span className="auth-divider-text">or</span>
      <span className="auth-divider-line" />
    </div>
  );
}

/* ─────────────────────────────────────────
   SOCIAL BUTTON
───────────────────────────────────────── */
function SocialBtn({ icon, label }) {
  return (
    <button className="auth-social-btn" type="button" aria-label={`Continue with ${label}`}>
      <span className="auth-social-icon">{icon}</span>
      <span>Continue with {label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm({ onSwitch, onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const { login } = useAuth();

  const validate = () => {
    const e = {};
    if (!EMAIL_RE.test(email))  e.email    = "Enter a valid email address.";
    if (password.length < 6)    e.password = "Password must be at least 6 characters.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await login(email, password);
      onSuccess();
    } catch (err) {
      setApiError(err.message || "Sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Field
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Password"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
        error={errors.password}
        autoComplete="current-password"
      />
      <button className="auth-forgot" type="button">Forgot password?</button>

      {apiError && (
        <p className="auth-api-error" role="alert">{apiError}</p>
      )}

      <button className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? <span className="auth-spinner" /> : <span>Sign In</span>}
      </button>

      <OrDivider />

      <div className="auth-socials">
        <SocialBtn label="Google"
          icon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
        />
      </div>

      <p className="auth-switch-text">
        Don't have an account?{" "}
        <button type="button" className="auth-switch-link" onClick={onSwitch}>
          Create one
        </button>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────
   SIGNUP FORM
───────────────────────────────────────── */
function SignupForm({ onSwitch, onSuccess }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [errors,   setErrors]   = useState({});
  const [loading,  setLoading]  = useState(false);
  const [apiError, setApiError] = useState("");
  const { register } = useAuth();

  const validate = () => {
    const e = {};
    if (name.trim().length < 2)          e.name     = "Enter your full name.";
    if (!EMAIL_RE.test(email))           e.email    = "Enter a valid email address.";
    if (password.length < 8)             e.password = "Use at least 8 characters.";
    if (confirm !== password)            e.confirm  = "Passwords don't match.";
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError("");
    setLoading(true);
    try {
      await register(name, email, password);
      onSuccess();
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* Password strength */
  const strength = password.length === 0 ? 0
    : password.length < 8  ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 3
    : 2;
  const strengthLabel = ["", "Weak", "Good", "Strong"][strength];
  const strengthClass = ["", "weak", "good", "strong"][strength];

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Field
        label="Full Name"
        placeholder="Your name"
        value={name}
        onChange={(v) => { setName(v); setErrors((e) => ({ ...e, name: "" })); }}
        error={errors.name}
        autoComplete="name"
      />
      <Field
        label="Email Address"
        type="email"
        placeholder="you@example.com"
        value={email}
        onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Password"
        type="password"
        placeholder="Min. 8 characters"
        value={password}
        onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
        error={errors.password}
        autoComplete="new-password"
      />
      {password.length > 0 && (
        <div className="auth-strength">
          <div className={`auth-strength-bar ${strengthClass}`}>
            <span /><span /><span />
          </div>
          <span className={`auth-strength-label ${strengthClass}`}>{strengthLabel}</span>
        </div>
      )}
      <Field
        label="Confirm Password"
        type="password"
        placeholder="Repeat password"
        value={confirm}
        onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: "" })); }}
        error={errors.confirm}
        autoComplete="new-password"
      />

      {apiError && (
        <p className="auth-api-error" role="alert">{apiError}</p>
      )}

      <button className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? <span className="auth-spinner" /> : <span>Create Account</span>}
      </button>

      <OrDivider />

      <div className="auth-socials">
        <SocialBtn label="Google"
          icon={<svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
        />
      </div>

      <p className="auth-switch-text">
        Already have an account?{" "}
        <button type="button" className="auth-switch-link" onClick={onSwitch}>
          Sign in
        </button>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────
   SUCCESS OVERLAY
───────────────────────────────────────── */
function SuccessOverlay({ mode, onDone }) {
  return (
    <div className="auth-success">
      <div className="auth-success-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
          stroke="var(--gold)" strokeWidth="1.6" strokeLinecap="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <h3 className="auth-success-title">
        {mode === "login" ? "Welcome back." : "Welcome to Cocopi."}
      </h3>
      <p className="auth-success-sub">
        {mode === "login"
          ? "You're signed in to your account."
          : "Your account has been created."}
      </p>
      <button className="auth-submit-btn" style={{ marginTop: "2rem" }} onClick={onDone}>
        <span>Continue Shopping</span>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────
   AUTH PAGE ROOT
───────────────────────────────────────── */
export default function AuthPage({ navigate }) {
  const [mode,    setMode]    = useState("login"); // "login" | "signup"
  const [success, setSuccess] = useState(false);

  const toggleMode = () => { setMode((m) => (m === "login" ? "signup" : "login")); setSuccess(false); };

  return (
    <div className="auth-page">
      {/* Left panel — brand */}
      <div className="auth-left">
        <div className="auth-left-inner">
          <button className="auth-back-btn" onClick={() => navigate("home")}>
            ← Back to store
          </button>
          <div className="auth-brand">
            <CacaoPod size={52} />
            <span className="auth-brand-name">COCOPI</span>
            <span className="auth-brand-tagline">Artisan Chocolate</span>
          </div>
          <blockquote className="auth-quote">
            "Every great bar begins with a story.<br />Yours starts here."
          </blockquote>
          <div className="auth-left-badges">
            <span>✦ Bean to Bar</span>
            <span>✦ Single Origin</span>
            <span>✦ Est. 1897</span>
          </div>
        </div>
        {/* Decorative background circles */}
        <div className="auth-left-orb auth-left-orb-1" />
        <div className="auth-left-orb auth-left-orb-2" />
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-right-inner">

          {success ? (
            <SuccessOverlay mode={mode} onDone={() => navigate("home")} />
          ) : (
            <>
              {/* Tab switcher */}
              <div className="auth-tabs" role="tablist">
                <button
                  className={`auth-tab${mode === "login" ? " active" : ""}`}
                  onClick={() => setMode("login")}
                  role="tab" aria-selected={mode === "login"}
                >
                  Sign In
                </button>
                <button
                  className={`auth-tab${mode === "signup" ? " active" : ""}`}
                  onClick={() => setMode("signup")}
                  role="tab" aria-selected={mode === "signup"}
                >
                  Create Account
                </button>
              </div>

              <div className="auth-heading-wrap">
                <h1 className="auth-heading">
                  {mode === "login" ? "Welcome back." : "Join Cocopi."}
                </h1>
                <p className="auth-subheading">
                  {mode === "login"
                    ? "Sign in to access your orders and wishlist."
                    : "Create an account for exclusive access and offers."}
                </p>
              </div>

              {mode === "login" ? (
                <LoginForm  onSwitch={toggleMode} onSuccess={() => setSuccess(true)} />
              ) : (
                <SignupForm onSwitch={toggleMode} onSuccess={() => setSuccess(true)} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}