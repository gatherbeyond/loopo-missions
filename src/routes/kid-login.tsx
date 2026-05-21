import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect, type FormEvent } from "react";
import { ArrowLeft, Delete } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { setKidSession } from "@/lib/kid-session";
import loopoHi from "@/assets/loopo-hi.png";

export const Route = createFileRoute("/kid-login")({
  component: KidLoginPage,
});

type Family = { id: string; family_code: string; family_name: string };
type Kid = { id: string; name: string; avatar: string | null; pin_hash: string };

type Step = "code" | "kid" | "pin";

function KidLoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("code");
  const [code, setCode] = useState("");
  const [family, setFamily] = useState<Family | null>(null);
  const [kids, setKids] = useState<Kid[]>([]);
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null);
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const submitCode = async (e: FormEvent) => {
    e.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (normalizedCode.length !== 6) return;
    setLoading(true);
    setError("");
    const { data: fam } = await supabase
      .from("families")
      .select("id, family_code, family_name")
      .ilike("family_code", normalizedCode)
      .maybeSingle();
    if (!fam) {
      setLoading(false);
      setError("Code not found — check with your parent");
      return;
    }
    const { data: k } = await supabase
      .from("kids")
      .select("id, name, avatar, pin_hash")
      .eq("family_id", fam.id);
    setFamily(fam);
    setKids((k as Kid[]) || []);
    setStep("kid");
    setLoading(false);
  };

  const pickKid = (k: Kid) => {
    setSelectedKid(k);
    setPin("");
    setError("");
    setStep("pin");
  };

  useEffect(() => {
    if (step !== "pin" || pin.length !== 4 || !selectedKid || !family) return;
    if (pin === String(selectedKid.pin_hash)) {
      setKidSession({
        kidId: selectedKid.id,
        kidName: selectedKid.name,
        avatar: selectedKid.avatar,
        familyId: family.id,
        familyCode: family.family_code,
      });
      navigate({ to: "/kid" });
    } else {
      setError("Wrong PIN — try again");
      setShake(true);
      setTimeout(() => {
        setShake(false);
        setPin("");
      }, 500);
    }
  }, [pin, selectedKid, family, step, navigate]);

  return (
    <main
      className="min-h-screen flex justify-center px-5 py-8 text-white"
      style={{ background: "linear-gradient(160deg, #6200E6 0%, #7C4DFF 100%)" }}
    >
      <div className="w-full max-w-[430px] flex flex-col">
        <button
          onClick={() => {
            if (step === "code") navigate({ to: "/" });
            else if (step === "kid") setStep("code");
            else setStep("kid");
          }}
          className="inline-flex h-10 w-10 items-center text-white/90"
          aria-label="Back"
        >
          <ArrowLeft className="h-6 w-6" />
        </button>

        <div className="flex justify-center mt-2">
          <img src={loopoHi} alt="Loopo" className="h-28 w-auto drop-shadow-xl" />
        </div>

        {step === "code" && (
          <form onSubmit={submitCode} className="mt-6 flex flex-col">
            <h1 className="text-center text-3xl text-white">Hey, what's your family code?</h1>
            <p className="mt-2 text-center text-white/80 text-sm">
              Ask your parent if you don't know it
            </p>
            <CodeBoxes value={code} onChange={setCode} />
            {error && (
              <p className="mt-4 text-center text-sm rounded-full bg-white/15 py-2 px-4">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={code.length !== 6 || loading}
              className={`mt-8 rounded-full px-6 py-4 font-display text-lg transition ${
                code.length === 6 && !loading
                  ? "bg-gold text-gold-foreground shadow-[0_8px_24px_-8px_rgba(0,0,0,0.4)]"
                  : "bg-white/20 text-white/60 cursor-not-allowed"
              }`}
            >
              {loading ? "Checking…" : "Continue"}
            </button>
          </form>
        )}

        {step === "kid" && (
          <div className="mt-6">
            <h1 className="text-center text-3xl text-white">Who are you?</h1>
            <p className="mt-2 text-center text-white/80 text-sm">
              Tap your avatar
            </p>
            {kids.length === 0 ? (
              <p className="mt-8 text-center text-white/80">
                No kids added yet — ask your parent.
              </p>
            ) : (
              <div className="mt-6 grid grid-cols-2 gap-4">
                {kids.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => pickKid(k)}
                    className="flex flex-col items-center rounded-3xl bg-white/15 backdrop-blur p-5 hover:bg-white/25 transition active:scale-95"
                  >
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl">
                      {k.avatar || "🙂"}
                    </div>
                    <p className="mt-3 font-display text-lg text-white">{k.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step === "pin" && selectedKid && (
          <div className="mt-6 flex flex-col">
            <div className="flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl">
                {selectedKid.avatar || "🙂"}
              </div>
            </div>
            <h1 className="mt-4 text-center text-3xl text-white">Hi {selectedKid.name}!</h1>
            <p className="mt-1 text-center text-white/80 text-sm">Enter your 4-digit PIN</p>

            <div
              className={`mt-6 flex justify-center gap-3 ${shake ? "animate-[shake_0.4s]" : ""}`}
              style={{
                animationName: shake ? "shake" : undefined,
              }}
            >
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur text-3xl text-white font-display"
                >
                  {pin[i] ? "•" : ""}
                </div>
              ))}
            </div>

            {error && (
              <p className="mt-4 text-center text-sm rounded-full bg-destructive/80 py-2 px-4">
                {error}
              </p>
            )}

            <Keypad
              onDigit={(d) => setPin((p) => (p.length < 4 ? p + d : p))}
              onDelete={() => setPin((p) => p.slice(0, -1))}
            />
          </div>
        )}

        <p className="mt-auto pt-8 text-center text-sm text-white/70">
          Parent?{" "}
          <Link to="/login" className="font-bold text-white underline">
            Log in here
          </Link>
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-10px); }
          40% { transform: translateX(10px); }
          60% { transform: translateX(-8px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </main>
  );
}

function CodeBoxes({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const chars = Array.from({ length: 6 }, (_, i) => value[i] || "");

  const setAt = (i: number, ch: string) => {
    const next = (value + "      ").slice(0, 6).split("");
    next[i] = ch;
    const joined = next.join("").trimEnd().toUpperCase().slice(0, 6);
    onChange(joined);
    if (ch && i < 5) inputs.current[i + 1]?.focus();
  };

  return (
    <div className="mt-8 flex justify-center gap-2">
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          value={c}
          onChange={(e) => {
            const v = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
            if (!v) {
              setAt(i, "");
              return;
            }
            if (v.length > 1) {
              // pasted
              onChange(v.slice(0, 6));
              const focusIdx = Math.min(v.length, 5);
              inputs.current[focusIdx]?.focus();
              return;
            }
            setAt(i, v);
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !chars[i] && i > 0) {
              inputs.current[i - 1]?.focus();
            }
          }}
          inputMode="text"
          maxLength={1}
          className="h-14 w-12 rounded-2xl bg-white/15 backdrop-blur text-center text-2xl font-display text-white outline-none focus:bg-white/25 focus:ring-2 focus:ring-white uppercase"
        />
      ))}
    </div>
  );
}

function Keypad({ onDigit, onDelete }: { onDigit: (d: string) => void; onDelete: () => void }) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  return (
    <div className="mt-8 grid grid-cols-3 gap-3 max-w-xs mx-auto w-full">
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => onDigit(k)}
          className="h-16 rounded-2xl bg-white/15 backdrop-blur font-display text-2xl text-white hover:bg-white/25 active:scale-95 transition"
        >
          {k}
        </button>
      ))}
      <div />
      <button
        onClick={() => onDigit("0")}
        className="h-16 rounded-2xl bg-white/15 backdrop-blur font-display text-2xl text-white hover:bg-white/25 active:scale-95 transition"
      >
        0
      </button>
      <button
        onClick={onDelete}
        className="h-16 rounded-2xl bg-white/15 backdrop-blur font-display text-2xl text-white hover:bg-white/25 active:scale-95 transition flex items-center justify-center"
        aria-label="Delete"
      >
        <Delete className="h-6 w-6" />
      </button>
    </div>
  );
}
