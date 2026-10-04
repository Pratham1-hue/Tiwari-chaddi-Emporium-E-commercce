"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type TextReveal3dProps = {
  text: string;
  className?: string;
  /** Delay (seconds) before the first word starts revealing. */
  delay?: number;
  /** Stagger (seconds) between words. */
  stagger?: number;
};

/**
 * Scroll-triggered 3D text reveal — words flip up on the X axis
 * one after another as the heading enters the viewport.
 */
export function TextReveal3d({ text, className, delay = 0, stagger = 0.06 }: TextReveal3dProps) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn("inline-block [perspective:800px]", className)} aria-label={text}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-1 align-bottom" aria-hidden="true">
          <motion.span
            className="inline-block origin-bottom [transform-style:preserve-3d]"
            initial={{ rotateX: 90, y: "60%", opacity: 0 }}
            whileInView={{ rotateX: 0, y: "0%", opacity: 1 }}
            viewport={{ once: true, margin: "-12% 0px" }}
            transition={{ delay: delay + i * stagger, type: "spring", stiffness: 200, damping: 24 }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
