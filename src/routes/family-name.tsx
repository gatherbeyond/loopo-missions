import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { StepDots } from "@/components/StepDots";
import { generateFamilyCode, setFlow } from "@/lib/setup-flow";

export const Route = createFileRoute("/family-name")({
  component: FamilyNamePage,
});

function FamilyNamePage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const trimmed = name.trim();
  const ready = trimmed.length > 0 && trimmed.length <= 30;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true);
    const { data: userRes } = await supabase.auth.getUser();
    const uid = userRes.user?.id;
    if (!uid) {
      setLoading(false);
      toast.error("Please sign up first");
      navigate({ to: "/signup" });
      return;
    }
    const code = generateFamilyCode();
    const { data, error } = await supabase
      .from("families")
      .insert({ family_name: trimmed, family_code: code, parent_id: uid })
      .select("id, family_name, family_code")
      .single();
    setLoading(false);
    if (error || !data) return toast.error(error?.message || "Could not create family");
    setFlow({ familyId: data.id, familyName: data.family_name, familyCode: data.family_code });
    navigate({ to: "/family-code" });
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col">
        <StepDots current={2} total={3} />

        <Link to="/signup" className="mt-6 inline-flex h-10 w-10 items-center text-primary">
          <ArrowLeft className="h-6 w-6" />
        </Link>

        <h1 className="mt-4 text-4xl">What's your family called?</h1>
        <p className="mt-2 text-muted-foreground">This is how you'll appear across Loopo</p>

        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3">
          <label className="font-display text-lg">Family Name</label>
          <input
            type="text"
            maxLength={30}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="The Santos Family"
            className="w-full rounded-full border border-input bg-card px-5 py-4 text-base outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
          <div className="flex justify-between text-sm text-muted-foreground px-2">
            <span>e.g., The Smiths, The Lee Family</span>
            <span>{name.length}/30</span>
          </div>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            Credit value and currency can be adjusted in Settings after signup
          </p>

          <button
            type="submit"
            disabled={!ready || loading}
            className={`mt-6 flex items-center justify-center gap-2 rounded-full px-6 py-4 font-display text-lg transition ${
              ready && !loading
                ? "bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover"
                : "bg-tint text-muted-foreground cursor-not-allowed"
            }`}
          >
            {loading ? "Creating…" : <>Continue <ArrowRight className="h-5 w-5" /></>}
          </button>
        </form>
      </div>
    </main>
  );
}
