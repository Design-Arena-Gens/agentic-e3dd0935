import { NextResponse } from 'next/server';

const baseUrl = 'https://agentic-e3dd0935.vercel.app';

export function GET() {
  const lastModified = new Date().toISOString();
  const urls = [
    {
      loc: baseUrl,
      lastmod: lastModified,
      changefreq: 'daily',
      priority: 1
    }
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `<url>
  <loc>${url.loc}</loc>
  <lastmod>${url.lastmod}</lastmod>
  <changefreq>${url.changefreq}</changefreq>
  <priority>${url.priority}</priority>
</url>`
  )
  .join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
