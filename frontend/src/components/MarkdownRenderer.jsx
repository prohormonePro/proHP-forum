import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

export default function MarkdownRenderer({ content = '', className = '' }) {
  if (!content) return null;
  return (
    <div className={`markdown-body ${className}`.trim()}>
      <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
