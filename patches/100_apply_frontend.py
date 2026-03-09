"""STAGE 100 frontend patcher — applies video hardening + URL linkify."""
import re

# === PATCH 1: EncyclopediaGate.jsx video hardening ===
gate = open('/home/travisd/prohp-forum/frontend/src/components/EncyclopediaGate.jsx', 'r').read()

# Backup
open('/home/travisd/prohp-forum/frontend/src/components/EncyclopediaGate.jsx.bak.100', 'w').write(gate)

# Add onStalled after onError line
old_error = 'onError={() => { setVideoFailed(true); setVideoReady(false); }}'
new_error = old_error + '\n          onStalled={() => setTimeout(() => { if (!videoReady) { setVideoFailed(true); } }, 8000)}'
gate = gate.replace(old_error, new_error, 1)

# Add fallback div after the video closing tag block
old_video_close = '        </video>\n      )}'
new_video_close = old_video_close + '''
      {/* STAGE_100: Fallback when video fails on desktop */}
      {videoFailed && isDesktop && (
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(30,30,40,1) 0%, rgba(10,10,15,1) 70%)',
        }} />
      )}'''
gate = gate.replace(old_video_close, new_video_close, 1)

open('/home/travisd/prohp-forum/frontend/src/components/EncyclopediaGate.jsx', 'w').write(gate)
print("PATCH 1 OK: EncyclopediaGate.jsx video hardening")

# === PATCH 2: MarkdownRenderer.jsx URL linkify ===
md = open('/home/travisd/prohp-forum/frontend/src/components/MarkdownRenderer.jsx', 'r').read()

# Backup
open('/home/travisd/prohp-forum/frontend/src/components/MarkdownRenderer.jsx.bak.100', 'w').write(md)

old_memo = "return autoLinkSparse(content, maxAutoLinks);"
new_memo = """var linked = autoLinkSparse(content, maxAutoLinks);
    // STAGE_100: linkify bare URLs not already in markdown link syntax
    linked = linked.replace(
      /(?<!\\]\\()(?<!\\[)(https?:\\/\\/[^\\s<)\\]]+)/g,
      '[$1]($1)'
    );
    return linked;"""
md = md.replace(old_memo, new_memo, 1)

open('/home/travisd/prohp-forum/frontend/src/components/MarkdownRenderer.jsx', 'w').write(md)
print("PATCH 2 OK: MarkdownRenderer.jsx URL linkify")
