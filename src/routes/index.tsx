import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Target, Coins, Gift, ArrowRight } from "lucide-react";
import { Mascot } from "@/components/Mascot";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Feature({
  icon: Icon,
  title,
  desc,
  iconBg,
  iconColor,
}: {
  icon: typeof Target;
  title: string;
  desc: string;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-card px-4 py-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.08)]">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: iconBg }}
      >
        <Icon className="h-6 w-6" style={{ color: iconColor }} />
      </div>
      <div>
        <h3 className="font-display text-lg leading-tight">{title}</h3>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) navigate({ to: "/dashboard" });
    }).catch(() => { /* ignore — show landing */ });
    return () => { active = false; };
  }, [navigate]);

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col">
        <div className="flex justify-center pt-4">
          <Mascot />
        </div>

        <h1 className="mt-8 text-center text-4xl">
          Welcome to <span className="text-primary">Loopo</span>
        </h1>
        <p className="mt-3 text-center text-muted-foreground px-2">
          Turn chores into missions. Reward effort. Watch your kid actually change.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Feature
            icon={Target}
            title="Set missions"
            desc="From templates or your own ideas"
            iconBg="#EDE4FF"
            iconColor="#6200E6"
          />
          <Feature
            icon={Coins}
            title="Kids earn credits"
            desc="Photo, video, or voice proof"
            iconBg="#FFF4C2"
            iconColor="#B58900"
          />
          <Feature
            icon={Gift}
            title="Redeem real rewards"
            desc="Mobile Legends · Roblox · Shopee"
            iconBg="#EDE4FF"
            iconColor="#6200E6"
          />
        </div>

        <Link
          to="/signup"
          className="mt-8 flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 font-display text-lg text-gold-foreground shadow-[0_6px_0_-2px_#d6b400,0_10px_24px_-8px_rgba(255,214,0,0.6)] active:translate-y-0.5 active:shadow-[0_3px_0_-2px_#d6b400] transition"
        >
          Get Started <ArrowRight className="h-5 w-5" />
        </Link>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary">Log in</Link>
        </p>

        <div className="mt-auto pt-12 pb-2 text-center text-sm text-muted-foreground">
          Kid logging in? <Link to="/kid-login" className="font-bold text-primary">Tap here</Link>
        </div>
      </div>
    </main>
  );
}
