"""Stage 321 patcher: Home.jsx layout change."""
import sys
from pathlib import Path

home = Path("/home/travisd/prohp-forum/frontend/src/pages/Home.jsx")
source = home.read_text(encoding="utf-8")

OLD = """      {/* \u2500\u2500 Consultation CTA \u2500\u2500 */}
      <div className="prohp-card p-5 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              1-on-1 consultation &mdash; $500
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              Your stack, your goals, your questions. Real talk, no script, receipts included.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 ml-4">
            
              href="https://prohormonepro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="prohp-btn-primary text-xs"
            >
              Book a Consultation
            </a>
            <Link
              to="/r/general"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--prohp-blue)] transition-colors text-right"
            >
              See what a real session looks like
            </Link>
          </div>
        </div>
      </div>
      {/* \u2500\u2500 Founding Member Banner \u2500\u2500 */}
      {!user && (
        <div className="rounded-xl p-5 mb-8 border border-amber-500/15 bg-amber-500/[0.04]">
          <div className="flex items-center gap-2 mb-2">
            <span className="tier-badge tier-founding">Founding Member</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mb-3">
            First 1,000 members get a permanent Founding Member badge. No gimmick. You showed up before anyone else did.
          </p>
          <Link to="/register" className="prohp-btn-primary text-xs">
            Claim Your Spot
          </Link>
        </div>
      )}"""

NEW = """      {/* \u2500\u2500 Travis Image Placeholder \u2500\u2500 */}
      <div className="prohp-card p-5 mb-8 flex items-center justify-center">
        <div className="w-full max-w-sm aspect-square rounded-lg border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center">
          <p className="text-xs text-[var(--text-muted)] italic">Image coming soon</p>
        </div>
      </div>

      {/* \u2500\u2500 About Travis \u2500\u2500 */}
      <div className="prohp-card p-5 mb-8">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">About Travis</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          52+ compounds reviewed. 2M+ YouTube views. 200+ consultations. I built this forum because
          the fitness industry has too much hype and not enough proof. Every compound page, every
          protocol, every recommendation here comes from real research and real bloodwork &mdash;
          not marketing. If I don't know something, I'll say so. Proof over hype. Always.
        </p>
      </div>

      {/* \u2500\u2500 Consultation CTA \u2500\u2500 */}
      <div className="prohp-card p-5 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] mb-1">
              1-on-1 consultation &mdash; $500
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed max-w-md">
              Your stack, your goals, your questions. Real talk, no script, receipts included.
            </p>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0 ml-4">
            
              href="https://prohormonepro.com"
              target="_blank"
              rel="noopener noreferrer"
              className="prohp-btn-primary text-xs"
            >
              Book a Consultation
            </a>
            <Link
              to="/r/general"
              className="text-[10px] text-[var(--text-muted)] hover:text-[var(--prohp-blue)] transition-colors text-right"
            >
              See what a real session looks like
            </Link>
          </div>
        </div>
      </div>"""

if OLD in source:
    source = source.replace(OLD, NEW)
    home.write_text(source, encoding="utf-8")
    print(f"PATCHED: Home.jsx ({len(source)} chars)")
    print("  Founding Members: REMOVED")
    print("  Image placeholder: ADDED")
    print("  About Travis: ADDED")
    print("  Consultation: MOVED to bottom")
else:
    print("ERROR: anchor not found in source")
    sys.exit(1)
