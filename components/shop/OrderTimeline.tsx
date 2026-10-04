"use client";

import type { Order } from "@/lib/types";

export const STEPS = ["PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;
export type OrderStep = (typeof STEPS)[number];

export function statusIndex(status: string) {
  const i = (STEPS as readonly string[]).indexOf(status);
  return i === -1 ? 0 : i;
}

export default function OrderTimeline({ order, compact = false }: { order: Order; compact?: boolean }) {
  const status = order.status ?? "PLACED";
  if (["CANCELLED", "RETURNED", "RETURN_REQUESTED"].includes(status)) {
    return (
      <div className={`rounded-xl px-3 py-2 text-xs font-bold ${status === "CANCELLED" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
        Status: {status.replaceAll("_", " ")}
        {order.returnReason ? ` — ${order.returnReason}` : ""}
      </div>
    );
  }
  const idx = statusIndex(status);
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((s, i) => (
        <div key={s} className="flex flex-1 items-center last:flex-none">
          <div className="flex flex-col items-center">
            <span className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold ${i <= idx ? "bg-stone-900 text-white" : "bg-stone-200 text-stone-400"}`}>
              {i < idx ? "✓" : i + 1}
            </span>
            {!compact && <span className={`mt-1 text-[9px] font-semibold ${i <= idx ? "text-stone-800" : "text-stone-400"}`}>{s.replaceAll("_", " ")}</span>}
          </div>
          {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 rounded ${i < idx ? "bg-stone-900" : "bg-stone-200"}`} />}
        </div>
      ))}
    </div>
  );
}
