"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useMotionValue, animate, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";

export type InfiniteSliderProps = {
  children: React.ReactNode;
  gap?: number;
  speed?: number;
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  className?: string;
};

export function MarqueeEffect({
  children,
  gap = 16,
  speed = 100,
  speedOnHover,
  direction = "horizontal",
  reverse = false,
  className,
}: InfiniteSliderProps) {
  const [currentSpeed, setCurrentSpeed] = React.useState(speed);
  const [ref, { width, height }] = useMeasure();
  const translation = useMotionValue(0);
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [key, setKey] = React.useState(0);

  React.useEffect(() => {
    let controls;
    const size = direction === "horizontal" ? width : height;
    const contentSize = size + gap;
    const from = reverse ? -contentSize / 2 : 0;
    const to = reverse ? 0 : -contentSize / 2;

    const distanceToTravel = Math.abs(to - from);
    const duration = distanceToTravel / currentSpeed;

    if (isTransitioning) {
      const remainingDistance = Math.abs(translation.get() - to);
      const transitionDuration = remainingDistance / currentSpeed;

      controls = animate(translation, [translation.get(), to], {
        ease: "linear",
        duration: transitionDuration,
        onComplete: () => {
          setIsTransitioning(false);
          setKey((prevKey) => prevKey + 1);
        },
      });
    } else {
      controls = animate(translation, [from, to], {
        ease: "linear",
        duration: duration,
        repeat: Infinity,
        repeatType: "loop",
        repeatDelay: 0,
        onRepeat: () => {
          translation.set(from);
        },
      });
    }

    return controls?.stop;
  }, [
    key,
    translation,
    currentSpeed,
    width,
    height,
    gap,
    isTransitioning,
    direction,
    reverse,
  ]);

  const hoverProps = speedOnHover
    ? {
        onHoverStart: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speedOnHover);
        },
        onHoverEnd: () => {
          setIsTransitioning(true);
          setCurrentSpeed(speed);
        },
      }
    : {};

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div
        className={cn("flex", { "w-max": direction !== "vertical" })}
        style={{
          ...(direction === "horizontal"
            ? { x: translation }
            : { y: translation }),
          gap: `${gap}px`,
          flexDirection: direction === "horizontal" ? "row" : "column",
        }}
        ref={ref}
        {...hoverProps}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export type PromoItem = {
  emoji: string;
  name: string;
  price: string;
  tileClass: string;
};

type PromoSectionProps = {
  items: PromoItem[];
  title?: string;
  description?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function PromoSection({
  items,
  title = "Summer styles are finally here",
  description = "This year, our new summer collection will shelter you from the harsh elements of a world that doesn\u2018t care if you live or die.",
  ctaLabel = "Shop Collection",
  ctaHref = "#shop",
}: PromoSectionProps) {
  // Split items across the two marquee columns.
  const columns = [items.filter((_, i) => i % 2 === 0), items.filter((_, i) => i % 2 === 1)];

  return (
    <section className="relative py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid items-center lg:grid-cols-2">
          <header className="relative z-10 mx-auto mb-8 max-w-xl text-center lg:mb-10 lg:text-start">
            <h3 className="mb-4 text-4xl font-bold text-balance md:text-5xl leading-tight">
              {title}
            </h3>
            <p className="text-muted-foreground text-balance lg:text-lg">
              {description}
            </p>
            <Button
              size="lg"
              asChild
              className="mt-6"
            >
              <a href={ctaHref}>
                {ctaLabel}
                <ArrowRightIcon />
              </a>
            </Button>
          </header>
          <div className="relative mx-auto grid h-96 w-full max-w-md grid-cols-2 gap-4 overflow-hidden mask-t-from-80% mask-b-from-80% lg:h-150 lg:max-w-none lg:mask-r-from-70% lg:mask-l-from-70%">
            {columns.map((column, i) => (
              <MarqueeEffect
                key={i}
                gap={12}
                direction="vertical"
                reverse={i === 1}
                speed={30}
                speedOnHover={1}
              >
                {column.map((item) => (
                  <figure
                    key={item.name}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/60 shadow-lg shadow-black/5",
                      item.tileClass,
                    )}
                  >
                    <span className="text-6xl drop-shadow-[0_8px_12px_rgba(0,0,0,0.15)] md:text-7xl">{item.emoji}</span>
                    <figcaption className="mt-2 px-3 text-center">
                      <span className="block text-sm font-bold leading-tight text-slate-800">{item.name}</span>
                      <span className="block text-xs font-semibold text-slate-600">{item.price}</span>
                    </figcaption>
                  </figure>
                ))}
              </MarqueeEffect>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
