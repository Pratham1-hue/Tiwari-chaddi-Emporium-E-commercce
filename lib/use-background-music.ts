"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const MUSIC_VOLUME = 0.35;

/**
 * Plays a looping background track at a fixed, moderate volume.
 * Browsers block audible autoplay until the user interacts with the page, so we
 * try immediately and fall back to the first click / tap / key press.
 */
export function useBackgroundMusic(src: string, volume = MUSIC_VOLUME) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const tryPlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audio.paused) return false;

    audio.volume = 0;
    try {
      await audio.play();
    } catch {
      return false;
    }

    // Gentle fade-in up to the target volume.
    if (fadeRef.current) clearInterval(fadeRef.current);
    fadeRef.current = setInterval(() => {
      const next = Math.min(volume, audio.volume + volume / 20);
      audio.volume = next;
      if (next >= volume && fadeRef.current) {
        clearInterval(fadeRef.current);
        fadeRef.current = null;
      }
    }, 100);
    return true;
  }, [volume]);

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = true;
    audio.preload = "auto";
    audio.volume = 0;
    audioRef.current = audio;

    const onStarted = () => setPlaying(true);
    const start = () => {
      tryPlay().then((ok) => ok && onStarted());
    };

    start();
    const events = ["pointerdown", "keydown", "touchstart"] as const;
    events.forEach((e) => window.addEventListener(e, start));

    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (fadeRef.current) clearInterval(fadeRef.current);
      audio.pause();
      audioRef.current = null;
    };
  }, [src, tryPlay]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !audio.muted;
    setMuted(audio.muted);
    if (audio.paused) tryPlay().then((ok) => ok && setPlaying(true));
  }, [tryPlay]);

  const start = useCallback(async () => {
    if (await tryPlay()) setPlaying(true);
  }, [tryPlay]);

  return { playing, muted, toggleMute, start };
}
