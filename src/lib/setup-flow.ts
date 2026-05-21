export function generateFamilyCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing 0/O/1/I
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function generatePin(len = 4) {
  let out = "";
  for (let i = 0; i < len; i++) out += Math.floor(Math.random() * 10);
  return out;
}

// Multi-step flow state lives in sessionStorage so a refresh during the
// 3-step setup doesn't blow away the family/kid we just created.
type FlowState = {
  familyId?: string;
  familyName?: string;
  familyCode?: string;
  lastKidName?: string;
  lastKidPin?: string;
};

const KEY = "loopo:setup";

export function getFlow(): FlowState {
  if (typeof window === "undefined") return {};
  try { return JSON.parse(window.sessionStorage.getItem(KEY) || "{}"); } catch { return {}; }
}

export function setFlow(patch: Partial<FlowState>) {
  if (typeof window === "undefined") return;
  const next = { ...getFlow(), ...patch };
  window.sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function clearFlow() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(KEY);
}
