import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GrepGateCTA from "./GrepGateCTA";

// --- AUTH STORE SAFE IMPORT (handles default OR named export) ---
import * as AuthMod from "../stores/auth";
const useAuthStore =
  (AuthMod && AuthMod.useAuthStore) ||
  (AuthMod && AuthMod.default) ||
  null;
// ---------------------------------------------------------------

export default function GrepGate() {
  // If auth store missing/unexpected, default to lab_rat to keep build alive.
  const user = useAuthStore ? useAuthStore((s) => s.user) : null;
  const userTier = user?.tier || "lab_rat";

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ total: 0, items: [] });
  const [searched, setSearched] = useState(false);

  const restricted = useMemo(() => userTier === "lab_rat", [userTier]);
  const visibleCap = restricted ? 2 : 50;

  async function runSearch(e) {
    if (e) e.preventDefault();
    const query = (q || "").trim().slice(0, 100);
    if (!query) return;

    setLoading(true);
    setErr("");
    setSearched(true);

    try {
      // Backend route confirmed:
      // router.get('/search/query', ...) under /api/threads
      const url = "/api/threads/search/query?q=" + encodeURIComponent(query);
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error("HTTP_" + r.status);
      const j = await r.json();

      const total = Number(j.total || j.count || 0);
      const items =
        Array.isArray(j.threads) ? j.threads :
        Array.isArray(j.items) ? j.items :
        Array.isArray(j.results) ? j.results :
        [];

      setData({ total, items });
    } catch (e2) {
      setErr("Search failed. Try again or check back shortly.");
      setData({ total: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      <div className="mb-5">
        <div className="text-white text-2xl font-semibold">Grep</div>
        <div className="mt-1 text-sm text-slate-400">
          Search threads, protocols, bloodwork notes, and hard-earned lessons.
        </div>
      </div>

      <form onSubmit={runSearch} className="mb-5">
        <div className="relative">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search compounds, sides, dosing, labs…"
            className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 pr-12 text-white placeholder:text-slate-500 shadow-[0_12px_30px_rgba(0,0,0,0.35)] focus:outline-none focus:ring-2 focus:ring-[#229DD8]/50"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/5 transition disabled:opacity-50"
            aria-label="Search"
            title="Search"
          >
            🔎
          </button>
        </div>
      </form>

      {err && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      )}

      {loading && <div className="py-6 text-sm text-slate-400">Searching…</div>}

      {!loading && searched && data.items.length === 0 && !err && (
        <div className="py-10 text-center text-sm text-slate-500">
          No matches. Try a compound name, side effect, or slang term.
        </div>
      )}

      {!loading && data.total > 0 && (
        <div className="mb-3 text-xs text-slate-500">
          {data.total} results • {Math.min(data.items.length, visibleCap)} visible
          {restricted ? ` • ${Math.max(0, data.total - visibleCap)} locked` : ""}
        </div>
      )}

      <div className="space-y-3">
        {data.items.slice(0, visibleCap).map((t) => {
          const id = t.id ?? t.thread_id ?? t.slug;
          const title = t.title ?? "Untitled";
          const excerpt = t.excerpt ?? t.body_preview ?? t.body ?? "";
          const url = t.url ?? (id ? `/t/${id}` : "#");

          return (
            <div key={id || title} className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 hover:bg-slate-900/60 transition">
              <div className="text-white font-semibold leading-snug">
                <Link to={url} className="hover:text-[#229DD8] transition">
                  {title}
                </Link>
              </div>
              {excerpt && <div className="mt-1 text-sm text-slate-300 line-clamp-3">{excerpt}</div>}
              <div className="mt-3 text-xs text-slate-500">
                {(t.room_name || t.room || "")}{(t.room_name || t.room) ? " • " : ""}
                {(t.author_username || t.author || "anon")}
              </div>
            </div>
          );
        })}
      </div>

      {restricted && data.items.length > visibleCap && (
        <>
          <GrepGateCTA />
          <div className="mt-4 space-y-3">
            {data.items.slice(visibleCap, Math.min(data.items.length, visibleCap + 3)).map((t, idx) => (
              <div
                key={`locked_${t.id || idx}`}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/30 p-4"
                style={{ filter: "blur(7px)", userSelect: "none", pointerEvents: "none" }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs text-slate-200">
                    🔒 Locked
                  </div>
                </div>
                <div className="text-white font-semibold">{t.title ?? "Locked thread"}</div>
                <div className="mt-1 text-sm text-slate-300 line-clamp-2">{t.excerpt ?? ""}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
