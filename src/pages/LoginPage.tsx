import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden">

      {/* Grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          opacity: 0.4,
        }}
      />

      {/* Rounded squares grid overlay — like Cal.com */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 80 }).map((_, i) => {
          const col = i % 10;
          const row = Math.floor(i / 10);
          return (
            <div
              key={i}
              className="absolute rounded-xl border border-border/30"
              style={{
                width: 72,
                height: 72,
                left: col * 90 + (row % 2 === 0 ? 0 : 45),
                top: row * 90,
                opacity: 0.35,
              }}
            />
          );
        })}
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-[420px] mx-4">
        <div
          className="rounded-2xl border border-border overflow-hidden"
          style={{ background: "hsl(var(--card))" }}
        >
          {/* Top section */}
          <div className="px-8 pt-8 pb-6">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-md bg-foreground flex items-center justify-center">
                  <span className="text-background font-black text-xs tracking-tighter">C</span>
                </div>
                <span className="text-base font-bold text-foreground tracking-tight">Cal.com</span>
              </div>
              <h2 className="text-base font-semibold text-foreground">Welcome back!</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Sign in to continue</p>
            </div>

            {/* Google button */}
            <button
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-3 h-11 rounded-lg border border-border bg-secondary/60 text-sm font-medium text-foreground hover:bg-secondary transition-colors mb-5"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </button>

            {/* Divider */}
            <div className="relative flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <Input
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5 h-10 bg-secondary/50 border-border focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label className="text-sm font-medium text-foreground">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder=""
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10 bg-secondary/50 border-border focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                    Signing in…
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </form>
          </div>

          {/* Bottom footer strip */}
          <div className="border-t border-border px-8 py-4 flex items-center justify-center gap-1 bg-secondary/30">
            <Link
              to="/signup"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Create account
            </Link>
            <span className="text-muted-foreground/40 text-sm mx-1">·</span>
            <button
              onClick={() => handleSocialLogin("SAML/OIDC")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in with SAML/OIDC
            </button>
          </div>
        </div>

        {/* Terms */}
        <p className="text-center text-[11px] text-muted-foreground/50 mt-5">
          By signing in, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-muted-foreground/80 transition-colors">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline cursor-pointer hover:text-muted-foreground/80 transition-colors">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  );
}
