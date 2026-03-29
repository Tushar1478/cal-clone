import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ backgroundColor: "hsl(0 0% 5%)" }}
    >
      {/* ── GRID BACKGROUND — rounded squares ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(
              ellipse 70% 70% at 50% 50%,
              transparent 0%,
              hsl(0 0% 5%) 100%
            )
          `,
          zIndex: 2,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        style={{ zIndex: 1 }}
      >
        {Array.from({ length: 120 }).map((_, i) => {
          const cols = 12;
          const col = i % cols;
          const row = Math.floor(i / cols);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                width: 90,
                height: 90,
                left: col * 110 - 60,
                top: row * 110 - 20,
                borderRadius: 16,
                border: "1px solid hsl(0 0% 18%)",
                backgroundColor: "hsl(0 0% 10%)",
              }}
            />
          );
        })}
      </div>

      {/* ── CARD + FOOTER WRAPPER ── */}
      <div className="relative z-10 w-full max-w-[460px] mx-4 flex flex-col items-center">

        {/* Card */}
        <div
          className="w-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: "hsl(0 0% 11%)",
            border: "1px solid hsl(0 0% 18%)",
          }}
        >
          <div className="px-10 pt-10 pb-8">

            {/* Logo + headline */}
            <div className="text-center mb-7">
              <h1 className="text-xl font-bold text-white mb-2 tracking-tight">
                Cal.com
              </h1>
              <p className="text-sm" style={{ color: "hsl(0 0% 55%)" }}>
                Welcome back! Sign in to continue
              </p>
            </div>

            {/* Google button — white pill */}
            <button
              type="button"
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-3 font-semibold text-sm transition-opacity hover:opacity-90"
              style={{
                height: 48,
                borderRadius: 999,
                backgroundColor: "hsl(0 0% 96%)",
                color: "#111",
                border: "none",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            {/* OR divider */}
            <div className="relative flex items-center my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: "hsl(0 0% 20%)" }} />
              <span className="mx-4 text-sm" style={{ color: "hsl(0 0% 45%)" }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: "hsl(0 0% 20%)" }} />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-medium mb-2"
                  style={{ color: "hsl(0 0% 85%)" }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-sm outline-none transition-colors"
                  style={{
                    height: 44,
                    borderRadius: 999,
                    backgroundColor: "hsl(0 0% 16%)",
                    border: "1px solid hsl(0 0% 22%)",
                    color: "hsl(0 0% 92%)",
                    padding: "0 18px",
                  }}
                  onFocus={(e) => {
                    e.target.style.border = "1px solid hsl(0 0% 45%)";
                  }}
                  onBlur={(e) => {
                    e.target.style.border = "1px solid hsl(0 0% 22%)";
                  }}
                />
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    className="text-sm font-medium"
                    style={{ color: "hsl(0 0% 85%)" }}
                  >
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-sm transition-colors"
                    style={{ color: "hsl(0 0% 50%)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 75%)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 50%)")}
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm outline-none transition-colors"
                    style={{
                      height: 44,
                      borderRadius: 999,
                      backgroundColor: "hsl(0 0% 16%)",
                      border: "1px solid hsl(0 0% 22%)",
                      color: "hsl(0 0% 92%)",
                      padding: "0 48px 0 18px",
                    }}
                    onFocus={(e) => {
                      e.target.style.border = "1px solid hsl(0 0% 45%)";
                    }}
                    onBlur={(e) => {
                      e.target.style.border = "1px solid hsl(0 0% 22%)";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "hsl(0 0% 45%)" }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(0 0% 75%)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(0 0% 45%)")}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Continue button — dark pill */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 text-sm font-bold transition-opacity disabled:opacity-60"
                style={{
                  height: 48,
                  borderRadius: 999,
                  backgroundColor: "hsl(0 0% 22%)",
                  color: "hsl(0 0% 92%)",
                  border: "none",
                  marginTop: 8,
                }}
                onMouseEnter={(e) => {
                  if (!loading) (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(0 0% 28%)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "hsl(0 0% 22%)";
                }}
              >
                {loading ? (
                  <>
                    <span
                      className="h-4 w-4 rounded-full border-2 animate-spin"
                      style={{
                        borderColor: "hsl(0 0% 40%)",
                        borderTopColor: "hsl(0 0% 92%)",
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

          {/* Bottom strip — inside card, separated by border */}
          <div
            className="flex items-center justify-center gap-2 py-4"
            style={{ borderTop: "1px solid hsl(0 0% 16%)" }}
          >
            <Link
              to="/signup"
              className="text-sm transition-colors"
              style={{ color: "hsl(0 0% 60%)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 0% 85%)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(0 0% 60%)")}
            >
              Create account
            </Link>
            <span style={{ color: "hsl(0 0% 30%)", fontSize: 16 }}>·</span>
            <button
              onClick={() => handleSocialLogin("SAML/OIDC")}
              className="text-sm transition-colors"
              style={{ color: "hsl(0 0% 60%)" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(0 0% 85%)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "hsl(0 0% 60%)")}
            >
              Sign in with SAML/OIDC
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
