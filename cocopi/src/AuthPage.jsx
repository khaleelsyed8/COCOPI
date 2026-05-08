import { useState, useRef } from "react";
import "./AuthPage.css";
import { useAuth } from "./useAuth";

/* ─────────────────────────────────────────
   CACAO POD SVG
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
   VALIDATION CONSTANTS
───────────────────────────────────────── */

/* Trusted email providers only */
const TRUSTED_DOMAINS = [
  "gmail.com", "googlemail.com",
  "outlook.com", "hotmail.com", "hotmail.in", "live.com", "live.in", "msn.com",
  "yahoo.com", "yahoo.in", "yahoo.co.in", "ymail.com",
  "icloud.com", "me.com", "mac.com",
  "rediffmail.com", "rediff.com",
  "protonmail.com", "proton.me",
  "zoho.com",
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* Password rules — all must pass for "Strong" */
const PWD_RULES = [
  { re: /.{8,}/,          label: "At least 8 characters"         },
  { re: /[A-Z]/,          label: "One uppercase letter"           },
  { re: /[a-z]/,          label: "One lowercase letter"           },
  { re: /[0-9]/,          label: "One number"                     },
  { re: /[^A-Za-z0-9]/,   label: "One special character (!@#…)"  },
];

const MAX_ATTEMPTS = 5; // lockout after this many failed logins

function validateEmail(raw) {
  const email = raw.trim().toLowerCase();
  if (!EMAIL_RE.test(email))       return "Enter a valid email address.";
  const domain = email.split("@")[1];
  if (!TRUSTED_DOMAINS.includes(domain))
    return `Please use a trusted provider (Gmail, Outlook, Yahoo, iCloud, Rediffmail…).`;
  return null;
}

function validatePassword(pw, isSignup = false) {
  if (!pw) return "Password is required.";
  if (!isSignup && pw.length < 6) return "Password must be at least 6 characters.";
  if (isSignup) {
    const failed = PWD_RULES.filter((r) => !r.re.test(pw));
    if (failed.length) return failed[0].label + " required.";
  }
  return null;
}

/* Password strength score 0–5 */
function pwdStrength(pw) {
  return PWD_RULES.filter((r) => r.re.test(pw)).length;
}

/* ─────────────────────────────────────────
   FIELD — labeled input with optional
   password visibility toggle
───────────────────────────────────────── */
function Field({ label, type = "text", placeholder, value, onChange,
  error, autoComplete, showToggle }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputType = showToggle ? (visible ? "text" : "password") : type;

  return (
    <div className={`auth-field${focused ? " focused" : ""}${error ? " errored" : ""}`}>
      <label className="auth-label">{label}</label>
      <div className="auth-input-wrap">
        <input
          type={inputType}
          className="auth-input"
          placeholder={placeholder}
          value={value}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
        />
        {showToggle && (
          <button
            type="button"
            className="auth-eye-btn"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {visible ? (
              /* Eye-off */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              /* Eye */
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <span className="auth-field-error" role="alert">{error}</span>}
    </div>
  );
}

/* ─────────────────────────────────────────
   PASSWORD STRENGTH METER
───────────────────────────────────────── */
function StrengthMeter({ password }) {
  if (!password) return null;
  const score  = pwdStrength(password);
  const labels = ["", "Very Weak", "Weak", "Fair", "Strong", "Very Strong"];
  const cls    = ["", "very-weak", "weak", "fair", "strong", "very-strong"][score];

  return (
    <div className="auth-strength">
      <div className="auth-strength-bars">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`auth-strength-seg${score >= n ? ` filled ${cls}` : ""}`}
          />
        ))}
      </div>
      <div className="auth-strength-row">
        <span className={`auth-strength-label ${cls}`}>{labels[score]}</span>
        <div className="auth-pwd-rules">
          {PWD_RULES.map((r) => (
            <span key={r.label}
              className={`auth-pwd-rule${r.re.test(password) ? " met" : ""}`}>
              {r.re.test(password) ? "✓" : "○"} {r.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   DIVIDER
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
    <button className="auth-social-btn" type="button"
      aria-label={`Continue with ${label}`}>
      <span className="auth-social-icon">{icon}</span>
      <span>Continue with {label}</span>
    </button>
  );
}

const GoogleIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

/* ─────────────────────────────────────────
   LOGIN FORM
───────────────────────────────────────── */
function LoginForm({ onSwitch, onSuccess }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const attempts  = useRef(0);
  const [locked,  setLocked]    = useState(false);
  const { login } = useAuth();

  // LoginForm validate — only format check, no domain restriction
const validate = () => {
  const e = {};
  if (!EMAIL_RE.test(email.trim())) e.email = "Enter a valid email address.";
  if (!password)                    e.password = "Password is required.";
  else if (password.length < 6)     e.password = "Password must be at least 6 characters.";
  return e;
};

  const submit = async (ev) => {
    ev.preventDefault();
    if (locked) return;

    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setApiError("");
    setLoading(true);

    try {
      await login({email, password});
      attempts.current = 0;
      onSuccess();
    } catch (err) {
      attempts.current += 1;
      const remaining = MAX_ATTEMPTS - attempts.current;

      if (attempts.current >= MAX_ATTEMPTS) {
        setLocked(true);
        setApiError(
          "Too many failed attempts. Please wait a few minutes before trying again."
        );
      } else {
        setApiError(
          `${err.message || "Incorrect email or password."}` +
          (remaining <= 2 ? ` ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` : "")
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="auth-form" onSubmit={submit} noValidate>
      <Field
        label="Email Address"
        type="email"
        placeholder="you@gmail.com"
        value={email}
        onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Password"
        placeholder="••••••••"
        value={password}
        onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
        error={errors.password}
        autoComplete="current-password"
        showToggle
      />

      <button className="auth-forgot" type="button">Forgot password?</button>

      {apiError && (
        <div className={`auth-api-error${locked ? " locked" : ""}`} role="alert">
          {locked && <span className="auth-lock-icon">🔒</span>}
          {apiError}
        </div>
      )}

      <button className="auth-submit-btn" type="submit" disabled={loading || locked}>
        {loading ? <span className="auth-spinner" /> : <span>Sign In</span>}
      </button>

      <OrDivider />
      <div className="auth-socials">
        <SocialBtn label="Google" icon={GoogleIcon} />
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
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const { register } = useAuth();

  const validate = () => {
    const e = {};
    if (name.trim().length < 2)    e.name    = "Enter your full name (at least 2 characters).";

    const emailErr = validateEmail(email);
    if (emailErr)                  e.email   = emailErr;

    const pwdErr = validatePassword(password, true);
    if (pwdErr)                    e.password = pwdErr;

    if (confirm !== password)      e.confirm = "Passwords don't match.";
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
      await register({name, email, password});
      onSuccess();
    } catch (err) {
      setApiError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
        placeholder="you@gmail.com"
        value={email}
        onChange={(v) => { setEmail(v); setErrors((e) => ({ ...e, email: "" })); }}
        error={errors.email}
        autoComplete="email"
      />
      <Field
        label="Password"
        placeholder="Min. 8 characters"
        value={password}
        onChange={(v) => { setPassword(v); setErrors((e) => ({ ...e, password: "" })); }}
        error={errors.password}
        autoComplete="new-password"
        showToggle
      />

      <StrengthMeter password={password} />

      <Field
        label="Confirm Password"
        placeholder="Repeat password"
        value={confirm}
        onChange={(v) => { setConfirm(v); setErrors((e) => ({ ...e, confirm: "" })); }}
        error={errors.confirm}
        autoComplete="new-password"
        showToggle
      />

      {apiError && (
        <div className="auth-api-error" role="alert">{apiError}</div>
      )}

      <button className="auth-submit-btn" type="submit" disabled={loading}>
        {loading ? <span className="auth-spinner" /> : <span>Create Account</span>}
      </button>

      <OrDivider />
      <div className="auth-socials">
        <SocialBtn label="Google" icon={GoogleIcon} />
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
  const [mode,    setMode]    = useState("login");
  const [success, setSuccess] = useState(false);

  const toggleMode = () => {
    setMode((m) => (m === "login" ? "signup" : "login"));
    setSuccess(false);
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
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
        <div className="auth-left-orb auth-left-orb-1" />
        <div className="auth-left-orb auth-left-orb-2" />
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-right-inner">
          {success ? (
            <SuccessOverlay mode={mode} onDone={() => navigate("home")} />
          ) : (
            <>
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

              {mode === "login"
                ? <LoginForm  onSwitch={toggleMode} onSuccess={() => setSuccess(true)} />
                : <SignupForm onSwitch={toggleMode} onSuccess={() => setSuccess(true)} />
              }
            </>
          )}
        </div>
      </div>
    </div>
  );
}