import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, Share2, Info } from "lucide-react";
import { toast } from "sonner";
import { getFlow } from "@/lib/setup-flow";

export const Route = createFileRoute("/family-code")({
  component: FamilyCodePage,
});

function FamilyCodePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  useEffect(() => {
    const flow = getFlow();
    if (!flow.familyCode) {
      navigate({ to: "/family-name" });
      return;
    }
    setCode(flow.familyCode);
  }, [navigate]);

  const today = new Date().toLocaleDateString(undefined, { day: "numeric", month: "short" });

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    toast.success("Code copied");
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Loopo family code", text: `Our Loopo family code: ${code}` }); }
      catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(code);
      toast.success("Code copied to clipboard");
    }
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col items-center">
        <div className="mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-[0_8px_24px_-8px_rgba(0,200,83,0.5)]">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>

        <h1 className="mt-6 text-4xl">Family Created!</h1>

        <span className="mt-4 rounded-full bg-tint px-4 py-1.5 font-display text-primary">
          {today}
        </span>

        <p className="mt-8 font-display text-xl">Your Family Code:</p>

        <div className="mt-3 w-full rounded-3xl border-2 border-primary bg-card p-4">
          <div className="flex justify-center gap-2">
            {code.split("").map((c, i) => (
              <div
                key={i}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-muted font-display text-2xl text-primary"
              >
                {c}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex w-full gap-3">
          <button
            onClick={copy}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-display text-primary-foreground hover:bg-primary-hover transition"
          >
            <Copy className="h-4 w-4" /> Copy Code
          </button>
          <button
            onClick={share}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-4 py-3 font-display text-primary hover:bg-tint transition"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        </div>

        <div className="mt-6 w-full rounded-2xl bg-tint p-5">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div>
              <p className="font-display text-primary">Important:</p>
              <ul className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                <li>• All your kids will use this SAME code to log in</li>
                <li>• Each kid will have their own PIN</li>
                <li>• You can view this code anytime in Settings</li>
              </ul>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/add-kid" })}
          className="mt-8 w-full rounded-full bg-primary px-6 py-4 font-display text-lg text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover active:translate-y-0.5 transition"
        >
          Continue to Add Kids
        </button>
      </div>
    </main>
  );
}
