const escapeCell = (value) => {
  if (value === null || value === undefined) return '""';
  const text = Array.isArray(value) ? value.join('; ') : String(value);
  return `"${text.replace(/"/g, '""')}"`;
};

/** Build a CSV string from an array of flat objects (keys of the first row become headers). */
export const toCsv = (rows, headers) => {
  if (!rows?.length) return '';
  const cols = headers ?? Object.keys(rows[0]);
  const lines = [cols.map(escapeCell).join(',')];
  rows.forEach((row) => lines.push(cols.map((c) => escapeCell(row[c])).join(',')));
  return lines.join('\r\n');
};

/** Trigger a browser download of rows as CSV. Adds a BOM so Excel reads UTF-8. */
export const downloadCsv = (rows, filename, headers) => {
  const csv = toCsv(rows, headers);
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const fileSafe = (text) =>
  String(text ?? 'export').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');
