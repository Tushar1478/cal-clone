import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("cal-clone-auth", "true");
      toast.success("Welcome back!");
      navigate("/event-types");
      setLoading(false);
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} login coming soon`);
  };

  const COLS = 11;
  const ROWS = 8;
  const TILE = 92;
  const GAP = 8;
  const STEP = TILE + GAP;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#111",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      {/* ── GRID ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const cx = (COLS * STEP) / 2;
          const cy = (ROWS * STEP) / 2;
          const dx = col * STEP - cx + TILE / 2;
          const dy = row * STEP - cy + TILE / 2;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = Math.sqrt(cx * cx + cy * cy);
          const opacity = Math.max(0, 0.6 - (dist / maxDist) * 0.6);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: `calc(50% + ${col * STEP - (COLS * STEP) / 2}px)`,
                top: `calc(50% + ${row * STEP - (ROWS * STEP) / 2}px)`,
                width: TILE,
                height: TILE,
                borderRadius: 14,
                backgroundColor: "#1c1c1c",
                border: "1px solid #252525",
                opacity,
              }}
            />
          );
        })}
      </div>

      {/* ── CARD ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 448,
          margin: "0 16px",
        }}
      >
        <div
          style={{
            backgroundColor: "#1c1c1c",
            border: "1px solid #2a2a2a",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "40px 40px 32px" }}>

            {/* Logo */}
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.3px" }}>
                Cal.com
              </p>
              <p style={{ fontSize: 14, color: "#777", margin: 0 }}>
                Welcome back! Sign in to continue
              </p>
            </div>

            {/* Google */}
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                height: 44,
                borderRadius: 999,
                backgroundColor: "#f3f3f3",
                border: "none",
                color: "#111",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                marginBottom: 20,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#e5e5e5")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#f3f3f3")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "#2a2a2a" }} />
              <span style={{ fontSize: 12, color: "#555" }}>or</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "#2a2a2a" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Email */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#ccc", marginBottom: 7 }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  style={{
                    width: "100%",
                    height: 42,
                    borderRadius: 999,
                    backgroundColor: "#262626",
                    border: "1px solid #333",
                    color: "#f0f0f0",
                    fontSize: 14,
                    padding: "0 16px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#555")}
                  onBlur={(e) => (e.target.style.borderColor = "#333")}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 22 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 14, fontWeight: 500, color: "#ccc" }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: 13, color: "#666", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#aaa")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
                  >
                    Forgot?
                  </Link>
                </div>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    style={{
                      width: "100%",
                      height: 42,
                      borderRadius: 999,
                      backgroundColor: "#262626",
                      border: "1px solid #333",
                      color: "#f0f0f0",
                      fontSize: 14,
                      padding: "0 44px 0 16px",
                      outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#555")}
                    onBlur={(e) => (e.target.style.borderColor = "#333")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 14,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#555",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#aaa")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#555")}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Continue */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  height: 44,
                  borderRadius: 999,
                  backgroundColor: "#2e2e2e",
                  border: "1px solid #3a3a3a",
                  color: "#e8e8e8",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "#383838";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#2e2e2e";
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 15,
                        height: 15,
                        borderRadius: "50%",
                        border: "2px solid #444",
                        borderTopColor: "#ddd",
                        animation: "cal-spin 0.7s linear infinite",
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                    />
                    Signing in…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>

          {/* Bottom strip */}
          <div
            style={{
              borderTop: "1px solid #222",
              padding: "14px 40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              backgroundColor: "#171717",
            }}
          >
            <Link
              to="/signup"
              style={{ fontSize: 13, color: "#666", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#bbb")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#666")}
            >
              Create account
            </Link>
            <span style={{ color: "#333", fontSize: 18, lineHeight: 1, fontWeight: 300 }}>·</span>
            <button
              type="button"
              onClick={() => handleSocialLogin("SAML/OIDC")}
              style={{
                background: "none",
                border: "none",
                fontSize: 13,
                color: "#666",
                cursor: "pointer",
                padding: 0,
              }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "#bbb")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "#666")}
            >
              Sign in with SAML/OIDC
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes cal-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
