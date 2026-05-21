import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/new-mission")({
  component: NewMissionPage,
});

type Kid = { id: string; name: string; avatar: string | null };

function NewMissionPage() {
  const navigate = useNavigate();
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [credits, setCredits] = useState(100);
  const [kidId, setKidId] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) { navigate({ to: "/login" }); return; }
      const { data: fam } = await supabase
        .from("families").select("id").eq("parent_id", userRes.user.id).maybeSingle();
      if (!fam) { navigate({ to: "/family-name" }); return; }
      setFamilyId(fam.id);
      const { data: ks } = await supabase
        .from("kids").select("id, name, avatar").eq("family_id", fam.id);
      setKids(ks || []);
      if (ks && ks[0]) setKidId(ks[0].id);
    })();
  }, [navigate]);

  const ready = title.trim().length > 0 && kidId && credits >= 50 && credits <= 2000;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready || !familyId) return;
    setLoading(true);
    const payload: Record<string, unknown> = {
      family_id: familyId,
      kid_id: kidId,
      title: title.trim(),
      description: description.trim() || null,
      credits_reward: credits,
      status: "not_started",
      photo_required: photoRequired,
    };
    const { error } = await supabase.from("tasks").insert(payload);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Mission created!");
    navigate({ to: "/dashboard" });
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col">
        <Link to="/dashboard" className="inline-flex h-10 w-10 items-center text-primary">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <h1 className="mt-4 text-4xl">New Mission</h1>
        <p className="mt-2 text-muted-foreground">Set a clear, doable goal.</p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-5">
          <div>
            <label className="block font-display text-lg mb-2">Mission Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Clean your room"
              maxLength={60}
              className="w-full rounded-full border border-input bg-card px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
          </div>

          <div>
            <label className="block font-display text-lg mb-2">
              Description <span className="text-sm font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details, tips, or what 'done' looks like"
              rows={3}
              maxLength={240}
              className="w-full rounded-2xl border border-input bg-card px-5 py-3 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 resize-none"
            />
          </div>

          <div>
            <label className="block font-display text-lg mb-2">Credits Reward</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setCredits((c) => Math.max(50, c - 50))}
                className="h-12 w-12 rounded-full border-2 border-primary text-primary font-display text-2xl">−</button>
              <input
                type="number"
                min={50}
                max={2000}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="flex-1 rounded-full border border-input bg-card px-5 py-4 text-center font-display text-xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
              <button type="button" onClick={() => setCredits((c) => Math.min(2000, c + 50))}
                className="h-12 w-12 rounded-full border-2 border-primary text-primary font-display text-2xl">+</button>
            </div>
            <p className="mt-1 text-sm text-muted-foreground px-2">Min 50 · Max 2000</p>
          </div>

          <div>
            <label className="block font-display text-lg mb-2">Assign to</label>
            <select
              value={kidId}
              onChange={(e) => setKidId(e.target.value)}
              className="w-full appearance-none rounded-full border border-input bg-card px-5 py-4 outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              {kids.length === 0 && <option value="">No kids yet — add one first</option>}
              {kids.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.avatar ? `${k.avatar}  ` : ""}{k.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl bg-tint px-4 py-3">
            <span className="inline-flex items-center gap-2 font-display">
              <Camera className="h-5 w-5 text-primary" /> Photo required?
            </span>
            <button
              type="button"
              onClick={() => setPhotoRequired((v) => !v)}
              className={`relative h-7 w-12 rounded-full transition ${photoRequired ? "bg-primary" : "bg-muted-foreground/30"}`}
              aria-pressed={photoRequired}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${photoRequired ? "left-[22px]" : "left-0.5"}`} />
            </button>
          </label>

          <button
            type="submit"
            disabled={!ready || loading}
            className={`mt-4 inline-flex items-center justify-center gap-2 rounded-full px-6 py-4 font-display text-lg transition ${
              ready && !loading
                ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover"
                : "bg-tint text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? "Creating…" : <>Create Mission <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
