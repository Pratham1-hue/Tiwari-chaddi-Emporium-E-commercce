"use client";

import { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cn } from "@/lib/utils";

type SpeedingTextProps = {
  items: string[];
  separator?: string;
  className?: string;
  /** Base loop duration in seconds at rest. */
  duration?: number;
};

/**
 * Marquee strip that stretches and skews with scroll velocity —
 * the faster you scroll, the more the text smears past the viewport.
 */
export function SpeedingText({ items, separator = "✦", className, duration = 22 }: SpeedingTextProps) {
  const reduceMotion = useReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const smooth = useSpring(velocity, { stiffness: 120, damping: 30, mass: 0.4 });
  const skewX = useTransform(smooth, [-3500, 3500], [10, -10]);
  const stretch = useTransform(smooth, (v) => 1 + Math.min(Math.abs(v) / 9000, 0.4));
  const x = useMotionValue("0%");

  useEffect(() => {
    if (reduceMotion) return;
    x.set("0%");
    const controls = animate(x, "-50%", {
      duration,
      ease: "linear",
      repeat: Infinity,
    });
    return () => controls.stop();
  }, [duration, reduceMotion, x]);

  if (reduceMotion) {
    return (
      <div className={cn("overflow-hidden border-y border-stone-200 bg-white py-3", className)}>
        <p className="text-center text-sm font-bold tracking-wide text-stone-600">{items.join(` ${separator} `)}</p>
      </div>
    );
  }

  const row = (key: string) => (
    <span key={key} className="flex shrink-0 items-center" aria-hidden={key === "b" ? true : undefined}>
      {items.map((item) => (
        <span key={`${key}-${item}`} className="flex shrink-0 items-center gap-6 pr-6">
          <span className="whitespace-nowrap text-sm font-extrabold uppercase tracking-[0.18em]">{item}</span>
          <span aria-hidden="true" className="text-stone-500">{separator}</span>
        </span>
      ))}
    </span>
  );

  return (
    <div className={cn("overflow-hidden border-y border-stone-900 bg-stone-900 py-3 text-white", className)}>
      <motion.div style={{ skewX, scaleX: stretch }} className="flex w-max origin-center">
        <motion.div style={{ x }} className="flex w-max">
          {row("a")}
          {row("b")}
        </motion.div>
      </motion.div>
    </div>
  );
}
