import React from 'react';

var URL_RE = /(https?:\/\/[^\s<)\]]+)/g;

export function Linkify({ text }) {
  if (!text) return null;
  var parts = String(text).split(URL_RE);
  return React.createElement(React.Fragment, null,
    parts.map(function(part, i) {
      URL_RE.lastIndex = 0;
      if (URL_RE.test(part)) {
        URL_RE.lastIndex = 0;
        return React.createElement('a', {
          key: i,
          href: part,
          target: '_blank',
          rel: 'noopener noreferrer',
          style: { color: '#229DD8', textDecoration: 'underline' }
        }, part);
      }
      return React.createElement(React.Fragment, { key: i }, part);
    })
  );
}
