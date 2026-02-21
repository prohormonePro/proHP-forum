import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import GrepGateCTA from "./GrepGateCTA";
import useAuthStore from "../stores/auth";

export default function GrepGate({ autoQuery = "", title = "" }) {
  const user = useAuthStore((s) => s.user);
  const userTier = user?.tier || "lab_rat";

  const [q, setQ] = useState(autoQuery || "");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState({ total: 0, items: [] });
  const [searched, setSearched] = useState(false);

  const restricted = useMemo(() => userTier === "lab_rat", [userTier]);
  const visibleCap = restricted ? 2 : 50;
  // Auto-search on mount when autoQuery is provided
  useEffect(() => {
    if (autoQuery && autoQuery.trim()) {
      setQ(autoQuery);
      setLoading(true);
      setErr("");
      setSearched(true);
      fetch("/api/threads/search/query?q=" + encodeURIComponent(autoQuery.trim().slice(0, 100)), { credentials: "include" })
        .then(r => { if (!r.ok) throw new Error("HTTP_" + r.status); return r.json(); })
        .then(j => {
          const items = Array.isArray(j.results) ? j.results : Array.isArray(j.threads) ? j.threads : Array.isArray(j.items) ? j.items : [];
          const total = Number(j.total || j.count || items.length || 0);
          setData({ total, items });
        })
        .catch(() => { setErr("Search failed."); setData({ total: 0, items: [] }); })
        .finally(() => setLoading(false));
    }
  }, [autoQuery]);


  async function runSearch(e) {
    if (e) e.preventDefault();
    const query = (q || "").trim().slice(0, 100);
    if (!query) return;

    setLoading(true);
    setErr("");
    setSearched(true);

    try {
      const url = "/api/threads/search/query?q=" + encodeURIComponent(query);
      const r = await fetch(url, { credentials: "include" });
      if (!r.ok) throw new Error("HTTP_" + r.status);

      const j = await r.json();
      const items =
        Array.isArray(j.results) ? j.results :
        Array.isArray(j.threads) ? j.threads :
        Array.isArray(j.items) ? j.items : [];

      const total = Number(j.total || j.count || items.length || 0);
      setData({ total, items });
    } catch {
      setErr("Search failed. Try again or check back shortly.");
      setData({ total: 0, items: [] });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">{title || "Grep"}</h1>
        <p className="mt-2 text-slate-400">{title ? "" : "Search the collective logs, protocols, and bloodwork."}</p>
      </div>

      <form onSubmit={runSearch} className="mb-8">
        <div className="relative flex items-center">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search compounds, side effects, labs, user logs..."
            className="w-full rounded-xl border border-white/10 bg-slate-900 py-3.5 pl-5 pr-4 text-white placeholder-slate-500 focus:border-[#229DD8] focus:outline-none focus:ring-1 focus:ring-[#229DD8]"
          />
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#229DD8] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1b87bc] transition disabled:opacity-50"
          >
            Search
          </button>
        </div>
      </form>

      {err && (
        <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-red-400">
          {err}
        </div>
      )}

      {loading && (
        <div className="py-12 text-center text-slate-400 animate-pulse">
          Scanning the archives...
        </div>
      )}

      {!loading && searched && data.items.length === 0 && !err && (
        <div className="py-12 text-center text-slate-500">
          No logs found matching your query.
        </div>
      )}

      {!loading && data.items.length > 0 && (
        <div className="space-y-4">
          <div className="mb-4 text-sm font-medium text-slate-400">
            Found {data.total} results
          </div>

          {data.items.slice(0, visibleCap).map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl border border-white/5 bg-slate-900 p-5 transition hover:border-white/10"
            >
              <Link to={`/t/${item.id}`} className="absolute inset-0 z-10" />
              <div>
                <h3 className="text-lg font-semibold text-[#229DD8] group-hover:text-[#3ab2eb] transition">
                  {item.title}
                </h3>
                <div className="mt-1 text-sm text-slate-300 line-clamp-2">
                  {item.body || item.excerpt || ""}
                </div>
                <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    {item.author_username || "Anonymous"}
                  </span>
                  <span>
                    {new Date(item.created_at || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {restricted && data.items.length > visibleCap && (
            <>
              <GrepGateCTA />
              {data.items.slice(visibleCap).map((item) => (
                <div
                  key={item.id}
                  className="relative overflow-hidden rounded-xl border border-white/5 bg-slate-900 p-5 select-none"
                  style={{ filter: "blur(5px)" }}
                >
                  <div className="pointer-events-none">
                    <h3 className="text-lg font-semibold text-slate-400">{item.title}</h3>
                    <div className="mt-1 text-sm text-slate-600 line-clamp-2">
                      {item.body || item.excerpt || ""}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600">
                      <span>Anonymous</span>
                      <span>Date hidden</span>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
