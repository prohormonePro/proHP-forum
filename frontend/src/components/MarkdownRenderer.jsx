cat > ~/prohp-forum/frontend/src/components/MarkdownRenderer.jsx << 'EOF'
import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';

const AUTO_LINK = [
  { slug: 'rad-140', patterns: [/RAD[\s-]?140\b/gi, /\bTestolone\b/gi] },
  { slug: 'lgd-4033', patterns: [/LGD[\s-]?4033\b/gi, /\bLigandrol\b/gi] },
  { slug: 'mk-677', patterns: [/MK[\s-]?677\b/gi, /\bIbutamoren\b/gi] },
  { slug: 'ostarine', patterns: [/\bOstarine\b/gi, /\bMK[\s-]?2866\b/gi] },
  { slug: 's23', patterns: [/\bS23\b/gi] },
  { slug: 'enclomiphene', patterns: [/\bEnclomiphene\b/gi] },
  { slug: 'bpc-157', patterns: [/BPC[\s-]?157\b/gi] },
  { slug: 'tb-500', patterns: [/\bTB[\s-]?500\b/gi] },
];

// Protect code blocks, inline code, and existing markdown links
function splitProtectedSegments(src) {
  const pattern = /```[\s\S]*?```|`[^`]*`|\[[^\]]+\]\([^)]+\)/g;
  const out = [];
  let last = 0;
  let m;
  while ((m = pattern.exec(src)) !== null) {
    if (m.index > last) out.push({ type: 'text', value: src.slice(last, m.index) });
    out.push({ type: 'protected', value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: 'text', value: src.slice(last) });
  return out;
}

// Sparse: max N links total, first mention per compound only
function autoLinkSparse(markdown, maxLinks) {
  if (!markdown || maxLinks <= 0) return markdown;

  const segments = splitProtectedSegments(markdown);
  const used = new Set();
  let linkCount = 0;

  const linked = segments.map((seg) => {
    if (seg.type !== 'text') return seg.value;
    if (linkCount >= maxLinks) return seg.value;

    let s = seg.value;

    for (let i = 0; i < AUTO_LINK.length; i++) {
      if (linkCount >= maxLinks) break;
      const item = AUTO_LINK[i];
      if (used.has(item.slug)) continue;

      let replaced = false;

      for (let j = 0; j < item.patterns.length; j++) {
        if (linkCount >= maxLinks || replaced) break;
        const re = item.patterns[j];

        s = s.replace(re, (match) => {
          if (replaced || linkCount >= maxLinks) return match;
          replaced = true;
          used.add(item.slug);
          linkCount += 1;
          return `[${match}](/compounds/${item.slug})`;
        });
      }
    }

    return s;
  });

  return linked.join('');
}

// Hard safety gate for href
function safeHref(href) {
  if (!href) return null;

  const h = String(href).trim();

  // Allow internal paths
  if (h.startsWith('/')) return h;

  // Allow http(s), mailto, tel only
  if (/^https?:\/\//i.test(h)) return h;
  if (/^mailto:/i.test(h)) return h;
  if (/^tel:/i.test(h)) return h;

  // Block everything else (javascript:, data:, vbscript:, etc.)
  return null;
}

export default function MarkdownRenderer({ content = '', className = '', maxAutoLinks = 3 }) {
  const processed = useMemo(() => {
    if (!content) return '';
    return autoLinkSparse(content, maxAutoLinks);
  }, [content, maxAutoLinks]);

  if (!processed) return null;

  return (
    <div className={('markdown-body ' + className).trim()}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => {
            const clean = safeHref(href);

            // If blocked, render as plain text (no click)
            if (!clean) return <span>{children}</span>;

            // Internal SPA navigation
            if (clean.startsWith('/compounds/')) {
              return (
                <Link to={clean} className="markdown-link">
                  {children}
                </Link>
              );
            }

            // External link
            return (
              <a href={clean} target="_blank" rel="noreferrer noopener" className="markdown-link">
                {children}
              </a>
            );
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
EOF
