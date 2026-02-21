import React from "react";
import { useNavigate } from "react-router-dom";

export default function GrepGateCTA() {
  const nav = useNavigate();
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
            <button onClick={() => nav("/register")} className="inline-flex items-center justify-center rounded-xl bg-[#229DD8] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1b87bc] transition">
              Start Here
            </button>
            <button onClick={() => nav("/login")} className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition">
              I'm already in
            </button>
          </div>
          <div className="mt-3 text-xs text-slate-400">Unlock full search, posting, and member-only threads.</div>
        </div>
      </div>
    </div>
  );
}
