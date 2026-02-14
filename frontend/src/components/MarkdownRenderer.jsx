import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

const AUTO_LINK = [
  { slug: 'lgd-4033', patterns: [/(\bLGD[- ]?4033\b)/gi, /(\bLigandrol\b)/gi] },
  { slug: 'rad-140',  patterns: [/(\bRAD[- ]?140\b)/gi, /(\bTestolone\b)/gi] },
  { slug: 'mk-677',   patterns: [/(\bMK[- ]?677\b)/gi, /(\bIbutamoren\b)/gi] },
  { slug: 'enclomiphene', patterns: [/(\bEnclomiphene\b)/gi] },
  { slug: 'bpc-157',  patterns: [/(\bBPC[- ]?157\b)/gi] },
  { slug: 'ostarine',  patterns: [/(\bOstarine\b)/gi, /(\bMK[- ]?2866\b)/gi] },
  { slug: 's23',       patterns: [/(\bS[- ]?23\b)/gi] },
  { slug: 'tb-500',    patterns: [/(\bTB[- ]?500\b)/gi] },
];

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function autoLinkMarkdown(md) {
  if (!md) return md;
  const chunks = md.split(/(```[\s\S]*?```)/g);
  return chunks.map((chunk) => {
    if (chunk.startsWith('```')) return chunk;
    let out = chunk;
    for (const item of AUTO_LINK) {
      const href = '/compounds/' + item.slug;
      for (const rx of item.patterns) {
        out = out.replace(rx, (match) => {
          const linkCheck = new RegExp('\\[[^\\]]*' + escapeRegExp(match) + '[^\\]]*\\]\\([^)]*\\)', 'i');
          if (linkCheck.test(out)) return match;
          return '[' + match + '](' + href + ')';
        });
      }
    }
    return out;
  }).join('');
}

export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null;
  const processed = autoLinkMarkdown(content);
  return (
    <div className={('markdown-body ' + className).trim()}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {processed}
      </ReactMarkdown>
    </div>
  );
}
