import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Copy, MessageSquare, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { clearFlow, getFlow } from "@/lib/setup-flow";

export const Route = createFileRoute("/kid-created")({
  component: KidCreatedPage,
});

function KidCreatedPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    const f = getFlow();
    if (!f.lastKidName || !f.lastKidPin || !f.familyCode) {
      navigate({ to: "/family-name" });
      return;
    }
    setName(f.lastKidName);
    setPin(f.lastKidPin);
    setCode(f.familyCode);
  }, [navigate]);

  const summary = `${name} can log in to Loopo with family code ${code} and PIN ${pin}`;

  const copyInfo = async () => {
    await navigator.clipboard.writeText(summary);
    toast.success("Login info copied");
  };

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${name}'s Loopo login`, text: summary }); }
      catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(summary);
      toast.success("Copied — paste it into a message");
    }
  };

  return (
    <main className="min-h-screen flex justify-center px-5 py-8">
      <div className="w-full max-w-[430px] flex flex-col items-center">
        <div className="mt-4 flex h-20 w-20 items-center justify-center rounded-full bg-success shadow-[0_8px_24px_-8px_rgba(0,200,83,0.5)]">
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </div>

        <h1 className="mt-5 text-center text-3xl">
          ✅ {name}'s Account Created!
        </h1>

        <div className="mt-6 w-full rounded-3xl border-2 border-primary bg-card p-6">
          <p className="font-display text-lg">Here's how {name} logs in:</p>

          <p className="mt-5 text-sm text-muted-foreground">Family Code:</p>
          <p className="font-display text-4xl text-primary tracking-wider">{code}</p>
          <p className="text-sm text-muted-foreground">(Same for all kids)</p>

          <p className="mt-5 text-sm text-muted-foreground">{name}'s PIN:</p>
          <div className="mt-2 flex gap-3">
            {pin.split("").map((d, i) => (
              <div
                key={i}
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted font-display text-3xl text-primary"
              >
                {d}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex w-full gap-3">
          <button
            onClick={copyInfo}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 font-display text-primary-foreground hover:bg-primary-hover transition"
          >
            <Copy className="h-4 w-4" /> Copy Info
          </button>
          <button
            onClick={share}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary px-4 py-3 font-display text-primary hover:bg-tint transition"
          >
            <MessageSquare className="h-4 w-4" /> Share via Message
          </button>
        </div>

        <div className="mt-5 w-full rounded-2xl bg-tint p-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <Lightbulb className="h-5 w-5 shrink-0 text-primary mt-0.5" />
            <div>
              {name} needs both pieces of info to log in
              <p className="mt-1">Keep this safe — you can view it anytime in Settings</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate({ to: "/add-kid" })}
          className="mt-6 w-full rounded-full border-2 border-primary px-6 py-3.5 font-display text-primary hover:bg-tint transition"
        >
          + Add Another Kid
        </button>

        <button
          onClick={() => { clearFlow(); navigate({ to: "/dashboard" }); }}
          className="mt-3 w-full rounded-full bg-primary px-6 py-4 font-display text-lg text-primary-foreground shadow-[0_8px_24px_-8px_rgba(98,0,230,0.55)] hover:bg-primary-hover transition"
        >
          Done - Go to Dashboard
        </button>
      </div>
    </main>
  );
}
