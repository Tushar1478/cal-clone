import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

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
    // Simulate login
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
    <div className="min-h-screen bg-background flex">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(220,13%,8%)] via-[hsl(220,13%,6%)] to-[hsl(220,20%,4%)]" />
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, hsl(0,0%,100%) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center">
                <span className="text-background font-black text-sm tracking-tighter">C</span>
              </div>
              <span className="text-lg font-bold text-foreground tracking-tight">Cal.com</span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-extrabold text-foreground leading-tight mb-4">
              Scheduling
              <br />
              infrastructure
              <br />
              for <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">everyone.</span>
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Focus on meeting, not making meetings. Free for individuals.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-2">
              {["AJ", "BS", "DP", "EM"].map((initials, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ backgroundColor: ["#2563eb", "#9333ea", "#dc2626", "#16a34a"][i], zIndex: 4 - i }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Trusted by <span className="text-foreground font-semibold">100,000+</span> users worldwide
            </p>
          </div>
        </div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center">
              <span className="text-background font-black text-sm tracking-tighter">C</span>
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">Cal.com</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Sign in to your Cal.com account
            </p>
          </div>

          {/* Social login buttons */}
          <div className="space-y-2.5 mb-6">
            <button
              onClick={() => handleSocialLogin("Google")}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-md border border-border bg-secondary/50 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleSocialLogin("SAML SSO")}
              className="w-full flex items-center justify-center gap-3 h-10 rounded-md border border-border bg-secondary/50 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Lock className="h-4 w-4" />
              SAML / SSO
            </button>
          </div>

          <div className="relative mb-6">
            <Separator className="bg-border" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 text-xs text-muted-foreground">
              or
            </span>
          </div>

          {/* Email / password form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Email address</Label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 bg-secondary/50 border-border"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium hover:underline"
                  style={{ color: "hsl(var(--cal-info))" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-10 bg-secondary/50 border-border"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold hover:underline"
              style={{ color: "hsl(var(--cal-info))" }}
            >
              Create one
            </Link>
          </p>

          <p className="text-center text-[11px] text-muted-foreground/60 mt-8">
            By signing in, you agree to our{" "}
            <span className="underline cursor-pointer hover:text-muted-foreground">Terms of Service</span>
            {" "}and{" "}
            <span className="underline cursor-pointer hover:text-muted-foreground">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
