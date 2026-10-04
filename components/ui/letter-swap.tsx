"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type LetterSwapProps = {
  /** Words to cycle through. The widest one sets the width so layout never shifts. */
  words: string[];
  interval?: number;
  className?: string;
};

/**
 * Staggered 3D letter swap — each letter flips on the X axis in sequence,
 * like a split-flap display. Auto-cycles; static text when reduced motion.
 */
export function LetterSwap({ words, interval = 2600, className }: LetterSwapProps) {
  const [index, setIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % words.length);
  }, [words.length]);

  useEffect(() => {
    if (reduceMotion || words.length < 2) return;
    const t = setInterval(next, interval);
    return () => clearInterval(t);
  }, [next, interval, reduceMotion, words.length]);

  const longest = useMemo(
    () => words.reduce((a, b) => (a.length >= b.length ? a : b), ""),
    [words]
  );
  const current = words[index] ?? "";

  if (reduceMotion) {
    return <span className={className}>{current}</span>;
  }

  return (
    <span className={cn("relative inline-block align-bottom", className)}>
      {/* Invisible sizer keeps the line width stable while words change. */}
      <span aria-hidden="true" className="invisible whitespace-pre">
        {longest}
      </span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={current}
          aria-hidden={index === 0 ? undefined : true}
          className="absolute inset-0 whitespace-pre [perspective:600px]"
          initial="hidden"
          animate="show"
          exit="exit"
        >
          {current.split("").map((ch, i) => (
            <motion.span
              key={i}
              className="inline-block [transform-style:preserve-3d]"
              variants={{
                hidden: { rotateX: 90, y: 10, opacity: 0 },
                show: {
                  rotateX: 0,
                  y: 0,
                  opacity: 1,
                  transition: { delay: i * 0.035, type: "spring", stiffness: 350, damping: 28 },
                },
                exit: {
                  rotateX: -90,
                  y: -10,
                  opacity: 0,
                  transition: { delay: i * 0.02, duration: 0.22, ease: "easeIn" },
                },
              }}
            >
              {ch}
            </motion.span>
          ))}
        </motion.span>
      </AnimatePresence>
      <span className="sr-only">{current}</span>
    </span>
  );
}
