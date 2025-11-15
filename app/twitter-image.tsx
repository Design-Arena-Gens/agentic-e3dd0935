import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, rgba(11,14,44,0.92), rgba(103,90,254,0.9))',
          color: '#fff',
          padding: '68px',
          fontFamily: '"Space Grotesk", "Inter", sans-serif'
        }}
      >
        <div style={{ textTransform: 'uppercase', letterSpacing: '0.4em', fontSize: 32, opacity: 0.75 }}>
          AI Story Board Generator
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h1 style={{ fontSize: 84, margin: 0, lineHeight: 1.05 }}>
            Video-ready boards from plain text narratives.
          </h1>
          <p style={{ fontSize: 28, maxWidth: 780, opacity: 0.7, lineHeight: 1.35 }}>
            Upload your narrative, tune duration &amp; pacing, preview scenes with AI narration and rich visuals instantly.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 30, fontWeight: 600 }}>agentic-e3dd0935.vercel.app</span>
          <span style={{ fontSize: 24, textTransform: 'uppercase', letterSpacing: '0.4em', opacity: 0.65 }}>
            Story · Scenes · Voice
          </span>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
