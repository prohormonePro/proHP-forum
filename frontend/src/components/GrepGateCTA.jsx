import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../stores/auth";

export default function GrepGateCTA() {
  const nav = useNavigate();
  const accessToken = useAuthStore((s) => s.accessToken);
  const [loading, setLoading] = useState(false);

  async function handleStartHere() {
    // Not logged in → preserve original behavior
    if (!accessToken) return nav("/compounds");

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try {
          const data = await res.json();
          msg = data?.error || msg;
        } catch {}
        throw new Error(msg);
      }

      const data = await res.json();
      window.location.href = data.url;
    } catch (e) {
      console.error("Checkout failed:", e);
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 rounded-2xl border border-[#229DD8]/40 bg-gradient-to-b from-slate-950 to-slate-900 p-5 shadow-[0_14px_40px_rgba(0,0,0,0.35)]">
      <div className="flex items-start gap-3">
        <div className="mt-1 h-2.5 w-2.5 rounded-full bg-[#229DD8] shadow-[0_0_0_6px_rgba(34,157,216,0.15)]" />
        <div className="flex-1">
          <div className="text-white text-base font-semibold">Full logs require participation</div>
          <div className="mt-1 text-sm leading-relaxed text-slate-300">
            Real cycles. Real bloodwork. Real mistakes. Posted by dudes actually under the bar.
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button onClick={handleStartHere} disabled={loading} className="inline-flex items-center justify-center rounded-xl bg-[#229DD8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b87bc] transition disabled:opacity-50">
              {loading ? "Securing Checkout..." : "Join Inner Circle"}
            </button>
            <button onClick={() => nav("/login")} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition">
              I'm already in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
