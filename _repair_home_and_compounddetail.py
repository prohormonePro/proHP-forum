import re
import sys
from pathlib import Path

home = Path("/home/travisd/prohp-forum/frontend/src/pages/Home.jsx")
compound = Path("/home/travisd/prohp-forum/frontend/src/pages/CompoundDetail.jsx")

home_src = home.read_text(encoding="utf-8")
compound_src = compound.read_text(encoding="utf-8")

# ---------------------------
# FIX 1: Homepage bottom layout
# Remove Founding Member block
# Insert Travis image placeholder + About Travis above Consultation CTA
# Keep Consultation CTA as final bottom block
# ---------------------------

home_pattern = re.compile(
    r"""\s*\{/\*\s*── Consultation CTA ──\s*\*/\}\s*
      <div className="prohp-card p-5 mb-8">.*?</div>\s*</div>\s*</div>\s*
      \{/\*\s*── Founding Member Banner ──\s*\*/\}\s*
      \{!user && \(
        <div className="rounded-xl p-5 mb-8 border border-amber-500/15 bg-amber-500/\[0\.04\]">.*?</div>
      \)\}""",
    re.S | re.X
)

home_replacement = """
      {/* ── Travis Image Placeholder ── */}
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
      </div>"""

home_new, home_count = home_pattern.subn(home_replacement, home_src, count=1)

if home_count != 1:
    print("HOME PATCH FAILED: expected 1 replacement, got", home_count)
    sys.exit(1)

# ---------------------------
# FIX 2: Compound detail discussion CTA
# Remove bad Inner Circle CTA in the discussion-entry area
# Force login prompt there instead
# ---------------------------

compound_pattern = re.compile(
    r"""<p className="text-xs text-slate-400 mb-3">Join Inner Circle to join the discussion\.</p>\s*
        <UpgradeButton variant="primary" className="!w-auto !px-5 !py-2\.5 !text-xs !rounded-lg !shadow-none">Join Inner Circle</UpgradeButton>""",
    re.S | re.X
)

compound_replacement = """<p className="text-xs text-slate-400 mb-3">
                  <Link to="/login" className="text-prohp-400 hover:text-prohp-300">Log in</Link> to join the conversation.
                </p>"""

compound_new, compound_count = compound_pattern.subn(compound_replacement, compound_src, count=1)

if compound_count != 1:
    print("COMPOUND PATCH FAILED: expected 1 replacement, got", compound_count)
    sys.exit(1)

# collapse accidental duplicate login line if both old+new exist back-to-back
compound_new = re.sub(
    r'''(<p className="text-xs text-slate-400 mb-3">\s*<Link to="/login" className="text-prohp-400 hover:text-prohp-300">Log in</Link> to join the conversation\.\s*</p>\s*){2,}''',
    '''<p className="text-xs text-slate-400 mb-3">
                  <Link to="/login" className="text-prohp-400 hover:text-prohp-300">Log in</Link> to join the conversation.
                </p>
''',
    compound_new,
    flags=re.S
)

home.write_text(home_new, encoding="utf-8")
compound.write_text(compound_new, encoding="utf-8")

print("PATCHED OK")
print("  Home.jsx: founding block removed, placeholder+About Travis added, consultation kept at bottom")
print("  CompoundDetail.jsx: Join Inner Circle discussion CTA replaced with Log in link")
