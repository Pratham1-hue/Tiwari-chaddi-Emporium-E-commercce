import { Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  playing: boolean;
  muted: boolean;
  onToggle: () => void;
};

export function Equalizer({ active }: { active: boolean }) {
  return (
    <span className="flex h-4 items-end gap-0.5" aria-hidden="true">
      {[0, 0.2, 0.4, 0.1].map((delay, i) => (
        <span
          key={i}
          style={{ animationDelay: `${delay}s`, animationPlayState: active ? "running" : "paused" }}
          className="h-full w-1 origin-bottom animate-eq rounded-full bg-stone-900"
        />
      ))}
    </span>
  );
}

export default function MusicToggle({ playing, muted, onToggle }: Props) {
  const active = playing && !muted;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? "Unmute music" : "Mute music"}
      aria-pressed={muted}
      className="fixed bottom-5 left-5 z-[120] flex cursor-pointer items-center gap-3 rounded-full border border-stone-200 bg-white/90 py-2.5 pl-3 pr-4 text-sm font-semibold text-stone-700 shadow-xl backdrop-blur transition hover:scale-105 active:scale-95"
    >
      <span className={cn("grid h-9 w-9 place-items-center rounded-full text-white", muted ? "bg-stone-400" : "bg-stone-900")}>
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </span>
      <span className="hidden flex-col items-start leading-tight sm:flex">
        <span className="text-xs font-bold">{muted ? "Music off" : playing ? "Tiwari Ji Ka Raaj" : "Music paused"}</span>
        <span className="text-[10px] font-medium text-stone-400">{muted ? "Tap to unmute" : "Tap to mute"}</span>
      </span>
      <Equalizer active={active} />
    </button>
  );
}
