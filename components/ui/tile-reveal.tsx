"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export type TileItem = {
  emoji: string;
  name: string;
  tileClass: string;
};

function TileColumn({
  tiles,
  progress,
  range,
  fromX,
  className,
}: {
  tiles: TileItem[];
  progress: MotionValue<number>;
  range: [number, number];
  fromX: string;
  className?: string;
}) {
  const x = useTransform(progress, range, [fromX, "0%"]);
  return (
    <motion.div style={{ x }} className={cn("flex w-1/4 flex-col gap-4", className)}>
      {tiles.map((tile) => (
        <div
          key={tile.name}
          className={cn(
            "flex aspect-square flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-3 shadow-sm",
            tile.tileClass
          )}
        >
          <span className="text-5xl md:text-6xl">{tile.emoji}</span>
          <span className="mt-2 line-clamp-1 px-1 text-center text-xs font-bold text-stone-700">{tile.name}</span>
        </div>
      ))}
    </motion.div>
  );
}

type TileRevealProps = {
  tiles: TileItem[];
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

/**
 * Sticky tile grid — columns fly in one by one on scroll, then the whole
 * grid zooms past the edges to reveal a headline and call to action.
 */
export function TileReveal({
  tiles,
  eyebrow = "The collection",
  title = "Sixteen everyday essentials",
  description = "One grid, every drawer covered — briefs, boxers, vests, thermals and socks in sizes S to XXL.",
  ctaLabel = "Shop the grid",
  ctaHref = "#shop",
}: TileRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const zoom = useTransform(scrollYProgress, [0.62, 1], [1, 1.7]);
  const gridOpacity = useTransform(scrollYProgress, [0.72, 0.9], [1, 0.15]);
  const headlineOpacity = useTransform(scrollYProgress, [0.74, 0.9], [0, 1]);
  const headlineY = useTransform(scrollYProgress, [0.74, 0.9], [60, 0]);

  const columns: TileItem[][] = [[], [], [], []];
  tiles.forEach((tile, i) => {
    columns[i % 4].push(tile);
  });

  if (reduceMotion) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">{eyebrow}</p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl">{title}</h2>
        <p className="mt-2 max-w-xl text-stone-500">{description}</p>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 flex h-screen flex-col items-center justify-center overflow-hidden">
        <motion.div style={{ scale: zoom, opacity: gridOpacity }} className="flex w-full max-w-5xl gap-4 px-4">
          <TileColumn tiles={columns[0]} progress={scrollYProgress} range={[0, 0.3]} fromX="-60%" />
          <TileColumn tiles={columns[1]} progress={scrollYProgress} range={[0.08, 0.38]} fromX="-30%" className="mt-10" />
          <TileColumn tiles={columns[2]} progress={scrollYProgress} range={[0.16, 0.46]} fromX="30%" className="mt-4" />
          <TileColumn tiles={columns[3]} progress={scrollYProgress} range={[0.24, 0.54]} fromX="60%" className="mt-12" />
        </motion.div>

        <motion.div
          style={{ opacity: headlineOpacity, y: headlineY }}
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-4 text-center"
        >
          <p className="rounded-full border border-stone-200 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-stone-500 shadow-sm backdrop-blur">
            {eyebrow}
          </p>
          <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight text-stone-900 md:text-6xl">{title}</h2>
          <p className="mt-3 max-w-xl text-stone-500 md:text-lg">{description}</p>
          <div className="pointer-events-auto mt-6">
            <Button size="lg" asChild>
              <a href={ctaHref}>
                {ctaLabel}
                <ArrowRightIcon />
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
