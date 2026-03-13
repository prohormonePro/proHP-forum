"""Stage 321 v2 patcher: Home.jsx homepage bottom layout correction."""
import sys
from pathlib import Path

home = Path("/home/travisd/prohp-forum/frontend/src/pages/Home.jsx")
source = home.read_text(encoding="utf-8")

old = """      {/* \u2500\u2500 Consultation CTA \u2500\u2500 */}
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

new = """      {/* \u2500\u2500 Travis Image Placeholder \u2500\u2500 */}
      <div className="prohp-card p-5 mb-8">
        <div className="w-full max-w-md mx-auto aspect-[4/5] rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center bg-[var(--surface-elevated)]/40">
          <p className="text-xs text-[var(--text-muted)] italic">Travis image placeholder</p>
        </div>
      </div>

      {/* \u2500\u2500 About Travis \u2500\u2500 */}
      <div className="prohp-card p-5 mb-8">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">About Travis</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          I built ProHormonePro to cut through hype and give people straight answers. Real-world context,
          real risk discussion, real receipts. The goal here is simple: make this the place where people
          can learn, verify, and make better decisions without getting sold fantasy.
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

if old not in source:
    print("ERROR: anchor not found")
    # Debug: show what chars are around the comment
    idx = source.find("Consultation CTA")
    if idx >= 0:
        snippet = source[idx-20:idx+30]
        print(f"Found 'Consultation CTA' at {idx}")
        print(f"Surrounding: {repr(snippet)}")
    else:
        print("'Consultation CTA' not found at all")
    idx2 = source.find("Founding Member Banner")
    if idx2 >= 0:
        print(f"Found 'Founding Member Banner' at {idx2}")
    sys.exit(1)

backup = home.with_suffix(".jsx.bak_321_v2")
backup.write_text(source, encoding="utf-8")

updated = source.replace(old, new, 1)
home.write_text(updated, encoding="utf-8")

print("PATCHED: Home.jsx")
print("  Founding Member block: REMOVED")
print("  Image placeholder: ADDED")
print("  About Travis: ADDED")
print("  Consultation CTA: now last block")
