"use client";

import { useEffect, useMemo } from "react";
import { X, Minus, Plus, Trash2, Truck } from "lucide-react";
import { useShop } from "@/lib/shop-context";
import { formatPrice } from "@/lib/format";
import { CATEGORY_STYLES } from "@/lib/catalog";
import type { Product } from "@/lib/types";

export default function CartDrawer({ open, onClose, onCheckout, productsById }: {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  productsById: Map<string, Product>;
}) {
  const { cart, setQty, removeLine } = useShop();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const lines = useMemo(
    () =>
      cart.flatMap((l) => {
        const product = productsById.get(l.productId);
        return product ? [{ ...l, product }] : [];
      }),
    [cart, productsById]
  );
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const freeShip = subtotal >= 499;
  const remaining = Math.max(0, 499 - subtotal);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 bg-stone-950/50" onClick={onClose} />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-5 py-4">
          <h2 className="text-base font-extrabold">Your Cart <span className="font-medium text-stone-400">({lines.reduce((n, l) => n + l.quantity, 0)})</span></h2>
          <button type="button" onClick={onClose} aria-label="Close cart" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <div className="text-5xl">🛒</div>
            <p className="font-bold">Your cart is empty</p>
            <p className="text-sm text-stone-500">Pick a size and add something comfortable.</p>
            <button type="button" onClick={onClose} className="mt-2 cursor-pointer rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white">Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="border-b border-stone-100 px-5 py-3">
              <p className="mb-2 flex items-center gap-2 text-xs font-medium text-stone-600">
                <Truck className="h-4 w-4" />
                {remaining > 0 ? <>Add <b>{formatPrice(remaining)}</b> more for FREE shipping</> : <span className="font-bold text-emerald-600">FREE shipping unlocked</span>}
              </p>
              <div className="h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div className="h-full rounded-full bg-stone-900 transition-all" style={{ width: `${Math.min(100, (subtotal / 499) * 100)}%` }} />
              </div>
            </div>
            <ul className="flex-1 divide-y divide-stone-100 overflow-y-auto px-5">
              {lines.map((l) => {
                const style = CATEGORY_STYLES[l.product.category ?? "Other"] ?? CATEGORY_STYLES.Other;
                return (
                  <li key={l.key} className="flex gap-3 py-4">
                    <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-xl text-4xl ${style.tile}`}>{l.product.emoji}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="truncate text-sm font-bold">{l.product.name}</h3>
                          <p className="text-xs text-stone-500">Size: <b className="text-stone-800">{l.size}</b> · {formatPrice(l.product.price)} each</p>
                        </div>
                        <button type="button" onClick={() => removeLine(l.key)} aria-label="Remove item" className="cursor-pointer text-stone-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-stone-200">
                          <button type="button" onClick={() => setQty(l.key, l.quantity - 1)} className="grid h-8 w-8 cursor-pointer place-items-center hover:bg-stone-50" aria-label="Decrease"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-7 text-center text-sm font-bold">{l.quantity}</span>
                          <button type="button" onClick={() => setQty(l.key, l.quantity + 1)} disabled={l.quantity >= l.product.stock} className="grid h-8 w-8 cursor-pointer place-items-center hover:bg-stone-50 disabled:opacity-30" aria-label="Increase"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <span className="font-extrabold">{formatPrice(l.product.price * l.quantity)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="space-y-2 border-t border-stone-100 px-5 py-4">
              <div className="flex justify-between text-sm text-stone-500"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-sm text-stone-500"><span>Shipping</span><span className={freeShip ? "font-bold text-emerald-600" : ""}>{freeShip ? "FREE" : "₹49 at checkout"}</span></div>
              <button type="button" onClick={onCheckout} className="w-full cursor-pointer rounded-xl bg-stone-900 py-3.5 text-sm font-bold text-white hover:bg-stone-700">
                Proceed to Checkout · {formatPrice(subtotal)}
              </button>
              <p className="text-center text-[11px] text-stone-400">Dummy payment — no real money moves. UPI / Card / COD.</p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
