import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { LogOut, LayoutDashboard, ListChecks, Plus, Check, X, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { LoopoLogo } from "@/components/LoopoLogo";
import { Mascot } from "@/components/Mascot";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

type Family = { id: string; family_name: string };
type Kid = { id: string; name: string; avatar: string | null };
type Task = {
  id: string;
  kid_id: string;
  title: string;
  description: string | null;
  credits_reward: number;
  status: string;
};
type Redemption = {
  id: string;
  kid_id: string;
  product_name: string;
  cost_credits: number;
  status: string;
};

function DashboardPage() {
  const navigate = useNavigate();
  const [parentName, setParentName] = useState("");
  const [family, setFamily] = useState<Family | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [pending, setPending] = useState<Task[]>([]);
  const [active, setActive] = useState<Task[]>([]);
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: userRes } = await supabase.auth.getUser();
    const user = userRes.user;
    if (!user) { navigate({ to: "/login" }); return; }
    setParentName(
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "there"
    );

    const { data: fam } = await supabase
      .from("families").select("id, family_name")
      .eq("parent_id", user.id).maybeSingle();
    if (!fam) { setLoading(false); return; }
    setFamily(fam);

    const [kidsRes, tasksRes, redRes] = await Promise.all([
      supabase.from("kids").select("id, name, avatar").eq("family_id", fam.id),
      supabase.from("tasks")
        .select("id, kid_id, title, description, credits_reward, status")
        .eq("family_id", fam.id)
        .in("status", ["pending", "not_started", "in_progress"]),
      supabase.from("redemptions")
        .select("id, kid_id, product_name, cost_credits, status")
        .eq("family_id", fam.id)
        .eq("status", "pending"),
    ]);
    setKids(kidsRes.data || []);
    const all = (tasksRes.data || []) as Task[];
    setPending(all.filter((t) => t.status === "pending"));
    setActive(all.filter((t) => t.status === "not_started" || t.status === "in_progress"));
    setRedemptions((redRes.data as Redemption[]) || []);
    setLoading(false);
  }, [navigate]);

  useEffect(() => { load(); }, [load]);

  const kidById = (id: string) => kids.find((k) => k.id === id);

  const approve = async (task: Task) => {
    const kid = kidById(task.kid_id);
    const [{ error: rpcErr }, { error: upErr }] = await Promise.all([
      supabase.rpc("increment_kid_credits", { kid_id: task.kid_id, amount: task.credits_reward }),
      supabase.from("tasks").update({ status: "completed" }).eq("id", task.id),
    ]);
    if (rpcErr || upErr) return toast.error(rpcErr?.message || upErr?.message || "Approve failed");
    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.4 },
      colors: ["#6200E6", "#7C4DFF", "#FFD600", "#00C853"],
    });
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.4 } }), 250);
    toast.success(`✅ ${task.credits_reward} credits awarded to ${kid?.name ?? "kid"}!`);
    setPending((p) => p.filter((t) => t.id !== task.id));
  };

  const deny = async (task: Task) => {
    const { error } = await supabase.from("tasks").update({ status: "denied" }).eq("id", task.id);
    if (error) return toast.error(error.message);
    toast("Mission denied");
    setPending((p) => p.filter((t) => t.id !== task.id));
  };

  const approveRedemption = async (r: Redemption) => {
    const kid = kidById(r.kid_id);
    const [{ error: rpcErr }, { error: upErr }] = await Promise.all([
      supabase.rpc("increment_kid_credits", { kid_id: r.kid_id, amount: -r.cost_credits }),
      supabase.from("redemptions").update({ status: "approved" }).eq("id", r.id),
    ]);
    if (rpcErr || upErr) return toast.error(rpcErr?.message || upErr?.message || "Approve failed");
    toast.success("✅ Redemption approved!");
    setRedemptions((prev) => prev.filter((x) => x.id !== r.id));
  };

  const denyRedemption = async (r: Redemption) => {
    const { error } = await supabase.from("redemptions").update({ status: "denied" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast("Redemption denied");
    setRedemptions((prev) => prev.filter((x) => x.id !== r.id));
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  const initial = (parentName[0] || "?").toUpperCase();

  return (
    <main className="relative min-h-screen pb-4 flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border">
        <div className="mx-auto flex max-w-[600px] items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <LoopoLogo className="h-9 w-auto" />
            {family && (
              <span className="hidden sm:inline font-display text-lg text-foreground/80">
                {family.family_name}
              </span>
            )}
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary font-display text-primary-foreground">
            {initial}
          </div>
        </div>
        {family && (
          <p className="sm:hidden mx-auto max-w-[600px] px-5 pb-2 font-display text-foreground/80">
            {family.family_name}
          </p>
        )}
      </header>

      <div className="mx-auto max-w-[600px] px-5 pt-6">
        <h1 className="text-3xl">Hi {parentName}! 👋</h1>

        {/* No kids yet */}
        {!loading && kids.length === 0 && (
          <div className="mt-6 rounded-3xl border-2 border-dashed border-primary/30 bg-tint p-6 text-center">
            <p className="font-display text-lg">No kids added yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add your first kid in Settings to start creating missions.
            </p>
            <Link
              to="/add-kid"
              className="mt-4 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-5 py-2.5 font-display hover:bg-primary-hover transition"
            >
              + Add a kid
            </Link>
          </div>
        )}

        {/* Pending approvals */}
        <section className="mt-8">
          <h2 className="font-display text-xl">Pending Approvals</h2>

          {loading ? (
            <div className="mt-3 h-24 rounded-2xl bg-tint animate-pulse" />
          ) : pending.length === 0 ? (
            <div className="mt-4 flex flex-col items-center rounded-3xl bg-tint py-10 px-6 text-center">
              <Mascot size={110} />
              <p className="mt-4 font-display text-lg">All caught up! ✨</p>
              <p className="mt-1 text-sm text-muted-foreground">
                New missions will appear here for approval.
              </p>
            </div>
          ) : (
            <div className="mt-3 flex flex-col gap-3">
              {pending.map((t) => {
                const kid = kidById(t.kid_id);
                return (
                  <div key={t.id} className="rounded-2xl bg-card border border-border p-4 shadow-[0_2px_12px_-6px_rgba(0,0,0,0.06)]">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-tint text-2xl">
                        {kid?.avatar || "🙂"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display text-base">{kid?.name || "Kid"}</p>
                        <p className="text-sm text-muted-foreground truncate">{t.title}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-3 py-1 font-display text-sm text-gold-foreground">
                        🪙 {t.credits_reward}
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => approve(t)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full bg-success px-4 py-2.5 font-display text-white hover:opacity-90 transition"
                      >
                        <Check className="h-4 w-4" /> Approve
                      </button>
                      <button
                        onClick={() => deny(t)}
                        className="flex-1 inline-flex items-center justify-center gap-1 rounded-full border-2 border-destructive px-4 py-2.5 font-display text-destructive hover:bg-destructive/5 transition"
                      >
                        <X className="h-4 w-4" /> Deny
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Active missions */}
        <section className="mt-10">
          <h2 className="font-display text-xl">Active Missions</h2>
          {loading ? (
            <div className="mt-3 h-16 rounded-2xl bg-tint animate-pulse" />
          ) : active.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              No active missions. Tap + to add one.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {active.map((t) => {
                const kid = kidById(t.kid_id);
                return (
                  <li key={t.id} className="flex items-center gap-3 rounded-2xl bg-card border border-border px-4 py-3">
                    <span className="text-xl">{kid?.avatar || "🙂"}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-sm truncate">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{kid?.name}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gold/90 px-2.5 py-1 text-xs font-display text-gold-foreground">
                      🪙 {t.credits_reward}
                    </span>
                    <StatusBadge status={t.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* FAB */}
      <Link
        to="/new-mission"
        className="absolute bottom-20 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_12px_28px_-8px_rgba(98,0,230,0.6)] hover:bg-primary-hover transition"
        aria-label="Add mission"
      >
        <Plus className="h-7 w-7" />
      </Link>

      {/* Bottom tab bar */}
      <nav className="mt-auto sticky bottom-0 z-10 border-t border-border bg-background">
        <div className="mx-auto flex max-w-[600px] items-center justify-around py-2">
          <TabButton icon={LayoutDashboard} label="Dashboard" active />
          <TabButton icon={ListChecks} label="Missions" />
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-0.5 px-4 py-1.5 text-muted-foreground hover:text-primary"
          >
            <LogOut className="h-5 w-5" />
            <span className="text-xs font-bold">Sign out</span>
          </button>
        </div>
      </nav>
    </main>
  );
}

function TabButton({ icon: Icon, label, active }: { icon: typeof Plus; label: string; active?: boolean }) {
  return (
    <button
      className={`flex flex-col items-center gap-0.5 px-4 py-1.5 ${
        active ? "text-primary" : "text-muted-foreground hover:text-primary"
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    not_started: { label: "New", cls: "bg-muted text-muted-foreground" },
    in_progress: { label: "In progress", cls: "bg-secondary/30 text-foreground" },
  };
  const s = map[status] || { label: status, cls: "bg-muted text-muted-foreground" };
  return (
    <span className={`hidden sm:inline rounded-full px-2.5 py-1 text-xs font-bold ${s.cls}`}>
      {s.label}
    </span>
  );
}
