import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { StepDots } from "@/components/StepDots";
import { generatePin, getFlow, setFlow } from "@/lib/setup-flow";

export const Route = createFileRoute("/add-kid")({
  component: AddKidPage,
});

const AVATARS = ["🦁", "🐼", "🦄", "🐲", "🦊", "🦉"];
const AVATAR_BG = ["#FFE3A8", "#E8EAF0", "#FFD6E8", "#D8F3E0", "#FFD9C2", "#FFF1B8"];

function AddKidPage() {
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [name, setName] = useState("");
  const [age, setAge] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getFlow().familyId) navigate({ to: "/family-name" });
  }, [navigate]);

  const ready = name.trim().length > 0 && age !== "";

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    const flow = getFlow();
    const pin = generatePin();
    const { error } = await supabase.from("kids").insert({
      family_id: flow.familyId,
      name: name.trim(),
      age: Number(age),
      avatar,
      pin_hash: pin,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setFlow({ lastKidName: name.trim(), lastKidPin: pin });
    navigate({ to: "/kid-created" });
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col">
        <StepDots current={3} total={3} />

        <Link to="/family-code" className="mt-6 inline-flex h-10 w-10 items-center text-primary">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <h1 className="mt-4 text-4xl">Add Your First Kid</h1>
        <p className="mt-2 text-muted-foreground">You can add more kids later</p>

        <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-5">
          <div>
            <p className="font-display text-lg mb-3">Choose avatar</p>
            <div className="grid grid-cols-3 gap-4">
              {AVATARS.map((emoji, i) => {
                const selected = avatar === emoji;
                return (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setAvatar(emoji)}
                    className={`flex aspect-square items-center justify-center rounded-full text-5xl transition ${
                      selected ? "ring-4 ring-primary" : "ring-2 ring-transparent"
                    }`}
                    style={{ backgroundColor: AVATAR_BG[i] }}
                    aria-label={`Avatar ${emoji}`}
                  >
                    {emoji}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block font-display text-lg mb-2">Kid's Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter kid's name"
              maxLength={30}
              className="w-full rounded-full border border-input bg-card px-5 py-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <p className="mt-2 text-sm text-muted-foreground px-2">e.g., Miguel, Sofia, Alex</p>
          </div>

          <div>
            <label className="block font-display text-lg mb-2">Age</label>
            <select
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full appearance-none rounded-full border border-input bg-card px-5 py-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              <option value="">Select age (8-14)</option>
              {[8, 9, 10, 11, 12, 13, 14].map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="inline-flex items-center justify-center gap-2 rounded-full bg-tint px-4 py-3 text-sm text-muted-foreground">
            <Lock className="h-4 w-4 text-primary" />
            We're COPPA compliant and kid-safe
          </div>

          <button
            type="submit"
            disabled={!ready || loading}
            className={`mt-2 rounded-full px-6 py-4 font-display text-lg transition ${
              ready && !loading
                ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover"
                : "bg-tint text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? "Creating…" : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
