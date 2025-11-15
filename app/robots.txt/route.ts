import { NextResponse } from 'next/server';

export function GET() {
  const body = `User-agent: *
Allow: /

Sitemap: https://agentic-e3dd0935.vercel.app/sitemap.xml
`;
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'public, max-age=86400'
    }
  });
}
