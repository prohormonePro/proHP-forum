#!/usr/bin/env python3
"""
STAGE_045 Frontend Surgical Patches for CompoundDetail.jsx
Anchor: E3592DC3
Run from ~/prohp-forum on srv2: python3 patch_045_frontend.py
"""
import sys, os

FILE = "frontend/src/pages/CompoundDetail.jsx"

if not os.path.exists(FILE):
    print(f"ERROR: {FILE} not found. Run from ~/prohp-forum")
    sys.exit(1)

with open(FILE, "r") as f:
    content = f.read()

# Backup
with open(FILE + ".bak_045", "w") as f:
    f.write(content)
print(f"Backup: {FILE}.bak_045")

patches_applied = 0

# === PATCH 1: Mojibake fix ===
# The corrupted string in the Modal title
MOJIBAKE = "\u00ce\u201c\u00c3\u2021\u00c3\u00b6 Breakdown"
if MOJIBAKE in content:
    content = content.replace(MOJIBAKE, "- Breakdown")
    patches_applied += 1
    print("PATCH 1: Mojibake fix applied")
else:
    # Try alternate encoding
    ALT = "\u00ce\u0093\u00c3\u0087\u00c3\u00b6 Breakdown"
    if ALT in content:
        content = content.replace(ALT, "- Breakdown")
        patches_applied += 1
        print("PATCH 1: Mojibake fix applied (alt encoding)")
    else:
        print("PATCH 1: SKIP - mojibake string not found (may already be fixed)")

# === PATCH 2: Add labelOpen state ===
LABEL_ANCHOR = "var [joinOpen, setJoinOpen] = useState(false);"
LABEL_INSERT = "var [joinOpen, setJoinOpen] = useState(false);\n  var [labelOpen, setLabelOpen] = useState(false);"
if "labelOpen" not in content:
    if LABEL_ANCHOR in content:
        content = content.replace(LABEL_ANCHOR, LABEL_INSERT)
        patches_applied += 1
        print("PATCH 2: labelOpen state added")
    else:
        print("PATCH 2: WARNING - joinOpen anchor not found")
else:
    print("PATCH 2: SKIP - labelOpen already exists")

# === PATCH 3: Product image ===
# Insert between summary and YouTube embed
IMG_ANCHOR = """        {hasRealSummary ? (
          <div className="text-sm text-slate-300 leading-relaxed mb-4">{compound.summary}</div>
        ) : null}"""

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
        content = content.replace(IMG_ANCHOR, IMG_REPLACEMENT)
        patches_applied += 1
        print("PATCH 3: Product image added")
    else:
        print("PATCH 3: WARNING - summary anchor not found")
else:
    print("PATCH 3: SKIP - product_image_url already in file")

# === PATCH 4: Article section ===
# Insert between hair_loss_explanation and lead GateCTA
ARTICLE_ANCHOR = """      {gate_state === "lead" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}"""

ARTICLE_REPLACEMENT = """      {/* Article Content Section - STAGE_045 */}
      {gate_state === "member" && compound.article_content ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Full Breakdown</div>
          <MarkdownRenderer content={compound.article_content} />
        </div>
      ) : null}

      {gate_state === "lead" && compound.article_preview ? (
        <div className="prohp-card p-6 mb-4 border border-[rgba(34,157,216,0.2)] bg-[rgba(34,157,216,0.04)]">
          <div className="text-sm font-semibold text-slate-200 mb-2">Article Preview</div>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">{compound.article_preview}</p>
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-[#229DD8]" />
            <span className="text-sm font-bold text-slate-100">Want the full breakdown?</span>
          </div>
          <p className="text-[13px] text-slate-400 mb-4">Dosing protocols, stacking logic, PCT, bloodwork markers.</p>
          <UpgradeButton variant="primary" className="!w-auto !px-5 !py-2.5 !text-xs !rounded-lg !shadow-none">
            Unlock Inner Circle
          </UpgradeButton>
        </div>
      ) : null}

      {gate_state === "lead" && <GateCTA gate_state={gate_state} upgrade_cta={upgrade_cta} />}"""

if "article_content" not in content:
    if ARTICLE_ANCHOR in content:
        content = content.replace(ARTICLE_ANCHOR, ARTICLE_REPLACEMENT)
        patches_applied += 1
        print("PATCH 4: Article section added")
    else:
        print("PATCH 4: WARNING - lead GateCTA anchor not found")
else:
    print("PATCH 4: SKIP - article_content already in file")

# === PATCH 5: Nutrition label (members only, with modal) ===
# Insert before hair_loss_explanation
LABEL_SECTION_ANCHOR = """      {compound.hair_loss_explanation ? (
        <div className="text-xs text-slate-400 italic mb-6 px-1">
          Hair loss note: {compound.hair_loss_explanation}
        </div>
      ) : null}"""

LABEL_SECTION_REPLACEMENT = """      {/* Nutrition Label - STAGE_045 */}
      {gate_state === "member" && compound.nutrition_label_url ? (
        <div className="prohp-card p-6 mb-4">
          <div className="text-sm font-semibold text-slate-200 mb-2">Supplement Facts</div>
          <img
            src={compound.nutrition_label_url}
            alt={compound.name + " supplement facts"}
            className="rounded-xl max-h-64 object-contain mx-auto cursor-pointer hover:opacity-80 transition-opacity"
            onClick={function() { setLabelOpen(true); }}
          />
          <div className="mt-2 text-[11px] text-slate-500 text-center">Click to enlarge</div>
        </div>
      ) : null}

      {compound.nutrition_label_url ? (
        <Modal open={labelOpen} title={(compound.name || "Supplement") + " - Supplement Facts"} onClose={function() { setLabelOpen(false); }}>
          <div className="flex items-center justify-center p-4">
            <img src={compound.nutrition_label_url} alt={compound.name + " supplement facts"} className="max-w-full max-h-[80vh] object-contain" />
          </div>
        </Modal>
      ) : null}

      {compound.hair_loss_explanation ? (
        <div className="text-xs text-slate-400 italic mb-6 px-1">
          Hair loss note: {compound.hair_loss_explanation}
        </div>
      ) : null}"""

if "nutrition_label_url" not in content:
    if LABEL_SECTION_ANCHOR in content:
        content = content.replace(LABEL_SECTION_ANCHOR, LABEL_SECTION_REPLACEMENT)
        patches_applied += 1
        print("PATCH 5: Nutrition label + modal added")
    else:
        print("PATCH 5: WARNING - hair_loss_explanation anchor not found")
else:
    print("PATCH 5: SKIP - nutrition_label_url already in file")

# === PATCH 6: Discount comparison ===
# Replace the bare product_url link with discount comparison
DISCOUNT_ANCHOR = """{compound.product_url ? (
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

DISCOUNT_REPLACEMENT = """{compound.product_url ? (
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
                      {"Retail $" + price.toFixed(2) + " \\u2192 "}
                      <span className="text-emerald-400 font-semibold">{"$" + pubPrice}</span>
                      {" (save $" + pubSave + ")"}
                    </div>
                  ) : null}
                  {gate_state === 'member' && memCode ? (
                    <div className="text-xs bg-[rgba(34,157,216,0.06)] border border-[rgba(34,157,216,0.15)] rounded-lg p-3">
                      <div className="text-slate-300 font-semibold mb-1">{"Your Inner Circle code " + memCode + " saves 20%"}</div>
                      <div className="text-slate-400">
                        {"Retail $" + price.toFixed(2) + " \\u2192 "}
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

if "member_discount_code" not in content:
    if DISCOUNT_ANCHOR in content:
        content = content.replace(DISCOUNT_ANCHOR, DISCOUNT_REPLACEMENT)
        patches_applied += 1
        print("PATCH 6: Discount comparison added")
    else:
        print("PATCH 6: WARNING - product_url anchor not found. Check whitespace.")
else:
    print("PATCH 6: SKIP - member_discount_code already in file")

# Write final file
with open(FILE, "w") as f:
    f.write(content)

print(f"\n=== {patches_applied} patches applied to {FILE} ===")
print("\nVerification:")
print(f"  labelOpen state: {'YES' if 'labelOpen' in content else 'NO'}")
print(f"  product_image_url: {'YES' if 'product_image_url' in content else 'NO'}")
print(f"  article_content: {'YES' if 'article_content' in content else 'NO'}")
print(f"  article_preview: {'YES' if 'article_preview' in content else 'NO'}")
print(f"  nutrition_label_url: {'YES' if 'nutrition_label_url' in content else 'NO'}")
print(f"  member_discount_code: {'YES' if 'member_discount_code' in content else 'NO'}")
print(f"  mojibake present: {'YES - PROBLEM' if any(c in content for c in ['\u00ce\u201c', '\u00c3\u2021', '\u00c3\u00b6']) else 'NO - CLEAN'}")
print(f"\nNext: cd frontend && npm run build")
