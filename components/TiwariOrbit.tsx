import Image from "next/image";
import { cn } from "@/lib/utils";

export type OrbitItem = { emoji: string; name: string; tileClass: string };

type Props = {
  items: OrbitItem[];
  className?: string;
  /** Orbit duration in seconds is fixed in CSS; this only toggles the dashed ring. */
  showRing?: boolean;
};

/**
 * Tiwari Ji in the centre with products circling around him.
 * Everything is sized in container-query units (cqw), so it scales to any width.
 * Each product counter-rotates against the orbit so the emoji always stay upright.
 */
export default function TiwariOrbit({ items, className, showRing = true }: Props) {
  const count = items.length;

  return (
    <div
      className={cn("relative aspect-square w-full", className)}
      style={{ containerType: "inline-size" }}
    >
      <div className="absolute inset-[14cqw] animate-glow rounded-full bg-gradient-to-br from-orange-300 via-pink-300 to-violet-300 blur-3xl" />

      {showRing && (
        <>
          <div className="absolute left-1/2 top-1/2 h-[78cqw] w-[78cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-pink-300/70" />
          <div className="absolute left-1/2 top-1/2 h-[60cqw] w-[60cqw] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-200/80" />
        </>
      )}

      <div className="absolute left-1/2 top-1/2 w-[56cqw] -translate-x-1/2 -translate-y-[46%]">
        <div className="animate-bob [mask-image:linear-gradient(to_bottom,black_82%,transparent)]">
          <Image
            src="/tiwari/tiwari-ji.png"
            alt="Tiwari Ji, our brand ambassador"
            width={577}
            height={432}
            priority
            className="h-auto w-full drop-shadow-[0_2cqw_3cqw_rgba(120,40,120,0.35)]"
          />
        </div>
      </div>

      <div className="absolute left-1/2 top-1/2 h-0 w-0 animate-orbit">
        {items.map((item, i) => {
          const angle = (360 / count) * i;
          return (
            <div
              key={item.name}
              className="absolute left-0 top-0 h-0 w-0"
              style={{ transform: `rotate(${angle}deg) translateY(-39cqw)` }}
            >
              <div className="h-0 w-0" style={{ transform: `rotate(${-angle}deg)` }}>
                <div className="h-0 w-0 animate-orbit-reverse">
                  <div
                    title={item.name}
                    className={cn(
                      "absolute left-0 top-0 grid h-[16cqw] w-[16cqw] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[28%] border-2 border-white/80 text-[8.5cqw] leading-none shadow-lg shadow-pink-500/25",
                      item.tileClass,
                    )}
                  >
                    {item.emoji}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
