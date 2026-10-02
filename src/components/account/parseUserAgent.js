/** Rough browser / OS / device description from a user-agent string. */
export const parseUserAgent = (ua = '') => {
  const s = String(ua || '');

  let browser = 'Unknown browser';
  if (/PostmanRuntime/i.test(s)) browser = 'Postman';
  else if (/^curl\//i.test(s)) browser = 'curl';
  else if (/Edg(e|A|iOS)?\//.test(s)) browser = 'Edge';
  else if (/OPR\/|Opera/.test(s)) browser = 'Opera';
  else if (/SamsungBrowser/.test(s)) browser = 'Samsung Internet';
  else if (/Firefox|FxiOS/.test(s)) browser = 'Firefox';
  else if (/Chrome|CriOS|Chromium/.test(s)) browser = 'Chrome';
  else if (/Safari/.test(s)) browser = 'Safari';
  else if (s) browser = s.split(/[/\s]/)[0] || browser;

  let os = '';
  if (/Windows NT/.test(s)) os = 'Windows';
  else if (/iPhone|iPad|iPod/.test(s)) os = 'iOS';
  else if (/Android/.test(s)) os = 'Android';
  else if (/CrOS/.test(s)) os = 'ChromeOS';
  else if (/Mac OS X|Macintosh/.test(s)) os = 'macOS';
  else if (/Linux/.test(s)) os = 'Linux';

  const mobile = /Mobile|Android|iPhone|iPod/.test(s) && !/iPad/.test(s);
  const tablet = /iPad|Tablet/.test(s);

  return {
    browser,
    os,
    device: mobile ? 'mobile' : tablet ? 'tablet' : 'desktop',
    label: os ? `${browser} on ${os}` : browser,
  };
};
