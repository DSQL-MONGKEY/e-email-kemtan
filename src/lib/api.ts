const BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || ""; // if empty, use relative


export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
   const res = await fetch(`${BASE}${path}`, { ...init, cache: "no-store" });
   if (!res.ok) throw new Error(await res.text());
   return res.json() as Promise<T>;
}


export async function apiPost<T>(path: string, body: unknown, init?: RequestInit): Promise<T> {
const res = await fetch(`${BASE}${path}`, {
   method: "POST",
   headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
   body: JSON.stringify(body),
});
   if (!res.ok) throw new Error(await res.text());
   return res.json() as Promise<T>;
}