"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Music2 } from "lucide-react";
import TiwariOrbit, { type OrbitItem } from "./TiwariOrbit";
import { Equalizer } from "./MusicToggle";

type Props = {
  open: boolean;
  items: OrbitItem[];
  playing: boolean;
  muted: boolean;
  onEnter: () => void;
};

const AUTO_DISMISS_MS = 3500;

export default function Splash({ open, items, playing, muted, onEnter }: Props) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const started = Date.now();
    const tick = setInterval(() => {
      setProgress(Math.min(100, ((Date.now() - started) / AUTO_DISMISS_MS) * 100));
    }, 50);
    const timer = setTimeout(() => {
      onEnter();
    }, AUTO_DISMISS_MS);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(timer);
      clearInterval(tick);
    };
  }, [open, onEnter]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="splash"
          role="dialog"
          aria-label="Welcome to Chaddi & Baniyan Emporium"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-stone-50 px-4"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.45, ease: "easeInOut" }}
        >
          <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-orange-100 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-24 h-[28rem] w-[28rem] rounded-full bg-stone-200/70 blur-3xl" />

          <motion.div
            className="relative z-10 text-center"
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <span className="inline-block rounded-full border border-stone-200 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-stone-500">
              Official Brand Ambassador
            </span>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-stone-900 md:text-6xl">
              Tiwari Ji <span className="font-light text-stone-400">presents</span>
            </h1>
            <p className="mt-1 text-sm font-medium text-stone-500 md:text-base">Chaddi &amp; Baniyan Emporium</p>
          </motion.div>

          <motion.div
            className="relative z-10 my-2 w-[min(80vw,44vh,440px)]"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          >
            <TiwariOrbit items={items} />
          </motion.div>

          <motion.div
            className="relative z-10 flex w-full max-w-xs flex-col items-center gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <motion.button
              type="button"
              onClick={onEnter}
              whileTap={{ scale: 0.97 }}
              className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-stone-900 px-8 py-3.5 text-base font-bold text-white hover:bg-stone-700"
            >
              Enter the Emporium
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
            <div className="h-1 w-full overflow-hidden rounded-full bg-stone-200">
              <div className="h-full rounded-full bg-stone-900 transition-none" style={{ width: `${progress}%` }} />
            </div>
            <p className="flex items-center gap-2 text-xs font-medium text-stone-400">
              {playing ? (
                <>
                  <Equalizer active={!muted} />
                  {muted ? "Music is muted" : "Now playing: Tiwari Ji Ka Raaj"}
                </>
              ) : (
                <>
                  <Music2 className="h-4 w-4" />
                  Entering automatically in a moment…
                </>
              )}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
