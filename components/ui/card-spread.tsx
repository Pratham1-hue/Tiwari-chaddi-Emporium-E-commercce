"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export type SpreadCard = {
  key: string;
  emoji: string;
  title: string;
  subtitle: string;
  tileClass: string;
};

type CardSpreadProps = {
  cards: SpreadCard[];
  activeKey?: string;
  onSelect?: (key: string) => void;
  className?: string;
};

const cardVariants: Variants = {
  rest: (i: number) => ({
    rotate: (i - 2) * 7,
    x: (i - 2) * 30,
    y: Math.abs(i - 2) * 12,
    transition: { type: "spring", stiffness: 260, damping: 26 },
  }),
  spread: (i: number) => ({
    rotate: (i - 2) * 11,
    x: (i - 2) * 88,
    y: Math.abs(i - 2) * 8,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  }),
};

/**
 * Fanned deck of cards that spreads open on hover.
 * Clicking a card selects it (used here for shop-by-category).
 */
export function CardSpread({ cards, activeKey, onSelect, className }: CardSpreadProps) {
  const reduceMotion = useReducedMotion();
  const middle = (cards.length - 1) / 2;

  if (reduceMotion) {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {cards.map((card) => (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelect?.(card.key)}
            aria-pressed={activeKey === card.key}
            className={cn(
              "flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold",
              activeKey === card.key
                ? "border-stone-900 bg-stone-900 text-white"
                : "border-stone-200 bg-white text-stone-600 hover:border-stone-400"
            )}
          >
            <span>{card.emoji}</span> {card.title}
          </button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="rest"
      whileHover="spread"
      animate="rest"
      className={cn("flex justify-center overflow-x-auto py-8 [perspective:1200px]", className)}
      role="group"
      aria-label="Shop by category"
    >
      <div className="relative flex h-52 w-full max-w-2xl shrink-0 items-center justify-center">
        {cards.map((card, i) => {
          const active = activeKey === card.key;
          return (
            <motion.button
              key={card.key}
              type="button"
              custom={i}
              variants={cardVariants}
              onClick={() => onSelect?.(card.key)}
              aria-pressed={active}
              whileTap={{ scale: 0.94 }}
              className={cn(
                "absolute flex h-48 w-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 p-3 text-center shadow-xl transition-colors",
                card.tileClass,
                active ? "border-stone-900" : "border-white"
              )}
              style={{ zIndex: active ? 20 : 10 - Math.abs(i - middle) }}
            >
              <span className="text-5xl">{card.emoji}</span>
              <span className="text-sm font-extrabold text-stone-900">{card.title}</span>
              <span className="text-[11px] font-medium text-stone-500">{card.subtitle}</span>
              {active && (
                <span className="mt-1 rounded-full bg-stone-900 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                  Selected
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
