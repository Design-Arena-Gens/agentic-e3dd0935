import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 1200,
  height: 630
};
export const contentType = 'image/png';

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'radial-gradient(circle at 20% 20%, rgba(103, 90, 254, 0.85), rgba(2, 4, 32, 0.9))',
          color: '#fff',
          padding: '72px',
          fontFamily: '"Space Grotesk", "Inter", sans-serif'
        }}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.35em', fontSize: 18, opacity: 0.65 }}>
          <span style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✦
          </span>
          AI Story Board Generator
        </div>
        <div>
          <h1 style={{ fontSize: 78, fontWeight: 700, margin: 0, lineHeight: 1.05 }}>
            Transform stories into cinematic storyboards &amp; AI motion previews.
          </h1>
          <p style={{ marginTop: 32, fontSize: 28, maxWidth: 760, opacity: 0.75, lineHeight: 1.35 }}>
            Generate scene breakdowns, automated voiceovers, and immersive previews designed for filmmakers, marketers, and creators.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontSize: 24, letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.65 }}>
              Powered by AI
            </span>
            <span style={{ fontSize: 30, fontWeight: 600 }}>agentic-e3dd0935.vercel.app</span>
          </div>
          <div
            style={{
              display: 'flex',
              gap: '16px',
              fontSize: 22,
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              opacity: 0.55
            }}
          >
            <span>Storyboard</span>
            <span>Voiceover</span>
            <span>Preview</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
