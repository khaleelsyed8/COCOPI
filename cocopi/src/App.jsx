import { useState, useEffect, useRef, useCallback } from "react";
import "./App.css";
import BannerImg from "./Banner.png";
import PackageImg from "./Package.png";
import AuthPage from "./AuthPage";
import CartPage from "./CartPage";
import CheckoutPage from "./CheckoutPage";
import {api} from "./api";
import { useAuth } from "./useAuth";

/* ─────────────────────────────────────────
   VIDEO BACKGROUND
   autoPlay muted loop playsInline required for mobile autoplay.
   poster = static fallback before video loads.
───────────────────────────────────────── */
function VideoBackground({ src, poster, overlayOpacity = 0.52 }) {
  return (
    <div className="vid-bg">
      <video autoPlay muted loop playsInline poster={poster} className="vid-el">
        <source src={src} type="video/mp4" />
      </video>
      <div className="vid-overlay" style={{ opacity: overlayOpacity }} />
    </div>
  );
}

/* ─────────────────────────────────────────
   PARALLAX HOOK
   BUG FIX: guard against missing parentElement
   BUG FIX: skip on touch/small screen to prevent jitter
───────────────────────────────────────── */
function useParallax(ref, speed = 0.12) {
  useEffect(() => {
    if (window.matchMedia("(max-width: 960px)").matches) return;
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const rect = el.parentElement?.getBoundingClientRect();
      if (!rect) return;
      el.style.transform = `translateY(${-(rect.top * speed)}px)`;
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [ref, speed]);
}

/* ─────────────────────────────────────────
   IMAGE WITH SKELETON SHIMMER
───────────────────────────────────────── */
function ImgWithSkeleton({ src, alt, style = {}, ...props }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className="img-wrap">
      {!loaded && <div className="img-skeleton" />}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, ...style }}
        {...props}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   CACAO POD SVG LOGO
   Hand-traced from the brand imagery — inline SVG
   so it scales perfectly at any size, zero blur.
───────────────────────────────────────── */
function CacaoPodLogo({ size = 32, color = "var(--gold)" }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ display: "block" }}
    >
      {/* Main pod body */}
      <ellipse cx="40" cy="48" rx="14" ry="20" stroke={color} strokeWidth="1.6" fill="none" />
      {/* Pod ridges */}
      <path d="M30 36 Q40 28 50 36" stroke={color} strokeWidth="1.2" fill="none" />
      <path d="M28 42 Q40 34 52 42" stroke={color} strokeWidth="1.1" fill="none" />
      <path d="M27 50 Q40 42 53 50" stroke={color} strokeWidth="1.1" fill="none" />
      <path d="M28 58 Q40 50 52 58" stroke={color} strokeWidth="1.1" fill="none" />
      {/* Stem */}
      <path d="M40 28 Q40 22 40 18" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      {/* Left leaf */}
      <path
        d="M40 22 Q30 14 20 18 Q28 22 34 26"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Left leaf vein */}
      <path d="M40 22 Q30 18 22 18" stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Right leaf */}
      <path
        d="M40 22 Q50 14 60 18 Q52 22 46 26"
        stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round"
      />
      {/* Right leaf vein */}
      <path d="M40 22 Q50 18 58 18" stroke={color} strokeWidth="0.7" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* Inner beans hint */}
      <ellipse cx="37" cy="46" rx="2.2" ry="3" fill={color} opacity="0.25" />
      <ellipse cx="43" cy="46" rx="2.2" ry="3" fill={color} opacity="0.25" />
      <ellipse cx="40" cy="53" rx="2.2" ry="3" fill={color} opacity="0.2" />
    </svg>
  );
}

/* ─────────────────────────────────────────
   LOADER
───────────────────────────────────────── */
function Loader({ onDone }) {
  const [active, setActive] = useState(false);
  const [out, setOut] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const t1 = setTimeout(() => setActive(true), 280);
    const t2 = setTimeout(() => {
      setOut(true);
      document.body.style.overflow = "";
      onDone();
    }, 3100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  const pieces = [
    { x: 8,   y: 6,   w: 52, h: 44, c: "#b07d35", rot: "-22deg", tx: "-8px",  d: 0.04 },
    { x: 64,  y: 6,   w: 52, h: 44, c: "#e8c06a", rot: "18deg",  tx: "4px",   d: 0.17 },
    { x: 120, y: 6,   w: 52, h: 44, c: "#b07d35", rot: "-13deg", tx: "-4px",  d: 0.11 },
    { x: 176, y: 6,   w: 56, h: 44, c: "#e8c06a", rot: "29deg",  tx: "10px",  d: 0.06 },
    { x: 8,   y: 54,  w: 52, h: 44, c: "#1a1a1a", rot: "21deg",  tx: "-6px",  d: 0.29 },
    { x: 64,  y: 54,  w: 52, h: 44, c: "#b07d35", rot: "-27deg", tx: "8px",   d: 0.41 },
    { x: 120, y: 54,  w: 52, h: 44, c: "#e8c06a", rot: "15deg",  tx: "-2px",  d: 0.34 },
    { x: 176, y: 54,  w: 56, h: 44, c: "#1a1a1a", rot: "-20deg", tx: "12px",  d: 0.21 },
    { x: 8,   y: 102, w: 52, h: 44, c: "#e8c06a", rot: "-34deg", tx: "-10px", d: 0.51 },
    { x: 64,  y: 102, w: 52, h: 44, c: "#1a1a1a", rot: "24deg",  tx: "6px",   d: 0.63 },
    { x: 120, y: 102, w: 52, h: 44, c: "#b07d35", rot: "-18deg", tx: "-6px",  d: 0.55 },
    { x: 176, y: 102, w: 56, h: 44, c: "#e8c06a", rot: "32deg",  tx: "14px",  d: 0.44 },
  ];

  return (
    <div id="loader" className={out ? "out" : ""}>
      {/* Ambient glow orbs behind the glass card */}
      <div className="ld-orb ld-orb-1" />
      <div className="ld-orb ld-orb-2" />
      <div className="ld-orb ld-orb-3" />

      {/* Glassmorphic card */}
      <div className={`ld-glass-card${active ? " s" : ""}`}>
        {/* Gold shimmer line top */}
        <div className={`ld-bar-line${active ? " s" : ""}`} />

        <svg width="244" height="162" viewBox="0 0 244 162" style={{ margin: "1.2rem auto 0", display: "block" }}>
          {pieces.map((p, i) => (
            <rect
              key={i}
              x={p.x} y={p.y} width={p.w} height={p.h} rx="4" fill={p.c}
              className="ld-piece"
              style={{
                "--rot": p.rot,
                "--tx": p.tx,
                animationDelay: `${p.d}s`,
                animationPlayState: active ? "running" : "paused",
              }}
            />
          ))}
          <line x1="62"  y1="3"   x2="62"  y2="149" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="118" y1="3"   x2="118" y2="149" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="174" y1="3"   x2="174" y2="149" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="5"   y1="52"  x2="239" y2="52"  stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
          <line x1="5"   y1="100" x2="239" y2="100" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
        </svg>

        <div className={`ld-brand${active ? " s" : ""}`}>COCOPI</div>
        <div className={`ld-tagline${active ? " s" : ""}`}>Artisan Chocolate</div>

        {/* Progress bar at bottom of card */}
        <div className="ld-progress-wrap">
          <div className={`ld-progress-bar${active ? " s" : ""}`} />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   CURSOR
   BUG FIX: hide on touch devices (pointer: coarse)
   BUG FIX: use isTouchDevice guard so cursor: none
            is NOT applied when using touch
───────────────────────────────────────── */
function Cursor() {
  const dotRef  = useRef(null);
  const ringRef = useRef(null);
  const mouse   = useRef({ x: -200, y: -200 });
  const current = useRef({ x: -200, y: -200 });
  const rafRef  = useRef(null);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const touch = window.matchMedia("(pointer: coarse)").matches;
    setIsTouch(touch);
    if (touch) return;

    const onMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top  = e.clientY + "px";
      }
      /* FIX: only hide native cursor after the custom one is positioned */
      document.body.classList.add("cursor-ready");
    };
    const setHov = (on) => {
      dotRef.current?.classList.toggle("hov", on);
      ringRef.current?.classList.toggle("hov", on);
    };
    const onOver = (e) => {
      if (e.target.closest("a,button,.p-card,.j-card,.test-dot")) setHov(true);
    };
    const onOut = (e) => {
      if (e.target.closest("a,button,.p-card,.j-card,.test-dot")) setHov(false);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout",  onOut);

    const loop = () => {
      current.current.x += (mouse.current.x - current.current.x) * 0.1;
      current.current.y += (mouse.current.y - current.current.y) * 0.1;
      if (ringRef.current) {
        ringRef.current.style.left = current.current.x + "px";
        ringRef.current.style.top  = current.current.y + "px";
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout",  onOut);
      cancelAnimationFrame(rafRef.current);
      /* FIX: restore native cursor when component unmounts */
      document.body.classList.remove("cursor-ready");
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      <div id="c-dot"  ref={dotRef}  />
      <div id="c-ring" ref={ringRef} />
    </>
  );
}

/* ─────────────────────────────────────────
   SCROLL PROGRESS + BACK TO TOP
───────────────────────────────────────── */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    const update = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (ref.current)
        ref.current.style.width =
          (total > 0 ? (window.scrollY / total) * 100 : 0) + "%";
    };
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return <div id="scroll-prog" ref={ref} />;
}

function BackToTop() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const h = () => setVis(window.scrollY > 600);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <button
      className={`btt${vis ? " btt-vis" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Back to top"
    >
      ↑
    </button>
  );
}

/* ─────────────────────────────────────────
   NAV
   BUG FIX: added aria-label on mobile menu
   ENHANCEMENT: SVG cacao pod logo mark
───────────────────────────────────────── */
function Nav({ navigate = () => {}, cart = [] }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const { user, logout }        = useAuth();
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  /* Close user menu on outside click */
  useEffect(() => {
    if (!userMenu) return;
    const handler = (e) => {
      if (!e.target.closest(".nav-user-menu-wrap")) setUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [userMenu]);

  const links = [
    ["story", "Story"],
    ["journey", "Journey"],
    ["collections", "Collections"],
    ["craft", "Craft"],
    ["testimonials", "Testimonials"],
  ];

  const handleAnchor = (id) => {
    setMenuOpen(false);
    navigate("home");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 80);
  };

  const handleLogout = () => {
    logout();
    setUserMenu(false);
    navigate("home");
  };

  /* User initials badge */
  const initials = user
    ? user.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <>
      <nav className={`nav-pill${scrolled ? " scrolled" : ""}`}>
        <button className="nav-logo" aria-label="Cocopi home" onClick={() => navigate("home")}>
          <CacaoPodLogo size={24} color={scrolled ? "var(--gold)" : "rgba(255,255,255,0.9)"} />
          <span className="nav-logo-text">COC<span className="nav-logo-curs">O</span>PI</span>
        </button>

        <ul className="nav-links">
          {links.map(([id, label]) => (
            <li key={id}>
              <button className="nav-anchor-btn" onClick={() => handleAnchor(id)}>{label}</button>
            </li>
          ))}
        </ul>

        <div className="nav-actions">
          {/* User icon / initials */}
          <div className="nav-user-menu-wrap">
            <button
              className="nav-action-btn"
              onClick={() => user ? setUserMenu(!userMenu) : navigate("auth")}
              aria-label={user ? "Account menu" : "Sign in"}
            >
              {user ? (
                <span className="nav-user-initials">{initials}</span>
              ) : (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              )}
            </button>

            {/* Dropdown when logged in */}
            {userMenu && user && (
              <div className="nav-user-dropdown">
                <div className="nav-user-dropdown-header">
                  <span className="nav-user-dropdown-name">{user.name}</span>
                  <span className="nav-user-dropdown-email">{user.email}</span>
                </div>
                <div className="nav-user-dropdown-divider" />
                <button className="nav-user-dropdown-item"
                  onClick={() => { setUserMenu(false); navigate("orders"); }}>
                  My Orders
                </button>
                <button className="nav-user-dropdown-item nav-user-dropdown-logout"
                  onClick={handleLogout}>
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Cart */}
          <button className="nav-action-btn nav-cart-btn"
            onClick={() => navigate("cart")} aria-label="Cart">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
          </button>

          <button
            className={`nav-hamburger${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-drawer${menuOpen ? " open" : ""}`}
        role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div className="mobile-drawer-inner">
          <CacaoPodLogo size={48} color="var(--gold)" />
          <span className="mobile-drawer-brand">COCOPI</span>
          {user && (
            <span className="mobile-drawer-user">
              Signed in as &nbsp;"<span className="usersname">{user.name.split(" ")[0]}</span>"
            </span>
          )}
          <nav aria-label="Mobile navigation">
            <ul>
              {links.map(([id, label]) => (
                <li key={id}>
                  <button onClick={() => handleAnchor(id)}>{label}</button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mobile-drawer-actions">
            {user ? (
              <button onClick={handleLogout}>Sign Out</button>
            ) : (
              <button onClick={() => { setMenuOpen(false); navigate("auth"); }}>Sign In</button>
            )}
            <button onClick={() => { setMenuOpen(false); navigate("cart"); }}>
              Cart {cartCount > 0 && `(${cartCount})`}
            </button>
          </div>
          <span className="mobile-drawer-tagline">Artisan Chocolate · Est. 1897</span>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────
   SECTION HEADER (reusable)
───────────────────────────────────────── */
function SectionHeader({ eyebrow, children, className = "" }) {
  return (
    <div className={`section-header ${className}`}>
      <div className="sec-line sr-scale" />
      <span className="sec-eyebrow sr-blur">{eyebrow}</span>
      <h2 className="sec-h2 sr">{children}</h2>
    </div>
  );
}

/* ─────────────────────────────────────────
   HERO
───────────────────────────────────────── */
function Hero({ navigate = () => {} }) {
  return (
    <section id="hero">
      <VideoBackground
        src="https://www.pexels.com/download/video/4458587/"
        poster="https://images.unsplash.com/photo-1511381939415-e44f32bdd0d6?w=1920&q=60"
        overlayOpacity={0.48}
      />
      <div className="hero-grain" />
      <div className="hero-ring hero-ring-sm" />
      <div className="hero-ring hero-ring-md" style={{ animationDelay: "-2.5s" }} />
      <div className="hero-ring hero-ring-lg" style={{ animationDelay: "-5s" }} />

      <div className="hero-content">
        <p className="h-pre">— est. 1897 · bean to bar atelier —</p>
        <h1 className="h-title">COC<span className="h-accent">O</span>PI</h1>
        <span className="h-curs">Artisan Chocolate</span>
        <div className="h-divider" />
        <p className="h-desc">
          We travel to the world's finest cacao origins — hand-selecting,
          fermenting, and crafting chocolates of extraordinary complexity and
          lasting beauty.
        </p>
        <div className="scroll-cue" aria-hidden="true">
        <span className="scroll-cue-label">Discover</span>
        <div className="scroll-cue-line" />
      </div>
        <div className="h-actions">
          <button
            className="btn-primary"
            onClick={() => {
              document.getElementById("collections")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>Explore Collection</span>
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              document.getElementById("story")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Our Story
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   MARQUEE
───────────────────────────────────────── */
function Marquee() {
  const [rev, setRev] = useState(false);
  const items = [
    "Single Origin", "Dark 85%", "Milk Truffle", "Bean to Bar",
    "Grand Cru", "Ecuador · Ghana · Vietnam", "White Couverture", "Artisan Craft",
  ];
  return (
    <div className="mband" aria-hidden="true">
      <div
        className="mtrack"
        style={{ animationDirection: rev ? "reverse" : "normal" }}
        onMouseEnter={() => setRev(true)}
        onMouseLeave={() => setRev(false)}
      >
        {[...items, ...items].map((t, i) => (
          <span key={i} className="mitem">
            {t}<span className="mdot"> ·</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   BRAND BANNER SECTION
   New section between Marquee and Story.
   Uses Banner.png from local device.
   Falls back gracefully if image not loaded.
───────────────────────────────────────── */
function BrandBanner() {
  return (
    <section id="brand-banner" aria-label="Brand showcase">
      <div className="banner-inner">
        <div className="banner-img-wrap">
          <img
            src={BannerImg}
            alt="Cocopi artisan chocolate collection — packaging, truffles, and single-origin bars"
            className="banner-img"
            loading="eager"
          />
          <div className="banner-img-overlay" />
        </div>
        <div className="banner-content sr">
          <span className="banner-eyebrow">
            <CacaoPodLogo size={18} color="var(--gold)" />
            Bean to Bar · Est. 1897
          </span>
          <h2 className="banner-heading">
            Crafted from the world's<br />
            <em>finest cacao.</em>
          </h2>
          <p className="banner-desc">
            Honest ingredients. Meticulous process. Unforgettable taste.
          </p>
          <div className="banner-badges">
            <div className="badge"><span className="badge-icon">✦</span> Single Origin</div>
            <div className="badge"><span className="badge-icon">✦</span> No Artificial Flavours</div>
            <div className="badge"><span className="badge-icon">✦</span> Small Batch Crafted</div>
            <div className="badge"><span className="badge-icon">✦</span> Ethical Sourcing</div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   STORY
   BUG FIX: parallax disabled on mobile
   CHANGE: package image replaces cocoa pod photo
───────────────────────────────────────── */
function Story() {
  const imgRef = useRef(null);
  useParallax(imgRef, 0.1);
  return (
    <section id="story">
      <div className="sr-l">
        <span className="story-eyebrow">Our Philosophy</span>
        <h2 className="story-heading">
          Where origin<em>tells the story</em>
        </h2>
        <p className="story-body">
          Deep in the equatorial forests, ancient cacao trees produce pods of
          extraordinary complexity. We travel to the source — Ecuador, Ghana,
          Vietnam, Madagascar — selecting only the finest cacao, building
          lasting relationships with farmers who share our obsession with
          quality.
          <br /><br />
          Every bar begins with a story. A terroir. A climate. A people. We
          honour that story in every step: from careful fermentation to the
          meditative art of tempering.
        </p>
        <span className="story-pullquote">
          "Pure. Obsessive. Extraordinary."
        </span>
      </div>

      <div className="story-img-outer sr-r">
        <div className="story-deco-blob" />
        <div className="story-img-inner story-pkg-wrap">
          {/* Replaced with chocolate bar package PNG */}
          <img
            ref={imgRef}
            src={PackageImg}
            alt="Cocopi 70% Dark Chocolate Madagascar — single origin bar"
            className="story-pkg-img"
            loading="lazy"
          />
        </div>
        <div className="story-deco-border" />

        {/* Premium floating label */}
        <div className="story-float-tag">
          <span className="story-float-pct">70%</span>
          <span className="story-float-origin">Madagascar</span>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   JOURNEY
   BUG FIX: touch-drag handling separated from
            native scroll so mobile swipe works
───────────────────────────────────────── */
const JOURNEY_STEPS = [
  { step: "01", name: "Harvest", desc: "Hand-selected pods cut at peak ripeness from ancient rainforest groves across the equatorial belt.", img: "https://images.unsplash.com/photo-1573710661345-610f790e1218?q=80&w=687&auto=format&fit=crop" },
  { step: "02", name: "Ferment", desc: "5–7 days of natural fermentation unlocks the complex flavour compounds unique to each origin.", img: "https://images.unsplash.com/photo-1545567725-ab9b17093edc?q=80&w=1170&auto=format&fit=crop" },
  { step: "03", name: "Roast",   desc: "Origin-specific roasting profiles coax the full aromatic spectrum from each precious bean.", img: "https://images.unsplash.com/photo-1493925410384-84f842e616fb?q=80&w=765&auto=format&fit=crop" },
  { step: "04", name: "Grind",   desc: "72 hours of stone grinding achieves the extraordinary velvet-like smoothness of fine couverture.", img: "https://plus.unsplash.com/premium_photo-1664297857915-bf33840950d8?q=80&w=687&auto=format&fit=crop" },
  { step: "05", name: "Temper",  desc: "Precise temperature control creates the iconic snap, gloss, and slow melt of world-class chocolate.", img: "https://images.unsplash.com/photo-1653075184239-c4970c3ad278?q=80&w=1170&auto=format&fit=crop" },
  { step: "06", name: "Create",  desc: "Handcrafted into bars, bonbons, and sculptures — ready to be experienced and long remembered.", img: "https://images.unsplash.com/photo-1610450949065-1f2841536c88?q=80&w=687&auto=format&fit=crop" },
];

function JourneyCard({ step, name, desc, img, index = 0 }) {
  return (
    <div className="j-card sr-scale" style={{ transitionDelay: `${index * 0.08}s` }}>
      <ImgWithSkeleton src={img} alt={name} loading="lazy" draggable="false" />
      <div className="j-card-info">
        <p className="j-step">Step {step}</p>
        <h3 className="j-name">{name}</h3>
        <p className="j-desc">{desc}</p>
      </div>
      <div className="j-gold-bar" />
    </div>
  );
}

function Journey() {
  const wrapRef = useRef(null);
  const drag = useRef({ down: false, startX: 0, sl: 0 });
  const isTouch = useRef(window.matchMedia("(pointer: coarse)").matches);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || isTouch.current) return;

    const onMove = (e) => {
      if (!drag.current.down) return;
      e.preventDefault();
      wrap.scrollLeft =
        drag.current.sl -
        (e.pageX - wrap.offsetLeft - drag.current.startX) * 1.7;
    };
    wrap.addEventListener("mousemove", onMove, { passive: false });
    return () => wrap.removeEventListener("mousemove", onMove);
  }, []);

  const onDown = (e) => {
    if (isTouch.current) return;
    drag.current = {
      down: true,
      startX: e.pageX - wrapRef.current.offsetLeft,
      sl: wrapRef.current.scrollLeft,
    };
  };
  const onUp = () => { drag.current.down = false; };

  return (
    <section id="journey">
      <SectionHeader eyebrow="The Process">
        From Pod to <span className="sec-h2-accent">Perfection</span>
      </SectionHeader>
      <div
        className="hscroll-wrap"
        ref={wrapRef}
        style={{ cursor: isTouch.current ? "default" : "grab" }}
        onMouseDown={onDown}
        onMouseLeave={onUp}
        onMouseUp={onUp}
        role="list"
        aria-label="Journey steps"
      >
        {JOURNEY_STEPS.map((c, i) => (
          <JourneyCard key={i} {...c} index={i} />
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   COLLECTIONS
   BUG FIX: null-check on ref.current in tilt handlers
   BUG FIX: transition reset no longer fights sr-scale
───────────────────────────────────────── */
function ProductCard({ tag, origin, name, desc, price, img, index = 0, addToCart }) {
  const ref = useRef(null);
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
  const [added, setAdded] = useState(false);

  const onMove = (e) => {
    if (!ref.current || isTouchDevice) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.transform = `perspective(900px) rotateX(${
      ((e.clientY - r.top) / r.height - 0.5) * -10
    }deg) rotateY(${
      ((e.clientX - r.left) / r.width - 0.5) * 10
    }deg) translateZ(14px)`;
  };

  const onLeave = () => {
    if (!ref.current) return;
    ref.current.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  };

  const handleAdd = () => {
    addToCart && addToCart({ tag, origin, name, desc, price, img });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <div
      className="p-card sr-scale"
      ref={ref}
      style={{ transitionDelay: `${index * 0.1}s` }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      <div className="p-card-tag"><span>{tag}</span></div>
      <div className="p-card-img">
        <ImgWithSkeleton src={img} alt={name} loading="lazy" draggable="false" />
      </div>
      <div className="p-card-body">
        <p className="p-origin">{origin}</p>
        <h3 className="p-name">{name}</h3>
        <p className="p-desc">{desc}</p>
        <div className="p-footer">
          <span className="p-price">{price}</span>
          <button
            className={`p-cta${added ? " p-cta-added" : ""}`}
            onClick={handleAdd}
            aria-label={`Add ${name} to cart`}
          >
            {added ? "Added ✓" : "Add to Cart →"}
          </button>
        </div>
      </div>
      <div className="p-bottom-line" />
    </div>
  );
}

/* ─────────────────────────────────────────
   COLLECTIONS — fetches products from API
───────────────────────────────────────── */
function Collections({ addToCart, navigate }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    api.products.getAll()
      .then((data) => setProducts(data.products))
      .catch(() => setError("Could not load products. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section id="collections">
      <SectionHeader eyebrow="The Collection">
        Our <span className="sec-h2-accent">Chocolates</span>
      </SectionHeader>

      {loading && (
        <div className="products-loading">
          {[1, 2, 3].map((n) => (
            <div key={n} className="product-skeleton">
              <div className="product-skeleton-img" />
              <div className="product-skeleton-body">
                <div className="product-skeleton-line short" />
                <div className="product-skeleton-line" />
                <div className="product-skeleton-line medium" />
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="products-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      )}

      {!loading && !error && (
        <div className="prod-grid">
          {products.map((p, i) => (
            <ProductCard
              key={p._id}
              tag={p.tag}
              origin={p.origin}
              name={p.name}
              desc={p.desc}
              price={`₹${p.price.toLocaleString("en-IN")}`}
              img={p.img}
              index={i}
              addToCart={addToCart}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/* ─────────────────────────────────────────
   COUNTER
───────────────────────────────────────── */
function Counter({ target }) {
  const [val, setVal] = useState(0);
  const elRef = useRef(null);
  const fired = useRef(false);

  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !fired.current) {
          fired.current = true;
          let n = 0;
          const timer = setInterval(() => {
            n++;
            setVal(Math.min(Math.floor((n * target) / 65), target));
            if (n >= 65) clearInterval(timer);
          }, 22);
        }
      },
      { threshold: 0.5 }
    );
    if (elRef.current) io.observe(elRef.current);
    return () => io.disconnect();
  }, [target]);

  return <span ref={elRef}>{val}</span>;
}

/* ─────────────────────────────────────────
   CRAFT
───────────────────────────────────────── */
const STATS = [
  { num: 85, unit: "%", label: "Max Cacao Content" },
  { num: 72, unit: "h", label: "Conching Time" },
  { num: 4,  unit: "",  label: "Generations of Craft" },
  { num: 12, unit: "",  label: "Origins Sourced" },
];

function Craft() {
  return (
    <section id="craft">
      <VideoBackground
        src="https://www.pexels.com/download/video/4458581/"
        poster="https://images.unsplash.com/photo-1481391243133-f96216dcb5d2?w=1920&q=60"
        overlayOpacity={0.84}
      />
      <div className="craft-inner">
        <SectionHeader eyebrow="The Craft">
          <span className="whitebg">Numbers Behind</span>{" "}
          <span className="sec-h2-accent">Excellence</span>
        </SectionHeader>
        <div className="craft-bg-word" aria-hidden="true">Cocopi</div>
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="stat-cell sr-scale"
              style={{ transitionDelay: `${i * 0.15}s` }}
            >
              <span className="stat-num-big">
                <Counter target={s.num} />
                <span className="stat-unit-big">{s.unit}</span>
              </span>
              <span className="stat-label-small">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   TESTIMONIALS
───────────────────────────────────────── */
const TESTIMONIALS = [
  {
    quote: "The most extraordinary chocolate I have ever tasted. A revelation in every single bite.",
    author: "— Hélène Darroze, Three Michelin Stars",
  },
  {
    quote: "Cocopi redefines what artisan chocolate can be. Pure, obsessive, and utterly transcendent.",
    author: "— Condé Nast Traveller, 2024",
  },
  {
    quote: "Each bar tells the story of its origin with startling clarity, beauty, and precision.",
    author: "— Fine Foods Quarterly",
  },
];

function Testimonials() {
  const [idx, setIdx]       = useState(0);
  const [fading, setFading] = useState(false);

  const goTo = useCallback((i) => {
    setFading(true);
    setTimeout(() => { setIdx(i); setFading(false); }, 500);
  }, []);

  useEffect(() => {
    const t = setInterval(() => goTo((idx + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, [idx, goTo]);

  const t = TESTIMONIALS[idx];

  return (
    <section id="testimonials">
      <VideoBackground
        src="https://videos.pexels.com/video-files/3571264/3571264-hd_1920_1080_30fps.mp4"
        poster="https://images.unsplash.com/photo-1559628235-bd0f498f0c0f?w=1920&q=60"
        overlayOpacity={0.72}
      />
      <div className="test-inner sr">
        <span className="test-guillemet" aria-hidden="true">"</span>
        <p className={`test-quote-text${fading ? " fade-out" : ""}`}>
          {t.quote}
        </p>
        <span className="test-author-name">{t.author}</span>
        <div className="test-dots" role="tablist" aria-label="Testimonials">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              className={`test-dot${i === idx ? " active" : ""}`}
              onClick={() => goTo(i)}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   NEWSLETTER
   BUG FIX: proper email validation (not just @)
   BUG FIX: sec-line now has sr class for IO trigger
───────────────────────────────────────── */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Newsletter() {
  const [email, setEmail] = useState("");
  const [sent,  setSent]  = useState(false);
  const [error, setError] = useState(false);

  const submit = () => {
    if (!EMAIL_RE.test(email)) { setError(true); return; }
    setError(false);
    setSent(true);
  };

  return (
    <section id="newsletter">
      <div className="nl-inner sr">
        {/* BUG FIX: added sr-scale so IntersectionObserver picks it up */}
        <div className="sec-line sr-scale" />
        <span className="sec-eyebrow sr-blur">Inner Circle</span>
        <h2 className="nl-heading">
          First to know.<em>Last to forget.</em>
        </h2>
        <p className="nl-desc">
          Limited editions, harvest dispatches, and tasting events —
          <br />
          straight to your inbox. No noise, only chocolate.
        </p>
        {sent ? (
          <p className="nl-thanks">You're in. Expect something extraordinary.</p>
        ) : (
          <div
            className="nl-form"
            role="form"
            aria-label="Newsletter subscription"
            style={{ borderColor: error ? "var(--red)" : undefined }}
          >
            <input
              type="email"
              className="nl-input"
              placeholder="your@email.com"
              value={email}
              autoComplete="email"
              aria-label="Email address"
              aria-invalid={error}
              onChange={(e) => { setEmail(e.target.value); setError(false); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
            />
            <button className="nl-btn" onClick={submit} aria-label="Subscribe to newsletter">
              <span>Subscribe</span>
            </button>
          </div>
        )}
        {error && (
          <p className="nl-error" role="alert">
            Please enter a valid email address.
          </p>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   FOOTER
   BUG FIX: f-brand-tagline now has correct CSS class
   ENHANCEMENT: SVG cacao pod in brand section
───────────────────────────────────────── */
const FOOTER_COLS = [
  {
    title: "Collections",
    links: ["Dark Chocolate", "Milk Chocolate", "White Chocolate", "Single Origin", "Seasonal Gifts"],
  },
  {
    title: "Atelier",
    links: ["Our Story", "Sourcing", "Sustainability", "Press", "Contact Us"],
  },
];

function Footer({ navigate = () => {} }) {
  return (
    <footer>
      <div className="footer-top">
        <div className="f-brand">
          <div className="f-brand-logo-wrap">
            <CacaoPodLogo size={36} color="var(--gold)" />
            <span className="f-brand-logo">COCOPI</span>
          </div>
          <p className="f-brand-desc">
            Artisan chocolate makers since 1897. Every bar is a testament to
            the extraordinary journey from cacao pod to finished confection.
          </p>
          {/* BUG FIX: was .f-brand-tagline with no CSS — now uses correct class */}
          <span className="f-brand-sub">Artisan Chocolate Atelier</span>
        </div>

        {FOOTER_COLS.map((col) => (
          <div key={col.title} className="f-col">
            <span className="f-col-title">{col.title}</span>
            <ul>
              {col.links.map((l) => (
                <li key={l}>
                  <button className="f-col-link">{l}</button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© 2025 COCOPI. All rights reserved.</p>
        <p>CRAFTED WITH OBSESSION</p>
      </div>
    </footer>
  );
}

/* ─────────────────────────────────────────
   MAIN CONTENT
───────────────────────────────────────── */
function MainContent({ navigate, cart, addToCart, removeFromCart, updateQty }) {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("vis");
        }),
      { threshold: 0.08 }
    );
    const t = setTimeout(() => {
      document
        .querySelectorAll(".sr,.sr-l,.sr-r,.sr-scale,.sr-blur")
        .forEach((el) => io.observe(el));
    }, 120);
    return () => { clearTimeout(t); io.disconnect(); };
  }, []);

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Nav navigate={navigate} cart={cart} />
      <Hero navigate={navigate} />
      <Marquee />
      <BrandBanner />
      <Story />
      <Journey />
      <Collections addToCart={addToCart} navigate={navigate} />
      <Craft />
      <Testimonials />
      <Newsletter />
      <Footer navigate={navigate} />
    </>
  );
}

/* ─────────────────────────────────────────
   APP ROOT — page router + global cart state
───────────────────────────────────────── */
export default function App() {
  const [ready,    setReady]   = useState(false);
  const [page,     setPage]    = useState("home"); // "home" | "auth" | "cart" | "checkout"
  const [cart,     setCart]    = useState([]);

  const handleDone = useCallback(() => setReady(true), []);

  /* Scroll to top on every page change */
  const navigate = useCallback((target) => {
    setPage(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* Cart helpers — passed as props to any component that needs them */
  const addToCart = useCallback((product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.name === product.name);
      if (exists) {
        return prev.map((i) =>
          i.name === product.name ? { ...i, qty: i.qty + 1 } : i
        );
      }
      /* Store _id as productId for the orders API */
      return [...prev, { ...product, productId: product._id, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((name) => {
    setCart((prev) => prev.filter((i) => i.name !== name));
  }, []);

  const updateQty = useCallback((name, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.name === name ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }, []);

  /* Lazy-load page components only when needed */
  const renderPage = () => {
    if (!ready) return null;
    switch (page) {
      case "auth":
        return <AuthPage navigate={navigate} />;
      case "cart":
        return (
          <CartPage
            cart={cart}
            removeFromCart={removeFromCart}
            updateQty={updateQty}
            navigate={navigate}
          />
        );
      case "checkout":
        return <CheckoutPage cart={cart} navigate={navigate} />;
      default:
        return (
          <MainContent
            navigate={navigate}
            cart={cart}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQty={updateQty}
          />
        );
    }
  };

  return (
    <>
      <Loader onDone={handleDone} />
      <Cursor />
      {renderPage()}
    </>
  );
}