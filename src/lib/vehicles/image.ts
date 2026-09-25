export function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(
    /\/+$/,
    ''
  );
}

export function siteImageUrl(url: string): string {
  if (!url) return '';
  if (/^https?:\/\//.test(url)) return url;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('/')) return `${getSiteOrigin()}${url}`;
  return url;
}