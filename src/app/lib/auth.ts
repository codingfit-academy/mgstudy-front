import { config } from "@/config";

const TOKEN_KEY = "mgstudy:token";

export const AVATAR_OPTIONS = [
  "🦕",
  "🦁",
  "🐼",
  "🦊",
  "🐸",
  "🐰",
  "🐧",
  "🦄",
  "🐬",
  "🌟",
];
export const DEFAULT_AVATAR = AVATAR_OPTIONS[0];

export type Account = {
  name: string;
  email: string;
  nickname: string;
  avatar: string;
};

export type HistoryEntry = { question: string; age: number | null; date: string };

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function errorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    return typeof data.detail === "string" ? data.detail : fallback;
  } catch {
    return fallback;
  }
}

export async function signup(params: {
  name: string;
  email: string;
  password: string;
}): Promise<Account> {
  const res = await fetch(`${config.apiUrl}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "회원가입에 실패했어요"));
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.account;
}

export async function login(email: string, password: string): Promise<Account> {
  const res = await fetch(`${config.apiUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "로그인에 실패했어요"));
  const data = await res.json();
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.account;
}

export async function logout(): Promise<void> {
  const token = getToken();
  localStorage.removeItem(TOKEN_KEY);
  if (!token) return;
  await fetch(`${config.apiUrl}/auth/logout`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  }).catch(() => {});
}

export async function getAccount(): Promise<Account | null> {
  if (!getToken()) return null;
  const res = await fetch(`${config.apiUrl}/auth/me`, { headers: authHeaders() });
  if (!res.ok) {
    if (res.status === 401) localStorage.removeItem(TOKEN_KEY);
    return null;
  }
  return res.json();
}

export async function updateProfile(updates: {
  nickname?: string;
  avatar?: string;
}): Promise<Account> {
  const res = await fetch(`${config.apiUrl}/auth/me`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(await errorMessage(res, "저장에 실패했어요"));
  return res.json();
}

type RawHistoryEntry = { question: string; age: number | null; created_at: string };

export async function getHistory(): Promise<HistoryEntry[]> {
  if (!getToken()) return [];
  const res = await fetch(`${config.apiUrl}/history`, { headers: authHeaders() });
  if (!res.ok) return [];
  const data: RawHistoryEntry[] = await res.json();
  return data.map((d) => ({ question: d.question, age: d.age, date: d.created_at }));
}

export async function addHistoryEntry(entry: {
  question: string;
  age?: number;
}): Promise<void> {
  if (!getToken()) return;
  await fetch(`${config.apiUrl}/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(entry),
  }).catch(() => {});
}
