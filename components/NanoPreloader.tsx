"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import type { ISourceOptions } from "@tsparticles/engine";

/**
 * A full-screen "nano pieces" loading overlay.
 *
 * The particle engine is initialised once per page (the promise is shared by
 * every instance). The overlay fades itself out and calls `onFinish` after the
 * fade completes.
 *
 * Usage:
 *
 *   <NanoPreloader
 *     avatarSrc="/assets/avatar-profile.jpg"
 *     ready={appReady}
 *     onFinish={() => setShowPreloader(false)}
 *   />
 *
 * Leave `ready` undefined to have the preloader exit on its own after
 * `minDuration`; pass `ready={false}` while your app is still booting and flip
 * it to `true` when the app is usable.
 *
 * Tailwind is used for the overlay layout and status text, so the host project
 * needs Tailwind CSS enabled. The particle field, rings and glow are
 * self-contained so the component does not need extra CSS.
 */
export interface NanoPreloaderProps {
  /** Called once, after the overlay has faded out. */
  onFinish?: () => void;
  /** Controls the exit. Omit for an automatic, timed exit. */
  ready?: boolean;
  /** Optional avatar/logo image. Falls back to `monogram` when absent or broken. */
  avatarSrc?: string;
  /** Alt text for the avatar. Defaults to an empty, decorative alt. */
  avatarAlt?: string;
  /** Monogram shown when there is no usable avatar image. */
  monogram?: string;
  /** Status line near the bottom of the screen. */
  label?: string;
  /** Minimum time the overlay stays visible, in milliseconds. */
  minDuration?: number;
  /** Fade-out duration, in milliseconds. */
  fadeDuration?: number;
  /** Extra classes for the fixed overlay shell. */
  className?: string;
}

const FIELD_MASK =
  "radial-gradient(circle at 50% 50%, transparent 0px, transparent 44px, rgba(0,0,0,0.4) 76px, #000 112px)";

const HALO_MASK =
  "radial-gradient(circle closest-side at 50% 50%, transparent 0px, transparent 40px, rgba(0,0,0,0.4) 68px, #000 104px, #000 76%, transparent 100%)";

const NANO_STYLES = `
@keyframes nano-orbit {
  to { transform: rotate(360deg); }
}
@keyframes nano-blink {
  0%, 100% { opacity: .18; transform: scale(.8); }
  50% { opacity: 1; transform: scale(1); }
}
@keyframes nano-rise {
  from { opacity: 0; transform: translateY(8px) scale(.97); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.nano-orbit { animation: nano-orbit 26s linear infinite; }
.nano-blink { animation: nano-blink 2.4s ease-in-out infinite; }
.nano-rise { animation: nano-rise .9s cubic-bezier(.22, 1, .36, 1) both; }
.nano-rise-late { animation: nano-rise .9s cubic-bezier(.22, 1, .36, 1) .25s both; }
@media (prefers-reduced-motion: reduce) {
  .nano-orbit, .nano-blink, .nano-rise, .nano-rise-late { animation: none; }
}
`;

let enginePromise: Promise<void> | null = null;

function initNanoEngine(): Promise<void> {
  if (!enginePromise) {
    enginePromise = initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    });
  }

  return enginePromise;
}

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

const NANO_COLORS = [
  "#7DD3FC",
  "#A78BFA",
  "#F472B6",
  "#FBBF24",
  "#6EE7B7",
  "#E2E8F0",
];

function makeParticleOptions(
  variant: "field" | "halo",
  reducedMotion: boolean,
  compact: boolean,
): ISourceOptions {
  const halo = variant === "halo";
  const count = reducedMotion
    ? halo
      ? 72
      : 56
    : halo
      ? compact
        ? 140
        : 200
      : compact
        ? 90
        : 150;
  const size = halo
    ? compact
      ? { min: 0.45, max: 2 }
      : { min: 0.7, max: 2.8 }
    : compact
      ? { min: 0.6, max: 2.6 }
      : { min: 0.8, max: 3.2 };
  const speed = reducedMotion
    ? { min: 0.4, max: 0.8 }
    : halo
      ? { min: 2.2, max: 4.8 }
      : { min: 1.4, max: 3.2 };
  const linkDistance = halo ? (compact ? 64 : 72) : compact ? 118 : 145;
  const linkOpacity = halo ? (compact ? 0.11 : 0.13) : compact ? 0.055 : 0.07;

  return {
    fullScreen: { enable: false },
    fpsLimit: reducedMotion ? 30 : 60,
    detectRetina: true,
    background: { color: { value: "transparent" } },
    particles: {
      number: { value: count },
      color: { value: NANO_COLORS },
      shape: {
        type: ["circle", "polygon", "line"],
        options: { polygon: { sides: 3 } },
      },
      size: {
        value: size,
        animation: {
          enable: !reducedMotion,
          speed: 1.4,
          sync: false,
          startValue: "random",
        },
      },
      opacity: {
        value: { min: 0.16, max: 0.75 },
        animation: {
          enable: !reducedMotion,
          speed: 0.7,
          sync: false,
          startValue: "random",
        },
      },
      rotate: {
        value: { min: 0, max: 360 },
        animation: {
          enable: !reducedMotion,
          speed: { min: -5, max: 5 },
          sync: false,
        },
      },
      move: {
        enable: true,
        // Speed drives the angular velocity of the orbit.
        speed,
        direction: "none",
        spin: {
          enable: true,
          position: { x: 50, y: 50 },
          // A barely-there inward drift, so the field breathes toward the
          // avatar instead of spinning at a fixed radius forever.
          acceleration: reducedMotion ? 0 : halo ? -0.024 : -0.012,
        },
        outModes: { default: "bounce" },
      },
      links: {
        enable: true,
        distance: linkDistance,
        color: halo ? "#7DD3FC" : "#9DB8D9",
        opacity: linkOpacity,
        width: 0.5,
      },
      collisions: { enable: false },
    },
    interactivity: {
      events: {
        onHover: { enable: false },
        onClick: { enable: false },
        resize: { enable: true },
      },
    },
  };
}

function NanoPreloader({
  onFinish,
  ready,
  avatarSrc,
  avatarAlt = "",
  monogram = "X",
  label = "Standing by…",
  minDuration = 2200,
  fadeDuration = 750,
  className,
}: NanoPreloaderProps) {
  const reactId = useId();
  const uid = useMemo(
    () => `nano-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactId],
  );

  const [phase, setPhase] = useState<"visible" | "leaving" | "gone">("visible");
  const [startedAt] = useState(now);
  const [engineReady, setEngineReady] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [compact, setCompact] = useState(false);

  const finishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    setAvatarFailed(false);
  }, [avatarSrc]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);

    sync();
    media.addEventListener?.("change", sync);

    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 700px)");
    const sync = () => setCompact(media.matches);

    sync();
    media.addEventListener?.("change", sync);

    return () => media.removeEventListener?.("change", sync);
  }, []);

  useEffect(() => {
    let alive = true;

    initNanoEngine()
      .then(() => {
        if (alive) setEngineReady(true);
      })
      .catch(() => {
        // A failed particle engine must never hold the page hostage. The
        // overlay still exits on its normal schedule without the canvas.
      });

    return () => {
      alive = false;
    };
  }, []);

  const finish = useCallback(() => {
    if (finishedRef.current) return;

    finishedRef.current = true;
    setPhase("gone");
    onFinishRef.current?.();
  }, []);

  useEffect(() => {
    if (phase !== "visible" || ready === false) return;

    const elapsed = now() - startedAt;
    const timer = window.setTimeout(
      () => setPhase("leaving"),
      Math.max(0, minDuration - elapsed),
    );

    return () => window.clearTimeout(timer);
  }, [phase, ready, minDuration, startedAt]);

  useEffect(() => {
    if (phase !== "leaving") return;

    const timer = window.setTimeout(finish, fadeDuration);

    return () => window.clearTimeout(timer);
  }, [phase, fadeDuration, finish]);

  const fieldOptions = useMemo<ISourceOptions>(
    () => makeParticleOptions("field", reducedMotion, compact),
    [reducedMotion, compact],
  );

  const haloOptions = useMemo<ISourceOptions>(
    () => makeParticleOptions("halo", reducedMotion, compact),
    [reducedMotion, compact],
  );

  if (phase === "gone") return null;

  const fieldMaskStyle: CSSProperties = {
    maskImage: FIELD_MASK,
    WebkitMaskImage: FIELD_MASK,
  };

  const haloMaskStyle: CSSProperties = {
    width: "min(88vw, 88vmin, 560px)",
    height: "min(88vw, 88vmin, 560px)",
    maskImage: HALO_MASK,
    WebkitMaskImage: HALO_MASK,
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      aria-busy={phase === "visible"}
      className={[
        "fixed inset-0 z-[9999] isolate flex select-none touch-none items-center justify-center overflow-hidden bg-black",
        "transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-[opacity,transform] motion-reduce:scale-100",
        phase === "leaving"
          ? "pointer-events-none scale-[1.015] opacity-0"
          : "scale-100 opacity-100",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionDuration: `${fadeDuration}ms` }}
    >
      <style>{NANO_STYLES}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 transition-opacity duration-[1200ms] ease-out"
        style={{ ...fieldMaskStyle, opacity: engineReady ? 1 : 0 }}
      >
        {engineReady && (
          <Particles
            id={`${uid}-field`}
            className="h-full w-full"
            options={fieldOptions}
          />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-[1400ms] ease-out"
        style={{ ...haloMaskStyle, opacity: engineReady ? 1 : 0 }}
      >
        {engineReady && (
          <Particles
            id={`${uid}-halo`}
            className="h-full w-full"
            options={haloOptions}
          />
        )}
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_44%,rgba(0,0,0,0.5)_100%)]"
      />

      <div className="nano-rise relative z-10 flex items-center justify-center">
        <div className="relative flex h-44 w-44 items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(125,211,252,0.17)_0%,rgba(167,139,250,0.08)_45%,transparent_72%)] blur-xl"
          />

          <div
            aria-hidden="true"
            className="absolute h-40 w-40 rounded-full border border-white/[0.055]"
          />

          <svg
            aria-hidden="true"
            viewBox="0 0 128 128"
            className="nano-orbit absolute h-40 w-40"
          >
            <defs>
              <linearGradient
                id={`${uid}-ring`}
                x1="18"
                y1="8"
                x2="110"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#7DD3FC" stopOpacity="0" />
                <stop offset="0.35" stopColor="#7DD3FC" stopOpacity="0.55" />
                <stop offset="0.62" stopColor="#C4B5FD" stopOpacity="0.4" />
                <stop offset="1" stopColor="#F0ABFC" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="64"
              cy="64"
              r="57"
              fill="none"
              stroke={`url(#${uid}-ring)`}
              strokeWidth="1"
              strokeDasharray="1.5 7.5"
              strokeLinecap="round"
            />
            <circle
              cx="64"
              cy="64"
              r="49"
              fill="none"
              stroke="rgba(255,255,255,0.055)"
              strokeWidth="0.75"
            />
            <path
              d="M64 2.5v5M64 120.5v5M2.5 64h5M120.5 64h5"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
            <circle cx="64" cy="7" r="1.4" fill="#7DD3FC" fillOpacity="0.9" />
          </svg>

          <div className="relative flex h-[88px] w-[88px] items-center justify-center rounded-full border border-white/10 bg-[#05070b]/90 p-[3px] shadow-[0_0_40px_-8px_rgba(125,211,252,0.45),inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-[#0a0d14]">
              {avatarSrc && !avatarFailed ? (
                <img
                  src={avatarSrc}
                  alt={avatarAlt}
                  draggable={false}
                  onError={() => setAvatarFailed(true)}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="select-none text-[26px] font-semibold leading-none tracking-[-0.08em] text-white/90">
                  {monogram}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="nano-rise-late absolute inset-x-0 bottom-0 z-10 flex flex-col items-center gap-3 px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))]">
        <span
          aria-hidden="true"
          className="h-px w-20 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        />
        <p className="flex items-center gap-2.5 font-sans text-[11px] font-medium uppercase tracking-[0.32em] text-white/45">
          <span
            aria-hidden="true"
            className="nano-blink h-1 w-1 rounded-full bg-cyan-300/80 shadow-[0_0_8px_rgba(103,232,249,0.75)]"
          />
          {label}
        </p>
      </div>
    </div>
  );
}

export { NanoPreloader };
export default NanoPreloader;
