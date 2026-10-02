import React, { useMemo } from 'react';

/*
  Vacancy descriptions are plain text in the API, but may be authored with
  a rich-text editor. HTML is parsed into an inert document and rebuilt as
  React elements from a small allow-list — nothing is injected as raw HTML.
*/
const ALLOWED = new Set([
  'p', 'br', 'ul', 'ol', 'li', 'strong', 'b', 'em', 'i', 'u', 'h2', 'h3', 'h4', 'blockquote', 'a', 'span',
]);
const HEADING_DOWNGRADE = { h1: 'h3', h2: 'h3', h3: 'h4', h4: 'h4', h5: 'h4', h6: 'h4' };

const looksLikeHtml = (s) => /<\/?[a-z][\s\S]*?>/i.test(s);

function toReact(node, key) {
  if (node.nodeType === 3) return node.textContent;
  if (node.nodeType !== 1) return null;
  const raw = node.tagName.toLowerCase();
  const children = Array.from(node.childNodes).map((c, i) => toReact(c, i));
  const tag = HEADING_DOWNGRADE[raw] ?? raw;
  if (!ALLOWED.has(tag)) return <React.Fragment key={key}>{children}</React.Fragment>;
  if (tag === 'br') return <br key={key} />;
  if (tag === 'a') {
    const href = node.getAttribute('href') ?? '';
    if (!/^(https?:|mailto:)/i.test(href)) return <React.Fragment key={key}>{children}</React.Fragment>;
    return (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return React.createElement(tag, { key }, children);
}

function RichText({ text, className = '' }) {
  const content = useMemo(() => {
    const value = String(text ?? '').trim();
    if (!value) return null;
    if (!looksLikeHtml(value) || typeof DOMParser === 'undefined') return value;
    const doc = new DOMParser().parseFromString(value, 'text/html');
    return Array.from(doc.body.childNodes).map((n, i) => toReact(n, i));
  }, [text]);

  if (!content) return null;
  const plain = typeof content === 'string';
  return <div className={`pub-richtext${plain ? ' plain' : ''} ${className}`}>{content}</div>;
}

export default RichText;
