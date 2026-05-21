import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/" });
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col">
        <Link to="/" className="inline-flex h-10 w-10 items-center text-primary">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <h1 className="mt-6 text-4xl">Welcome back</h1>
        <p className="mt-2 text-muted-foreground">Log in to your parent account</p>

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
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-full border border-input bg-card px-5 py-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 font-display text-lg text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover active:translate-y-0.5 transition disabled:opacity-60"
          >
            {loading ? "Logging in…" : <>Log In <ArrowRight className="h-5 w-5" /></>}
          </button>

          <button
            type="button"
            onClick={() => toast.info("Check your email")}
            className="text-sm text-primary font-bold"
          >
            Forgot password?
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New here?{" "}
          <Link to="/signup" className="font-bold text-primary">Create an account</Link>
        </p>
      </div>
    </main>
  );
}
