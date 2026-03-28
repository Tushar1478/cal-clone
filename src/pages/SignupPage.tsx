import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Mail, User, AtSign } from "lucide-react";

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.username) {
      toast.error("Please fill in all fields");
      return;
    }
    if (form.password.length < 7) {
      toast.error("Password must be at least 7 characters");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("cal-clone-auth", "true");
      toast.success("Account created! Welcome to Cal.com");
      navigate("/event-types");
      setLoading(false);
    }, 800);
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`${provider} signup coming soon`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background font-black text-sm tracking-tighter">C</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">Cal.com</span>
        </div>

        <div className="cal-card p-8">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Start scheduling in minutes. Free forever.
            </p>
          </div>

          {/* Social buttons */}
          <div className="space-y-2.5 mb-5">
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
              Sign up with Google
            </button>
          </div>

          <div className="relative mb-5">
            <Separator className="bg-border" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">or</span>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <Label className="text-xs font-medium text-muted-foreground">Full name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="John Doe" value={form.name} onChange={(e) => update("name", e.target.value)} className="pl-9 bg-secondary/50 border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Username</Label>
              <div className="relative mt-1">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="johndoe"
                  value={form.username}
                  onChange={(e) => update("username", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  className="pl-9 bg-secondary/50 border-border"
                />
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">cal.com/{form.username || "username"}</p>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Email address</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update("email", e.target.value)} className="pl-9 bg-secondary/50 border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium text-muted-foreground">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 7 characters"
                  value={form.password}
                  onChange={(e) => update("password", e.target.value)}
                  className="pl-9 pr-10 bg-secondary/50 border-border"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {form.password.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                      form.password.length >= i * 3
                        ? form.password.length >= 10 ? "bg-[hsl(var(--cal-success))]" : form.password.length >= 7 ? "bg-[hsl(var(--cal-warning))]" : "bg-destructive"
                        : "bg-secondary"
                    }`} />
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full h-10 font-semibold mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                  Creating account…
                </span>
              ) : "Create account"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold hover:underline" style={{ color: "hsl(var(--cal-info))" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
