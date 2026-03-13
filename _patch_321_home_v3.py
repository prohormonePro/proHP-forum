"""Stage 321 v3 patcher: marker-based homepage bottom layout correction."""
import sys
from pathlib import Path

home = Path("/home/travisd/prohp-forum/frontend/src/pages/Home.jsx")
source = home.read_text(encoding="utf-8")

consult_marker = '{/* ── Consultation CTA ── */}'
founding_marker = '{/* ── Founding Member Banner ── */}'
end_marker = '      )}\n    </div>'

consult_idx = source.find(consult_marker)
founding_idx = source.find(founding_marker)

if consult_idx < 0:
    print("ERROR: Consultation marker not found")
    sys.exit(1)

if founding_idx < 0:
    print("ERROR: Founding Member marker not found")
    sys.exit(1)

if founding_idx <= consult_idx:
    print("ERROR: Founding marker appears before consultation marker")
    sys.exit(1)

end_idx = source.find(end_marker, founding_idx)
if end_idx < 0:
    print("ERROR: end marker for founding block not found")
    sys.exit(1)

replacement = """      {/* ── Travis Image Placeholder ── */}
      <div className="prohp-card p-5 mb-8">
        <div className="w-full max-w-md mx-auto aspect-[4/5] rounded-xl border-2 border-dashed border-[var(--border-subtle)] flex items-center justify-center bg-[var(--surface-elevated)]/40">
          <p className="text-xs text-[var(--text-muted)] italic">Travis image placeholder</p>
        </div>
      </div>

      {/* ── About Travis ── */}
      <div className="prohp-card p-5 mb-8">
        <h3 className="text-sm font-bold text-[var(--text-primary)] mb-2">About Travis</h3>
        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
          I built ProHormonePro to cut through hype and give people straight answers. Real-world context,
          real risk discussion, real receipts. The goal here is simple: make this the place where people
          can learn, verify, and make better decisions without getting sold fantasy.
        </p>
      </div>

      {/* ── Consultation CTA ── */}
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
            <a
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
"""

# keep everything before the consultation marker,
# replace consultation + founding block area,
# keep the closing of the page
updated = source[:consult_idx] + replacement + source[end_idx:]

backup = home.with_suffix(".jsx.bak_321_v3")
backup.write_text(source, encoding="utf-8")
home.write_text(updated, encoding="utf-8")

print("PATCHED: Home.jsx")
print(f"Backup written: {backup}")
print("  Founding Member block: REMOVED")
print("  Image placeholder: ADDED")
print("  About Travis: ADDED")
print("  Consultation CTA: MOVED to bottom")
