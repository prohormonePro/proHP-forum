import React, { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useNavigate } from 'react-router-dom';

var AUTO_LINK = [
  { slug: 'rad-140', patterns: [/RAD[\s-]?140\b/gi, /\bTestolone\b/gi] },
  { slug: 'lgd-4033', patterns: [/LGD[\s-]?4033\b/gi, /\bLigandrol\b/gi] },
  { slug: 'mk-677', patterns: [/MK[\s-]?677\b/gi, /\bIbutamoren\b/gi] },
  { slug: 'ostarine', patterns: [/\bOstarine\b/gi, /\bMK[\s-]?2866\b/gi] },
  { slug: 's23', patterns: [/\bS23\b/gi] },
  { slug: 'enclomiphene', patterns: [/\bEnclomiphene\b/gi] },
  { slug: 'bpc-157', patterns: [/BPC[\s-]?157\b/gi] },
  { slug: 'tb-500', patterns: [/\bTB[\s-]?500\b/gi] },
];

function splitProtectedSegments(src) {
  var pattern = /```[\s\S]*?```|`[^`]*`|\[[^\]]+\]\([^)]+\)/g;
  var out = [];
  var last = 0;
  var m;
  while ((m = pattern.exec(src)) !== null) {
    if (m.index > last) out.push({ type: 'text', value: src.slice(last, m.index) });
    out.push({ type: 'protected', value: m[0] });
    last = m.index + m[0].length;
  }
  if (last < src.length) out.push({ type: 'text', value: src.slice(last) });
  return out;
}

function autoLinkSparse(markdown, maxLinks) {
  if (!markdown || maxLinks <= 0) return markdown;
  var segments = splitProtectedSegments(markdown);
  var used = new Set();
  var linkCount = 0;

  var linked = segments.map(function(seg) {
    if (seg.type !== 'text') return seg.value;
    if (linkCount >= maxLinks) return seg.value;
    var s = seg.value;

    for (var i = 0; i < AUTO_LINK.length; i++) {
      if (linkCount >= maxLinks) break;
      var item = AUTO_LINK[i];
      if (used.has(item.slug)) continue;
      var replaced = false;

      for (var j = 0; j < item.patterns.length; j++) {
        if (linkCount >= maxLinks || replaced) break;
        var re = item.patterns[j];
        s = s.replace(re, function(match) {
          if (replaced || linkCount >= maxLinks) return match;
          replaced = true;
          used.add(item.slug);
          linkCount += 1;
          return '[' + match + '](/compounds/' + item.slug + ')';
        });
      }
    }
    return s;
  });

  return linked.join('');
}

function safeHref(href) {
  if (!href) return null;
  var h = String(href).trim();
  if (h.startsWith('/')) return h;
  if (/^https?:\/\//i.test(h)) return h;
  if (/^mailto:/i.test(h)) return h;
  return null;
}

function extractHref(props) {
  return props.href || props.url || (props.node && props.node.properties && props.node.properties.href) || null;
}

export default function MarkdownRenderer({ content = '', className = '', maxAutoLinks = 3 }) {
  var navigate = useNavigate();

  var processed = useMemo(function() {
    if (!content) return '';
    return autoLinkSparse(content, maxAutoLinks);
  }, [content, maxAutoLinks]);

  if (!processed) return null;

  return (
    <div className={('markdown-body ' + className).trim()}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}
        components={{
          a: function(props) {
            var raw = extractHref(props);
            var clean = safeHref(raw);
            if (!clean) return React.createElement('span', null, props.children);
            var isInternal = clean.startsWith('/');
            return React.createElement('a', {
              href: clean,
              className: 'markdown-link',
              onClick: function(e) {
                if (isInternal) {
                  e.preventDefault();
                  navigate(clean);
                }
              },
              target: isInternal ? undefined : '_blank',
              rel: isInternal ? undefined : 'noreferrer noopener',
            }, props.children);
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
