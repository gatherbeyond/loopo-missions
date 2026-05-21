export type KidSession = {
  kidId: string;
  kidName: string;
  avatar: string | null;
  familyId: string;
  familyCode: string;
};

const KEY = "loopo:kid";

export function getKidSession(): KidSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as KidSession) : null;
  } catch {
    return null;
  }
}

export function setKidSession(s: KidSession) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(s));
}

export function clearKidSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
