import sys
from pathlib import Path

f = Path("/home/travisd/prohp-forum/frontend/src/pages/CompoundDetail.jsx")
src = f.read_text(encoding="utf-8")

old = '''              ) : gate_state === "lead" ? (
              <div className="border-t border-white/[0.04] pt-4 text-center">
              </div>'''

new = '''              ) : gate_state === "lead" ? (
              <div className="border-t border-white/[0.04] pt-4 text-center">
                <p className="text-xs text-slate-400">
                  <a href="/login" className="text-prohp-400 hover:text-prohp-300">Log in</a> to join the conversation.
                </p>
              </div>'''

if old in src:
    src = src.replace(old, new, 1)
    f.write_text(src, encoding="utf-8")
    print("PATCHED: lead branch now shows Log in prompt")
else:
    print("ERROR: anchor not found")
    sys.exit(1)
