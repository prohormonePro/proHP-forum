#!/usr/bin/env python3
"""
SOVEREIGN_L5 RECOVERY PATCH — 2026-03-13
Fixes:
  1. Home.jsx: Remove Founding Member block, add Travis placeholder + About Travis
  2. CompoundDetail.jsx: Replace "Join Inner Circle to join the discussion" with login link
"""
import sys
from pathlib import Path

home = Path("/home/travisd/prohp-forum/frontend/src/pages/Home.jsx")
compound = Path("/home/travisd/prohp-forum/frontend/src/pages/CompoundDetail.jsx")

# ── Read both files ──
home_src = home.read_text(encoding="utf-8")
compound_src = compound.read_text(encoding="utf-8")
errors = []

# ══════════════════════════════════════════════
# FIX 1: Home.jsx — Remove Founding Member block
# ══════════════════════════════════════════════

# Find the exact founding member block using a unique anchor string
founding_start_marker = '{/* \u2500\u2500 Founding Member Banner \u2500\u2500 */}'
if founding_start_marker not in home_src:
    # Try ASCII fallback
    founding_start_marker = '{/* -- Founding Member Banner -- */}'

if founding_start_marker not in home_src:
    # Try searching for the actual content
    if 'Founding Member' in home_src and 'Claim Your Spot' in home_src:
        # Find the block by content markers
        lines = home_src.split('\n')
        block_start = None
        block_end = None
        for i, line in enumerate(lines):
            if 'Founding Member Banner' in line or (block_start is None and '{!user && (' in line and i > 0 and 'Founding' in home_src[home_src.index(lines[max(0,i-3)]):home_src.index(lines[min(len(lines)-1,i+15)])]):
                # Look backwards for the comment
                for j in range(i, max(0, i-5), -1):
                    if 'Founding Member' in lines[j] and '{/*' in lines[j]:
                        block_start = j
                        break
                if block_start is None:
                    block_start = i
            if block_start is not None and block_end is None:
                if 'Claim Your Spot' in line:
                    # Find closing tags after this
                    for k in range(i+1, min(len(lines), i+10)):
                        if ')}'  in lines[k]:
                            block_end = k
                            break
                    if block_end is None:
                        block_end = i + 3
                    break

        if block_start is not None and block_end is not None:
            founding_block = '\n'.join(lines[block_start:block_end+1])
            print(f"FOUND founding block at lines {block_start+1}-{block_end+1}")
            print(f"  Content preview: {founding_block[:120]}...")
        else:
            errors.append("HOME: Could not locate Founding Member block boundaries")
            founding_block = None
    else:
        errors.append("HOME: No 'Founding Member' content found in Home.jsx at all")
        founding_block = None
else:
    # Found the comment marker — extract from comment through closing )}
    start_idx = home_src.index(founding_start_marker)
    # Find the line with the start marker
    lines = home_src.split('\n')
    cumulative = 0
    block_start = 0
    for i, line in enumerate(lines):
        if cumulative <= start_idx < cumulative + len(line) + 1:
            block_start = i
            break
        cumulative += len(line) + 1

    # Find closing )} after "Claim Your Spot"
    block_end = None
    for k in range(block_start, min(len(lines), block_start + 25)):
        stripped = lines[k].strip()
        if stripped == ')}' and k > block_start + 3:
            block_end = k
            break
    
    if block_end:
        founding_block = '\n'.join(lines[block_start:block_end+1])
        print(f"FOUND founding block via marker at lines {block_start+1}-{block_end+1}")
    else:
        errors.append("HOME: Found marker but couldn't find closing )}")
        founding_block = None

# Now do the actual replacement
if founding_block and not errors:
    # Travis image placeholder + About Travis blocks to insert BEFORE Consultation CTA
    travis_blocks = '''
      {/* \u2500\u2500 Travis Image Placeholder \u2500\u2500 */}
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
'''

    # Step A: Remove the founding member block entirely
    home_new = home_src.replace(founding_block, '')
    if home_new == home_src:
        errors.append("HOME: founding_block replace had no effect")
    else:
        # Step B: Insert Travis blocks before the Consultation CTA
        consultation_marker = '{/* \u2500\u2500 Consultation CTA \u2500\u2500 */}'
        if consultation_marker not in home_new:
            # Try ASCII
            consultation_marker = '{/* -- Consultation CTA -- */}'
        
        if consultation_marker in home_new:
            # Find the line with the consultation marker
            lines_new = home_new.split('\n')
            for i, line in enumerate(lines_new):
                if 'Consultation CTA' in line:
                    # Get the indentation
                    indent = len(line) - len(line.lstrip())
                    # Insert travis blocks before this line
                    lines_new.insert(i, travis_blocks)
                    home_new = '\n'.join(lines_new)
                    break
            else:
                errors.append("HOME: Could not find Consultation CTA line for insertion")
        else:
            errors.append("HOME: No Consultation CTA marker found")
        
        if not errors:
            home.write_text(home_new, encoding="utf-8")
            print("HOME.JSX PATCHED OK")
            print("  - Founding Member block removed")
            print("  - Travis image placeholder added")
            print("  - About Travis added")
            print("  - Consultation CTA remains at bottom")

# ══════════════════════════════════════════════
# FIX 2: CompoundDetail.jsx — Login prompt
# ══════════════════════════════════════════════

# The bad block is at lines 677-678:
#   <p ...>Join Inner Circle to join the discussion.</p>
#   <UpgradeButton ...>Join Inner Circle</UpgradeButton>
# 
# Line 683 already has the correct version:
#   <Link to="/login" ...>Log in</Link> to join the conversation.
#
# So the fix is: remove lines 677-678

bad_line_1 = '<p className="text-xs text-slate-400 mb-3">Join Inner Circle to join the discussion.</p>'
bad_line_2 = 'Join Inner Circle</UpgradeButton>'

if bad_line_1 in compound_src and bad_line_2 in compound_src:
    lines = compound_src.split('\n')
    new_lines = []
    skip_next = False
    removed = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if bad_line_1 in line:
            print(f"  Removing line {i+1}: {stripped[:80]}...")
            skip_next = True  # also skip the UpgradeButton line right after
            removed += 1
            continue
        if skip_next and bad_line_2 in line:
            print(f"  Removing line {i+1}: {stripped[:80]}...")
            skip_next = False
            removed += 1
            continue
        skip_next = False
        new_lines.append(line)
    
    if removed == 2:
        compound_new = '\n'.join(new_lines)
        compound.write_text(compound_new, encoding="utf-8")
        print("COMPOUNDDETAIL.JSX PATCHED OK")
        print("  - 'Join Inner Circle to join the discussion' block removed")
        print("  - 'Log in to join the conversation' at line 683 is now the active CTA")
    else:
        errors.append(f"COMPOUND: Expected to remove 2 lines, removed {removed}")
elif bad_line_1 not in compound_src:
    # Check if it's already correct
    if 'Join Inner Circle to join the discussion' not in compound_src:
        print("COMPOUNDDETAIL.JSX: Already correct (no bad CTA found)")
    else:
        errors.append("COMPOUND: Found text but not exact match. Manual check needed.")
else:
    errors.append("COMPOUND: Could not find bad UpgradeButton line")

# ── Report ──
if errors:
    print("\n=== ERRORS ===")
    for e in errors:
        print(f"  {e}")
    sys.exit(1)
else:
    print("\nALL PATCHES APPLIED SUCCESSFULLY")
    print("Next: cd /home/travisd/prohp-forum/frontend && npm run build")
    sys.exit(0)
