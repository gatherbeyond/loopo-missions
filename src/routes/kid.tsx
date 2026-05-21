import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Target, ShoppingBag, LogOut, Gift } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { clearKidSession, getKidSession, type KidSession } from "@/lib/kid-session";
import loopoHi from "@/assets/loopo-hi.png";

export const Route = createFileRoute("/kid")({
  component: KidApp,
});

type Task = {
  id: string;
  title: string;
  description: string | null;
  credits_reward: number;
  status: string;
};

type Product = {
  id: string;
  name: string;
  cost_credits: number;
  image_url?: string | null;
  available?: boolean;
};

type Tab = "missions" | "marketplace";

function KidApp() {
  const navigate = useNavigate();
  const [session, setSession] = useState<KidSession | null>(null);
  const [credits, setCredits] = useState<number>(0);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [tab, setTab] = useState<Tab>("missions");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (s: KidSession) => {
    const [kidRes, tasksRes, prodRes] = await Promise.all([
      supabase.from("kids").select("credits_balance").eq("id", s.kidId).maybeSingle(),
      supabase
        .from("tasks")
        .select("id, title, description, credits_reward, status")
        .eq("kid_id", s.kidId)
        .in("status", ["not_started", "in_progress"]),
      supabase.from("products").select("id, name, cost_credits, image_url").eq("available", true),
    ]);
    console.log("[kid] load", {
      kidId: s.kidId,
      credits: kidRes.data?.credits_balance,
      kidErr: kidRes.error,
      tasks: tasksRes.data,
      tasksErr: tasksRes.error,
      products: prodRes.data,
      prodErr: prodRes.error,
    });
    setCredits((kidRes.data?.credits_balance as number | undefined) ?? 0);
    setTasks((tasksRes.data as Task[]) || []);
    setProducts((prodRes.data as Product[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const s = getKidSession();
    if (!s) {
      navigate({ to: "/kid-login" });
      return;
    }
    setSession(s);
    load(s);

    // Realtime: listen for any task changes for this kid, refresh balance + missions
    const channel = supabase
      .channel(`kid-tasks-${s.kidId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks", filter: `kid_id=eq.${s.kidId}` },
        () => { load(s); },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "kids", filter: `id=eq.${s.kidId}` },
        (payload) => {
          const newBal = (payload.new as { credits_balance?: number })?.credits_balance;
          if (typeof newBal === "number") setCredits(newBal);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate, load]);

  const start = async (t: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "in_progress" })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    setTasks((all) => all.map((x) => (x.id === t.id ? { ...x, status: "in_progress" } : x)));
  };

  const submit = async (t: Task) => {
    const { error } = await supabase
      .from("tasks")
      .update({ status: "pending", submitted_at: new Date().toISOString() })
      .eq("id", t.id);
    if (error) return toast.error(error.message);
    setTasks((all) => all.filter((x) => x.id !== t.id));
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ["#6200E6", "#7C4DFF", "#FFD600", "#03DAC6"],
    });
    toast.success("Mission submitted! Waiting for parent approval 🎉");
  };

  const redeem = async (p: Product) => {
    if (!session) return;
    if (credits < p.cost_credits) return;
    const { error } = await supabase.from("redemptions").insert({
      family_id: session.familyId,
      kid_id: session.kidId,
      product_id: p.id,
      product_name: p.name,
      cost_credits: p.cost_credits,
      status: "pending",
    });
    if (error) return toast.error(error.message);
    toast.success("Redemption requested! Your parent will review it 🎮");
  };

  const signOut = () => {
    clearKidSession();
    navigate({ to: "/" });
  };

  if (!session) return null;

  return (
    <main className="relative min-h-screen pb-4 bg-background flex flex-col">
      {/* Header */}
      <header
        className="px-5 pt-6 pb-8 text-white rounded-b-[2rem]"
        style={{ background: "linear-gradient(160deg, #6200E6 0%, #7C4DFF 100%)" }}
      >
        <div className="mx-auto max-w-[600px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-4xl">
              {session.avatar || "🙂"}
            </div>
            <div>
              <p className="font-display text-xl leading-tight">{session.kidName}</p>
              <p className="text-xs text-white/70">Family · {session.familyCode}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="rounded-full bg-white/15 hover:bg-white/25 p-2 transition"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        <div className="mx-auto max-w-[600px] mt-6 flex items-end gap-2">
          <span className="text-5xl">🏆</span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-white/70">Your credits</p>
            <p className="font-display text-5xl text-gold leading-none drop-shadow">
              {credits.toLocaleString()}
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[600px] px-5 pt-6">
        {tab === "missions" && (
          <MissionsTab loading={loading} tasks={tasks} onStart={start} onSubmit={submit} />
        )}
        {tab === "marketplace" && (
          <MarketplaceTab
            loading={loading}
            products={products}
            credits={credits}
            onRedeem={redeem}
          />
        )}
      </div>

      {/* Bottom tabs */}
      <nav className="mt-auto sticky bottom-0 z-10 border-t border-border bg-background">
        <div className="mx-auto flex max-w-[600px] items-center justify-around py-2">
          <TabBtn
            icon={Target}
            label="Missions"
            active={tab === "missions"}
            onClick={() => setTab("missions")}
          />
          <TabBtn
            icon={ShoppingBag}
            label="Marketplace"
            active={tab === "marketplace"}
            onClick={() => setTab("marketplace")}
          />
        </div>
      </nav>
    </main>
  );
}

function MissionsTab({
  loading,
  tasks,
  onStart,
  onSubmit,
}: {
  loading: boolean;
  tasks: Task[];
  onStart: (t: Task) => void;
  onSubmit: (t: Task) => void;
}) {
  return (
    <section>
      <h2 className="font-display text-2xl">My Missions</h2>
      {loading ? (
        <div className="mt-4 h-24 rounded-2xl bg-tint animate-pulse" />
      ) : tasks.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl bg-tint py-10 px-6 text-center">
          <img src={loopoHi} alt="" className="h-28 w-auto" />
          <p className="mt-4 text-muted-foreground">
            No missions yet — ask your parent to add one!
          </p>
        </div>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {tasks.map((t) => (
            <li
              key={t.id}
              className="rounded-2xl bg-card border border-border p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-display text-lg leading-tight">{t.title}</p>
                  {t.description && (
                    <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-3 py-1 font-display text-sm text-gold-foreground shrink-0">
                  🪙 {t.credits_reward}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <StatusPill status={t.status} />
                {t.status === "not_started" ? (
                  <button
                    onClick={() => onStart(t)}
                    className="rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-display hover:bg-primary-hover transition"
                  >
                    Start →
                  </button>
                ) : (
                  <button
                    onClick={() => onSubmit(t)}
                    className="rounded-full bg-success text-white px-5 py-2.5 font-display hover:opacity-90 transition"
                  >
                    Submit ✓
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MarketplaceTab({
  loading,
  products,
  credits,
  onRedeem,
}: {
  loading: boolean;
  products: Product[];
  credits: number;
  onRedeem: (p: Product) => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Rewards Shop 🛒</h2>
        <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-3 py-1.5 font-display text-gold-foreground">
          🪙 {credits.toLocaleString()}
        </span>
      </div>

      {loading ? (
        <div className="mt-4 h-40 rounded-2xl bg-tint animate-pulse" />
      ) : products.length === 0 ? (
        <p className="mt-6 text-center text-muted-foreground">
          No rewards available yet.
        </p>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {products.map((p) => {
            const enough = credits >= p.cost_credits;
            const pct = Math.min(100, Math.round((credits / p.cost_credits) * 100));
            const deficit = p.cost_credits - credits;
            return (
              <div
                key={p.id}
                className="rounded-2xl bg-card border border-border p-4 flex flex-col shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)]"
              >
                <div className="aspect-square rounded-xl bg-tint flex items-center justify-center text-5xl mb-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.name} className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    "🎁"
                  )}
                </div>
                <p className="font-display text-base leading-tight">{p.name}</p>
                <p className="mt-1 text-sm font-bold text-gold-foreground/80">
                  🪙 {p.cost_credits.toLocaleString()} credits
                </p>

                <div className="mt-2 h-2 rounded-full bg-tint overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: "var(--gold)",
                    }}
                  />
                </div>

                {enough ? (
                  <button
                    onClick={() => onRedeem(p)}
                    className="mt-3 rounded-full bg-primary text-primary-foreground px-4 py-2 font-display hover:bg-primary-hover transition"
                  >
                    Redeem
                  </button>
                ) : (
                  <div className="mt-3 rounded-full bg-tint px-3 py-2 text-center text-xs font-bold text-muted-foreground">
                    Keep earning! {deficit.toLocaleString()} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    not_started: { label: "New", cls: "bg-muted text-muted-foreground" },
    in_progress: { label: "In progress", cls: "bg-secondary/30 text-foreground" },
  };
  const s = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>{s.label}</span>
  );
}

function TabBtn({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Target;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-0.5 px-6 py-1.5 ${
        active ? "text-primary" : "text-muted-foreground hover:text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
