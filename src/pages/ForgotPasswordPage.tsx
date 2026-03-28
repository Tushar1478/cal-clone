import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="h-8 w-8 rounded-md bg-foreground flex items-center justify-center">
            <span className="text-background font-black text-sm tracking-tighter">C</span>
          </div>
          <span className="text-lg font-bold text-foreground tracking-tight">Cal.com</span>
        </div>

        <div className="cal-card p-8">
          {sent ? (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-[hsl(var(--cal-success)/0.15)] flex items-center justify-center mb-4">
                <CheckCircle2 className="h-6 w-6" style={{ color: "hsl(var(--cal-success))" }} />
              </div>
              <h2 className="text-lg font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-sm text-muted-foreground mb-6">
                We sent a password reset link to<br />
                <span className="text-foreground font-medium">{email}</span>
              </p>
              <Button variant="outline" className="w-full" onClick={() => setSent(false)}>
                Try a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-bold text-foreground">Forgot your password?</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button type="submit" className="w-full h-10 font-semibold" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-background/30 border-t-background animate-spin" />
                      Sending…
                    </span>
                  ) : "Send reset link"}
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-5">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
