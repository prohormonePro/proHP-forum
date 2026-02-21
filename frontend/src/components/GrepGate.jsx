import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Beaker, MessageSquare, Lock } from "lucide-react";
import GrepGateCTA from "./GrepGateCTA";
import useAuthStore from "../stores/auth";

export default function GrepGate({ autoQuery = "", title = "", excludeSlug = "" }) {
  const user = useAuthStore((s) => s.user);
  const userTier = user?.tier || "lab_rat";
  const restricted = useMemo(() => userTier === "lab_rat", [userTier]);
  const visibleThreadCap = restricted ? 2 : 50;
  const MAX_VISIBLE = 5;
  const BLUR_TEASERS = restricted ? 3 : 0;

  const [q, setQ] = useState((autoQuery || "").trim().slice(0, 100));
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [searched, setSearched] = useState(false);
  const [compounds, setCompounds] = useState([]);
  const [threads, setThreads] = useState([]);

  async function runSearch(e, forcedQuery) {
    if (e) e.preventDefault();
    const query = (forcedQuery ?? q ?? "").trim().slice(0, 100);
    if (!query) return;

    setLoading(true);
    setErr("");
    setSearched(true);

    try {
      const [threadsRes, compoundsRes] = await Promise.all([
        fetch("/api/threads/search/query?q=" + encodeURIComponent(query), { credentials: "include" }),
        fetch("/api/compounds?search=" + encodeURIComponent(query), { credentials: "include" })
      ]);

      let cItems = [];
      if (compoundsRes.ok) {
        const cj = await compoundsRes.json();
        const list = Array.isArray(cj) ? cj : Array.isArray(cj.items) ? cj.items : [];
        cItems = list
          .filter((c) => !(excludeSlug && c.slug === excludeSlug))
          .map((c) => ({
            _type: "compound",
            id: "comp_" + c.id,
            url: "/compounds/" + c.slug,
            title: c.name || c.slug,
            excerpt: c.summary || "",
            meta1: (c.category || "").toUpperCase() || "COMPOUND",
            meta2: c.risk_tier ? "Risk: " + c.risk_tier : ""
          }));
      }

      let tItems = [];
      if (threadsRes.ok) {
        const tj = await threadsRes.json();
        const items = Array.isArray(tj.results) ? tj.results : Array.isArray(tj.threads) ? tj.threads : Array.isArray(tj.items) ? tj.items : [];
        tItems = items.map((t) => ({
          _type: "thread",
          id: "thread_" + t.id,
          url: "/t/" + t.id,
          title: t.title || "Untitled",
          excerpt: t.excerpt || t.body || "",
          meta1: t.author_username || t.username || "prohp",
          meta2: t.created_at ? new Date(t.created_at).toLocaleDateString() : ""
        }));
      }

      setCompounds(cItems);
      setThreads(tItems);
    } catch (e2) {
      setErr("Search failed. Try again.");
      setCompounds([]);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const initial = (autoQuery || "").trim().slice(0, 100);
    if (initial) {
      setQ(initial);
      runSearch(null, initial);
    }
  }, [autoQuery]);

  const compoundsShown = compounds.slice(0, MAX_VISIBLE);
  const remainingSlots = Math.max(0, MAX_VISIBLE - compoundsShown.length);
  const visibleThreads = threads.slice(0, Math.min(visibleThreadCap, remainingSlots));
  const hasMoreBlurred = restricted && threads.length > visibleThreadCap;
  const blurredTeasers = hasMoreBlurred ? threads.slice(visibleThreadCap, visibleThreadCap + BLUR_TEASERS) : [];
  const total = compounds.length + threads.length;

  const heading = title?.trim() ? title.trim() : "Still have a question? Search the library.";

  function Card({ item, blurred }) {
    const isCompound = item._type === "compound";
    return (
      <div
        className={"group relative rounded-xl border bg-slate-900 p-5 transition " + (blurred ? "border-transparent select-none" : "border-white/5 hover:border-white/20")}
        style={blurred ? { filter: "blur(6px)", pointerEvents: "none" } : {}}
      >
        {!blurred && <Link to={item.url} className="absolute inset-0 z-10" />}
        {blurred && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/10 rounded-xl">
            <Lock className="text-slate-400" size={28} />
          </div>
        )}
        <div className="flex items-start gap-4">
          <div className="mt-1">
            {isCompound ? <Beaker size={16} className="text-emerald-400" /> : <MessageSquare size={16} className="text-[#229DD8]" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={"text-lg font-bold truncate transition " + (isCompound ? "text-emerald-400 group-hover:text-emerald-300" : "text-[#229DD8] group-hover:text-[#3ab2eb]")}>
              {item.title}
            </h3>
            <div className="mt-1 text-sm text-slate-300 line-clamp-2 leading-relaxed">{item.excerpt}</div>
            <div className="mt-3 flex items-center gap-4 text-xs font-bold tracking-wide text-slate-500 uppercase">
              {item.meta1 && <span>{item.meta1}</span>}
              {item.meta1 && item.meta2 && <span>&middot;</span>}
              {item.meta2 && <span>{item.meta2}</span>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{heading}</h2>
      </div>
      <form onSubmit={runSearch} className="mb-6">
        <div className="relative flex items-center">
          <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search compounds, side effects, or user logs..." className="w-full rounded-xl border border-slate-700 bg-slate-900 py-4 pl-5 pr-20 text-white placeholder-slate-500 focus:border-[#229DD8] focus:outline-none focus:ring-1 focus:ring-[#229DD8] shadow-lg" />
          <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#229DD8] px-4 py-2 text-white font-bold hover:bg-[#1b87bc] transition disabled:opacity-50">Search</button>
        </div>
      </form>
      {err && <div className="mb-5 rounded-lg bg-red-500/10 p-4 text-red-300 border border-red-500/20">{err}</div>}
      {loading && <div className="py-10 text-center text-slate-400 animate-pulse font-medium tracking-wide">Scanning the archives...</div>}
      {!loading && searched && total === 0 && !err && <div className="py-10 text-center text-slate-500">No results found.</div>}
      {!loading && total > 0 && (
        <div className="space-y-4">
          <div className="mb-4 text-sm font-semibold tracking-wide text-slate-400 uppercase">Found {total} results</div>
          {compoundsShown.map((item) => <Card key={item.id} item={item} blurred={false} />)}
          {visibleThreads.map((item) => <Card key={item.id} item={item} blurred={false} />)}
          {hasMoreBlurred && <GrepGateCTA />}
          {blurredTeasers.map((item) => <Card key={item.id} item={item} blurred={true} />)}
          {(compounds.length > compoundsShown.length || threads.length > visibleThreads.length) && (
            <div className="pt-2 text-xs text-slate-500">Showing top results. Refine your search to drill deeper.</div>
          )}
        </div>
      )}
    </div>
  );
}
