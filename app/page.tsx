"use client";

import { useEffect, useMemo, useState } from 'react';
import clsx from 'clsx';
import { LuPlay, LuPause, LuRefreshCcw, LuWand2, LuCpu, LuSparkles } from 'react-icons/lu';

type Scene = {
  id: number;
  title: string;
  summary: string;
  keywords: string[];
  mood: string;
  startTime: number;
  endTime: number;
  color: string;
};

type GenerationSettings = {
  duration: number;
  scenes: number;
};

const voiceOptions = [
  { id: 'default', label: 'Narrator' },
  { id: 'storyteller', label: 'Storyteller' },
  { id: 'dramatic', label: 'Dramatic' }
] as const;

const accentPalette = [
  'from-[#675AFE] via-[#54D0FF] to-[#8C61FF]',
  'from-[#FF6F91] via-[#FF9671] to-[#FFC75F]',
  'from-[#42EADD] via-[#CDB4DB] to-[#0074E4]',
  'from-[#845EC2] via-[#2C73D2] to-[#0081CF]',
  'from-[#FF8066] via-[#FF9671] to-[#F9F871]'
];

const stopwords = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'into',
  'over',
  'under',
  'about',
  'after',
  'into',
  'each',
  'their',
  'there',
  'they',
  'them',
  'then',
  'were',
  'have',
  'been',
  'being',
  'through',
  'while',
  'just',
  'like',
  'your',
  'you',
  'his',
  'her',
  'its',
  'ours',
  'ourselves',
  'within',
  'without',
  'between',
  'because',
  'though'
]);

const createColor = (index: number) => accentPalette[index % accentPalette.length];

const splitStoryIntoScenes = (story: string, sceneCount: number): string[] => {
  const cleaned = story.replace(/\s+/g, ' ').trim();
  if (!cleaned) {
    return [];
  }
  const sentences = cleaned.split(/(?<=[.!?])\s+/);
  const chunkSize = Math.ceil(sentences.length / sceneCount);
  const chunks: string[] = [];
  for (let i = 0; i < sceneCount; i += 1) {
    const chunk = sentences.slice(i * chunkSize, (i + 1) * chunkSize).join(' ');
    if (chunk) {
      chunks.push(chunk);
    }
  }
  if (chunks.length === 0) {
    chunks.push(cleaned);
  }
  return chunks;
};

const phraseMood = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes('battle') || lower.includes('storm') || lower.includes('dark')) return 'Intense';
  if (lower.includes('joy') || lower.includes('sun') || lower.includes('light')) return 'Uplifting';
  if (lower.includes('mystery') || lower.includes('shadow')) return 'Mysterious';
  if (lower.includes('journey') || lower.includes('adventure')) return 'Adventurous';
  if (lower.includes('love') || lower.includes('heart')) return 'Emotional';
  return 'Narrative';
};

const keywordExtractor = (text: string, maxKeywords = 5): string[] => {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !stopwords.has(word) && word.length > 2);

  const frequencyMap = new Map<string, number>();
  words.forEach((word) => {
    frequencyMap.set(word, (frequencyMap.get(word) ?? 0) + 1);
  });

  return Array.from(frequencyMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

const synthNarration = (story: string, voice: SpeechSynthesisVoice | null, playbackRate: number) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const utterance = new SpeechSynthesisUtterance(story);
  if (voice) {
    utterance.voice = voice;
  }
  utterance.rate = playbackRate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
};

const formatTimestamp = (seconds: number) => {
  const min = Math.floor(seconds / 60);
  const sec = Math.round(seconds % 60);
  return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const animatedBackgrounds = [
  'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(104,90,254,0.25),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(84,208,255,0.2),transparent_50%)]',
  'bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_55%),radial-gradient(circle_at_80%_20%,rgba(255,152,120,0.18),transparent_60%),radial-gradient(circle_at_50%_80%,rgba(255,249,120,0.15),transparent_45%)]',
  'bg-[radial-gradient(circle_at_0%_10%,rgba(255,255,255,0.08),transparent_36%),radial-gradient(circle_at_90%_20%,rgba(132,94,194,0.35),transparent_45%),radial-gradient(circle_at_65%_80%,rgba(44,115,210,0.3),transparent_50%)]'
];

const AdUnit = ({ slot, className }: { slot: string; className?: string }) => (
  <div className={clsx('w-full overflow-hidden rounded-3xl border border-white/5 bg-surface-light p-4', className)}>
    <span className="mb-2 inline-flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-white/50">
      Sponsored
    </span>
    <ins
      className="adsbygoogle block min-h-[120px] w-full rounded-2xl bg-surface-lighter"
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-0000000000000000'}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
    <p className="mt-3 text-xs text-white/40">
      Replace `data-ad-slot` with your AdSense Ad Unit ID for monetization.
    </p>
  </div>
);

const SceneCard = ({ scene }: { scene: Scene }) => (
  <div className="flex flex-col gap-4 rounded-3xl border border-white/5 bg-surface-light p-6 shadow-glow transition hover:-translate-y-1 hover:border-accent-light/60 hover:shadow-glow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Scene {scene.id + 1}</p>
        <h3 className="font-heading text-xl font-semibold text-white">{scene.title}</h3>
      </div>
      <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-medium text-white/70">
        {formatTimestamp(scene.startTime)} — {formatTimestamp(scene.endTime)}
      </span>
    </div>
    <div
      className={clsx(
        'relative h-40 overflow-hidden rounded-2xl bg-gradient-to-br',
        `from-white/5 via-white/0 to-white/5 ${scene.color}`
      )}
    >
      <div className={clsx('absolute inset-0 opacity-60 blur-3xl mix-blend-screen', animatedBackgrounds[scene.id % animatedBackgrounds.length])} />
      <div className="relative z-10 flex h-full flex-col justify-end bg-gradient-to-t from-black/75 to-transparent p-4">
        <p className="text-sm font-medium text-white/80">{scene.summary}</p>
      </div>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      {scene.keywords.map((keyword) => (
        <span key={keyword} className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.2em] text-white/60">
          {keyword}
        </span>
      ))}
    </div>
    <div className="flex items-center justify-between text-sm text-white/50">
      <span className="font-medium uppercase tracking-[0.2em] text-accent-light">Mood · {scene.mood}</span>
      <span>{formatTimestamp(scene.endTime - scene.startTime)} scene length</span>
    </div>
  </div>
);

const VideoPreview = ({
  scenes,
  isPlaying,
  activeScene,
  onSceneComplete,
  onReset
}: {
  scenes: Scene[];
  isPlaying: boolean;
  activeScene: number;
  onSceneComplete: () => void;
  onReset: () => void;
}) => {
  useEffect(() => {
    if (!isPlaying) return;
    if (activeScene >= scenes.length) {
      onReset();
      return;
    }
    const scene = scenes[activeScene];
    const timeout = setTimeout(() => {
      onSceneComplete();
    }, (scene.endTime - scene.startTime) * 1000);
    return () => clearTimeout(timeout);
  }, [isPlaying, activeScene, scenes, onSceneComplete, onReset]);

  const scene = scenes[activeScene] ?? null;

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-white/5 bg-surface-light shadow-glow">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(103,90,254,0.25),transparent_40%)] blur-3xl" />
      </div>
      {scene ? (
        <div className="relative z-10 flex h-full flex-col justify-between rounded-3xl bg-gradient-to-br from-black/40 via-black/20 to-black/60 p-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
            <span>Scene {scene.id + 1}</span>
            <span>{scene.mood}</span>
          </div>
          <div>
            <h3 className="font-heading text-3xl font-semibold">{scene.title}</h3>
            <p className="mt-2 max-w-2xl text-base text-white/80">{scene.summary}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {scene.keywords.map((keyword) => (
                <span key={keyword} className="rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em]">
                  {keyword}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-white/65">
            <span>{formatTimestamp(scene.startTime)} → {formatTimestamp(scene.endTime)}</span>
            <div className="flex items-center gap-2">
              {scenes.map((s, index) => (
                <span
                  key={s.id}
                  className={clsx(
                    'h-1 w-16 rounded-full transition',
                    index <= activeScene ? 'bg-accent-light' : 'bg-white/10'
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="relative z-10 flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center text-white/60">
            <LuWand2 className="h-12 w-12 text-accent-light" />
            <p className="text-lg font-medium">Your AI storyboard preview will appear here.</p>
            <p className="max-w-md text-sm text-white/40">
              Generate a storyboard to watch a simulated video preview with AI-assisted narration.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default function Page() {
  const [story, setStory] = useState('');
  const [settings, setSettings] = useState<GenerationSettings>({ duration: 60, scenes: 5 });
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeScene, setActiveScene] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('default');
  const [playbackRate, setPlaybackRate] = useState(1);

  const voiceMap = useMemo(() => {
    const map = new Map<string, SpeechSynthesisVoice>();
    voices.forEach((voice) => {
      map.set(voice.name, voice);
    });
    return map;
  }, [voices]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const populateVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      if (availableVoices.length) {
        const preferredVoice = availableVoices.find((voice) =>
          voice.name.toLowerCase().includes('female')
        );
        if (preferredVoice) {
          setSelectedVoice(preferredVoice.name);
        }
      }
    };
    populateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', populateVoices);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', populateVoices);
  }, []);

  const totalDuration = settings.duration;

  const handleGenerate = () => {
    const sceneTexts = splitStoryIntoScenes(story, settings.scenes);
    const segments = sceneTexts.map((segment, index) => {
      const start = (totalDuration / sceneTexts.length) * index;
      const end = index === sceneTexts.length - 1 ? totalDuration : (totalDuration / sceneTexts.length) * (index + 1);
      return {
        id: index,
        title: segment.split(/[.!?]/)[0]?.trim().slice(0, 60) || `Scene ${index + 1}`,
        summary: segment,
        keywords: keywordExtractor(segment),
        mood: phraseMood(segment),
        startTime: start,
        endTime: end,
        color: `bg-gradient-to-br ${createColor(index)}`
      } satisfies Scene;
    });
    setScenes(segments);
    setActiveScene(0);
    setIsPlaying(true);
    const voice = voiceMap.get(selectedVoice) ?? voiceMap.values().next().value ?? null;
    synthNarration(sceneTexts.join(' '), voice ?? null, playbackRate);
  };

  const handleStop = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  };

  const handleReset = () => {
    setActiveScene(0);
    setIsPlaying(false);
    if (typeof window !== 'undefined') {
      window.speechSynthesis?.cancel();
    }
  };

  const handleSceneComplete = () => {
    setActiveScene((prev) => {
      if (prev + 1 >= scenes.length) {
        return prev + 1;
      }
      return prev + 1;
    });
  };

  const handlePlaybackToggle = () => {
    if (!scenes.length) return;
    if (isPlaying) {
      handleStop();
    } else {
      setIsPlaying(true);
      const voice = voiceMap.get(selectedVoice) ?? voiceMap.values().next().value ?? null;
      synthNarration(
        scenes.map((scene) => scene.summary).join(' '),
        voice ?? null,
        playbackRate
      );
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col gap-12 px-6 pb-16 pt-12 md:px-10">
      <header className="mt-8 space-y-8 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.3em] text-white/60">
          <LuSparkles className="h-4 w-4 text-accent-light" />
          AI Story Board Generator
        </span>
        <h1 className="font-heading text-3xl md:text-6xl">
          Transform your narrative into a cinematic storyboard with <span className="text-accent-light">AI precision.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base text-white/70 md:text-lg">
          Craft detailed scene breakdowns, generate dynamic voiceovers, and preview your story as a stunning motion board. Fully responsive, SEO ready, and designed for creative storytellers.
        </p>
      </header>

      <section className="grid gap-10 lg:grid-cols-[2fr,1fr]">
        <div className="flex flex-col gap-10">
          <div className="space-y-8 rounded-3xl border border-white/10 bg-surface-light/80 p-8 shadow-glow backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-semibold text-white">Story Input</h2>
                <p className="text-sm text-white/60">Describe your story arc, characters, setting, or script.</p>
              </div>
              <div className="flex gap-2 text-xs uppercase tracking-[0.3em] text-white/40">
                <span className="flex items-center gap-2">
                  <LuCpu className="h-4 w-4 text-accent-light" /> AI Optimized
                </span>
              </div>
            </div>
            <textarea
              className="min-h-[200px] w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-base text-white/90 placeholder:text-white/30 focus:border-accent-light/70 focus:outline-none focus:ring-2 focus:ring-accent/40"
              placeholder="Begin typing your story. Describe the opening scene, the conflict, and how the narrative resolves..."
              value={story}
              onChange={(event) => setStory(event.target.value)}
            />

            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                <label className="text-xs uppercase tracking-[0.3em] text-white/40">Video Length</label>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-semibold text-white">{settings.duration} sec</span>
                </div>
                <input
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
                  type="range"
                  min={5}
                  max={1800}
                  step={5}
                  value={settings.duration}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, duration: Number(event.target.value) }))
                  }
                />
                <div className="mt-2 flex justify-between text-xs text-white/40">
                  <span>5s</span>
                  <span>30m</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                <label className="text-xs uppercase tracking-[0.3em] text-white/40">Scenes</label>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-2xl font-semibold text-white">{settings.scenes}</span>
                </div>
                <input
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
                  type="range"
                  min={3}
                  max={20}
                  step={1}
                  value={settings.scenes}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, scenes: Number(event.target.value) }))
                  }
                />
                <div className="mt-2 flex justify-between text-xs text-white/40">
                  <span>3</span>
                  <span>20</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                <label className="text-xs uppercase tracking-[0.3em] text-white/40">Voiceover style</label>
                <select
                  className="mt-3 w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-sm text-white focus:border-accent-light/80 focus:outline-none focus:ring-2 focus:ring-accent/30"
                  value={selectedVoice}
                  onChange={(event) => setSelectedVoice(event.target.value)}
                >
                  {voices.length === 0 && voiceOptions.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.label}
                    </option>
                  ))}
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))}
                </select>
                <label className="mt-4 block text-xs uppercase tracking-[0.3em] text-white/40">
                  Narration speed
                </label>
                <input
                  className="mt-3 h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-accent"
                  type="range"
                  min={0.8}
                  max={1.4}
                  step={0.05}
                  value={playbackRate}
                  onChange={(event) => setPlaybackRate(Number(event.target.value))}
                />
                <div className="mt-1 flex justify-between text-xs text-white/40">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:bg-accent-dark focus:outline-none focus:ring-4 focus:ring-accent/40"
                onClick={handleGenerate}
              >
                <LuWand2 className="h-4 w-4" />
                Generate Storyboard
              </button>
              <button
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-accent/20"
                onClick={handlePlaybackToggle}
                disabled={!scenes.length}
              >
                {isPlaying ? (
                  <>
                    <LuPause className="h-4 w-4" />
                    Pause Preview
                  </>
                ) : (
                  <>
                    <LuPlay className="h-4 w-4" />
                    Play Preview
                  </>
                )}
              </button>
              <button
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:border-white/30 hover:bg-white/10 focus:outline-none focus:ring-4 focus:ring-accent/20"
                onClick={handleReset}
                disabled={!scenes.length}
              >
                <LuRefreshCcw className="h-4 w-4" />
                Reset
              </button>
            </div>
          </div>

          <VideoPreview
            scenes={scenes}
            isPlaying={isPlaying}
            activeScene={activeScene}
            onSceneComplete={() => {
              if (activeScene + 1 >= scenes.length) {
                setIsPlaying(false);
                return;
              }
              setActiveScene((prev) => prev + 1);
            }}
            onReset={() => {
              setActiveScene(0);
              setIsPlaying(false);
            }}
          />

          <div className="grid gap-6 md:grid-cols-2">
            {scenes.map((scene) => (
              <SceneCard key={scene.id} scene={scene} />
            ))}
          </div>
        </div>

        <aside className="flex flex-col gap-8">
          <AdUnit slot="1234567890" />
          <div className="rounded-3xl border border-white/10 bg-surface-light/80 p-6 backdrop-blur">
            <h3 className="font-heading text-xl font-semibold text-white">Storyboard Insights</h3>
            <ul className="mt-4 space-y-3 text-sm text-white/70">
              <li>
                <strong className="text-white">Scene pacing:</strong> {totalDuration} seconds total with{' '}
                {scenes.length || settings.scenes} intended scenes. Ensure each scene carries the narrative weight it
                deserves.
              </li>
              <li>
                <strong className="text-white">Voiceover sync:</strong> AI narration adapts to your story&apos;s pacing for a coherent video preview.
              </li>
              <li>
                <strong className="text-white">Export ready:</strong> Use the generated storyboard as a blueprint for production or pitch decks.
              </li>
            </ul>
          </div>
          <AdUnit slot="0987654321" />
        </aside>
      </section>

      <section className="rounded-3xl border border-white/10 bg-surface-light/70 p-8 backdrop-blur">
        <h2 className="font-heading text-2xl font-semibold text-white">Frequently Asked Questions</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-white/90">Can I export the storyboard?</h3>
            <p className="mt-2 text-sm text-white/60">
              Use the generated breakdowns as a reference for your production workflow. Export options can be added with screen capture tools or by integrating custom exporters.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">Does the voiceover support multiple languages?</h3>
            <p className="mt-2 text-sm text-white/60">
              The voiceover uses the browser&apos;s SpeechSynthesis API, enabling native voices for numerous locales. Configure your prefered voice from the available options on your device.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">How is SEO handled?</h3>
            <p className="mt-2 text-sm text-white/60">
              Structured metadata, optimized headings, semantic HTML, and fast client interactions ensure search engines can discover and index this experience efficiently.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white/90">Can I monetize with ads?</h3>
            <p className="mt-2 text-sm text-white/60">
              Yes. Replace the AdSense IDs in the ad units with your own. The layout provides premium placements designed for high engagement without sacrificing user experience.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
