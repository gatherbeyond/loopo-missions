import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, Ban, Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { StepDots } from "@/components/StepDots";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function passwordScore(pw: string) {
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const score = passwordScore(password);
  const strengthLabel = ["Too short", "Weak", "Okay", "Good", "Strong"][score];
  const strengthColor = ["#e5e5e5", "#FF3D00", "#FF8A00", "#FFD600", "#00C853"][score];

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || password.length < 8) {
      toast.error("Enter an email and a password (8+ chars)");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: "/family-name" });
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col">
        <StepDots current={1} total={3} />

        <Link to="/" className="mt-6 inline-flex h-10 w-10 items-center text-primary">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <h1 className="mt-4 text-4xl">Let's get started</h1>
        <p className="mt-2 text-muted-foreground">Takes 30 seconds. No card needed.</p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="block font-display text-lg mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-full border border-input bg-card px-5 py-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block font-display text-lg mb-2">Password</label>
            <div className="relative">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-full border border-input bg-card pl-12 pr-5 py-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-primary"
                aria-label="Toggle password visibility"
              >
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password.length > 0 && (
              <div className="mt-2 px-2">
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(score / 4) * 100}%`, backgroundColor: strengthColor }}
                  />
                </div>
                <p className="mt-1 text-sm font-bold" style={{ color: strengthColor }}>
                  {strengthLabel}
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-lg text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover active:translate-y-0.5 transition disabled:opacity-60"
          >
            {loading ? "Creating…" : <>Create Account <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-primary" /> COPPA Safe</span>
          <span className="inline-flex items-center gap-1"><Ban className="h-4 w-4 text-primary" /> No Ads</span>
          <span className="inline-flex items-center gap-1"><Heart className="h-4 w-4 text-primary" /> SEA-built</span>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary">Log In</Link>
        </p>
      </div>
    </main>
  );
}
