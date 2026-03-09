#!/usr/bin/env python3
"""
STAGE_045 v2 — Remaining 3 frontend patches
Anchor: E3592DC3
Patches 3, 5, 6 failed in v1 due to whitespace mismatch.
Anchors taken from exact srv2 output (sed -n lines).

Run from ~/prohp-forum on srv2: python3 patch_045_v2.py
"""
import sys, os

FILE = "frontend/src/pages/CompoundDetail.jsx"

if not os.path.exists(FILE):
    print(f"ERROR: {FILE} not found. Run from ~/prohp-forum")
    sys.exit(1)

with open(FILE, "r", encoding="utf-8") as f:
    content = f.read()

patches_applied = 0

# ═══════════════════════════════════════════════
# PATCH 3: Product image (between summary and YouTube embed)
# Exact anchor from srv2 sed -n '343,345p'
# 8-space indent (inside header prohp-card)
# ═══════════════════════════════════════════════
IMG_ANCHOR = "        {hasRealSummary ? (\n          <div className=\"text-sm text-slate-300 leading-relaxed mb-4\">{compound.summary}</div>\n        ) : null}"

IMG_REPLACEMENT = """        {hasRealSummary ? (
          <div className="text-sm text-slate-300 leading-relaxed mb-4">{compound.summary}</div>
        ) : null}

        {compound.product_image_url ? (
          <div className="mb-4">
            <img src={compound.product_image_url} alt={compound.name} className="rounded-xl max-h-48 object-contain mx-auto" />
          </div>
        ) : null}"""

if "product_image_url" not in content:
    if IMG_ANCHOR in content:
        content = content.replace(IMG_ANCHOR, IMG_REPLACEMENT, 1)
        patches_applied += 1
        print("PATCH 3: Product image - APPLIED")
    else:
        print("PATCH 3: WARNING - anchor not found. Dumping context...")
        # Find hasRealSummary and show surrounding chars
        idx = content.find("hasRealSummary ?")
        if idx >= 0:
            print(f"  Found 'hasRealSummary ?' at position {idx}")
            print(f"  Context: {repr(content[idx-20:idx+200])}")
        else:
            print("  'hasRealSummary' not found in file at all")
else:
    print("PATCH 3: SKIP - product_image_url already in file")

# ═══════════════════════════════════════════════
# PATCH 5: Nutrition label (before hair_loss_explanation)
# Exact anchor from srv2 sed -n '412,416p'
# 6-space indent (outer section level)
# ═══════════════════════════════════════════════
NUTRITION_ANCHOR = """      {compound.hair_loss_explanation ? (
        <div className="text-xs text-slate-400 italic mb-6 px-1">
          Hair loss note: {compound.hair_loss_explanation}
        </div>
      ) : null}"""

NUTRITION_REPLACEMENT = """      {/* Nutrition Label - STAGE_045 */}
      {gate_state === "member" && compound.nutrition_label_url ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Supplement Facts</div>
          <img
            src={compound.nutrition_label_url}
            alt={(compound.name || "Supplement") + " supplement facts"}
            className="rounded-xl max-h-64 object-contain mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={function() { setLabelOpen(true); }}
          />
          <div className="mt-2 text-[11px] text-slate-500 text-center">Click to enlarge</div>
        </div>
      ) : null}

      {gate_state === "member" && compound.nutrition_label_url ? (
        <Modal open={labelOpen} title={(compound.name || "Supplement") + " - Supplement Facts"} onClose={function() { setLabelOpen(false); }}>
          <div className="flex items-center justify-center p-4">
            <img src={compound.nutrition_label_url} alt={(compound.name || "Supplement") + " supplement facts"} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </Modal>
      ) : null}

      {compound.hair_loss_explanation ? (
        <div className="text-xs text-slate-400 italic mb-6 px-1">
          Hair loss note: {compound.hair_loss_explanation}
        </div>
      ) : null}"""

if "nutrition_label_url" not in content:
    if NUTRITION_ANCHOR in content:
        content = content.replace(NUTRITION_ANCHOR, NUTRITION_REPLACEMENT, 1)
        patches_applied += 1
        print("PATCH 5: Nutrition label + modal - APPLIED")
    else:
        print("PATCH 5: WARNING - anchor not found. Dumping context...")
        idx = content.find("hair_loss_explanation")
        if idx >= 0:
            print(f"  Found 'hair_loss_explanation' at position {idx}")
            print(f"  Context: {repr(content[idx-40:idx+200])}")
        else:
            print("  'hair_loss_explanation' not found in file at all")
else:
    print("PATCH 5: SKIP - nutrition_label_url already in file")

# ═══════════════════════════════════════════════
# PATCH 6: Discount comparison (replace bare product_url link)
# Exact anchor from srv2 sed -n '358,371p'
# 8-space indent (inside header prohp-card)
# ═══════════════════════════════════════════════
DISCOUNT_ANCHOR = """        {compound.product_url ? (
          <div className="mt-3 pt-3 border-t border-white/5">
            <a
              href={compound.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-prohp-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Get it here to support the encyclopedia. Appreciate you, brother.
            </a>
          </div>
        ) : null}"""

DISCOUNT_REPLACEMENT = """        {compound.product_url ? (
          <div className="mt-3 pt-3 border-t border-white/5">
            <a
              href={compound.product_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-prohp-400 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Get it here to support the encyclopedia. Appreciate you, brother.
            </a>
            {compound.product_price && Number(compound.product_price) > 0 ? (function() {
              var price = parseFloat(compound.product_price);
              var pubCode = compound.public_discount_code;
              var memCode = compound.member_discount_code;
              var now = new Date();
              var mm = String(now.getUTCMonth() + 1).padStart(2, '0');
              var yy = String(now.getUTCFullYear()).slice(-2);
              var activeMemCode = 'PROHP' + mm + yy;
              var pubPrice = (price * 0.9).toFixed(2);
              var pubSave = (price * 0.1).toFixed(2);
              var memPrice = (price * 0.8).toFixed(2);
              var memSave = (price * 0.2).toFixed(2);
              var extraSave = (price * 0.1).toFixed(2);
              return (
                <div className="mt-3 space-y-2">
                  {pubCode ? (
                    <div className="text-xs text-slate-400">
                      <span className="text-slate-300 font-semibold">{"Use code " + pubCode}</span>{" for 10% off. "}
                      {"Retail $" + price.toFixed(2)}{" \u2192 "}
                      <span className="text-emerald-400 font-semibold">{"$" + pubPrice}</span>
                      {" (save $" + pubSave + ")"}
                    </div>
                  ) : null}
                  {gate_state === "member" ? (
                    <div className="text-xs bg-[rgba(34,157,216,0.06)] border border-[rgba(34,157,216,0.15)] rounded-lg p-3">
                      <div className="text-slate-300 font-semibold mb-1">{"Your Inner Circle code " + activeMemCode + " saves 20%"}</div>
                      <div className="text-slate-400">
                        {"Retail $" + price.toFixed(2)}{" \u2192 "}
                        <span className="text-[#229DD8] font-semibold">{"$" + memPrice}</span>
                        {" (save $" + memSave + ")"}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        {"That is $" + extraSave + " more per bottle than the public code. Your membership pays for itself."}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })() : null}
          </div>
        ) : null}"""

if "member_discount_code" not in content and "activeMemCode" not in content:
    if DISCOUNT_ANCHOR in content:
        content = content.replace(DISCOUNT_ANCHOR, DISCOUNT_REPLACEMENT, 1)
        patches_applied += 1
        print("PATCH 6: Discount comparison (UTC rotating codes) - APPLIED")
    else:
        print("PATCH 6: WARNING - anchor not found. Dumping context...")
        idx = content.find("product_url ?")
        if idx >= 0:
            print(f"  Found 'product_url ?' at position {idx}")
            print(f"  Context: {repr(content[idx-20:idx+300])}")
        else:
            print("  'product_url' not found in file")
else:
    print("PATCH 6: SKIP - discount code already in file")

# ═══════════════════════════════════════════════
# WRITE
# ═══════════════════════════════════════════════
with open(FILE, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\n=== {patches_applied} patches applied ===")
print("\nVerification:")
checks = {
    "product_image_url": "product_image_url" in content,
    "nutrition_label_url": "nutrition_label_url" in content,
    "member_discount_code or activeMemCode": "member_discount_code" in content or "activeMemCode" in content,
    "labelOpen": "labelOpen" in content,
    "article_content": "article_content" in content,
}
for k, v in checks.items():
    print(f"  {k}: {'YES' if v else 'NO'}")

print(f"\nNext: cd frontend && npm run build")
