import type { IncomingMessage, ServerResponse } from "node:http";

const SUPABASE_URL = (process.env.VITE_SUPABASE_URL ?? "").replace(/\/+$/, "");
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "";
// Default to this project's URL so the endpoint works even without env vars.
const FALLBACK_URL = "https://iqedxusjtawqvisbypnf.supabase.co";

async function ping(target: string): Promise<{ target: string; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const headers: Record<string, string> = {};
    if (SUPABASE_ANON_KEY) {
      headers["apikey"] = SUPABASE_ANON_KEY;
      headers["Authorization"] = `Bearer ${SUPABASE_ANON_KEY}`;
    }
    const res = await fetch(target, { headers, signal: controller.signal });
    return { target, status: res.status };
  } catch (error) {
    return { target, status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Keep-alive endpoint, hit by Vercel Cron (see vercel.json "crons").
 * Sends real requests to the Supabase project so the free-tier instance is
 * not paused for inactivity (pauses after ~7 days without API traffic).
 */
export default async function handler(
  _req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  const startedAt = Date.now();
  const base = SUPABASE_URL || FALLBACK_URL;

  const results = [
    await ping(`${base}/rest/v1/`),
    await ping(`${base}/auth/v1/health`),
  ];

  const ok = results.some((r) => r.status > 0 && r.status < 500);
  const body = JSON.stringify({
    ok,
    results,
    tookMs: Date.now() - startedAt,
    at: new Date().toISOString(),
  });

  res.statusCode = ok ? 200 : 502;
  res.setHeader("content-type", "application/json");
  res.setHeader("cache-control", "no-store, max-age=0");
  res.end(body);
}