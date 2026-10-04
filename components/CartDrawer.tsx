import { useEffect } from "react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CATEGORY_STYLES } from "@/lib/catalog";
import { CartIcon, CloseIcon, MinusIcon, PlusIcon, TrashIcon, TruckIcon } from "./icons";

export const FREE_SHIPPING_THRESHOLD = 499;

type Line = { product: Product; quantity: number };

type Props = {
  open: boolean;
  lines: Line[];
  checkingOut: boolean;
  onClose: () => void;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  onDelete: (id: string) => void;
  onCheckout: () => void;
};

export default function CartDrawer({ open, lines, checkingOut, onClose, onAdd, onRemove, onDelete, onCheckout }: Props) {
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

  if (!open) return null;

  const subtotal = lines.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const total = subtotal;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true" aria-label="Shopping cart">
      <div className="absolute inset-0 animate-fade-in bg-violet-950/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md animate-slide-in flex-col border-l border-border bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-orange-50 via-pink-50 to-violet-50 px-6 py-5">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <CartIcon className="h-5 w-5 text-pink-500" /> Your Cart
            <span className="text-sm font-medium text-slate-500">
              ({lines.reduce((n, l) => n + l.quantity, 0)} items)
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-slate-500 transition hover:bg-white hover:text-slate-900"
          >
            <CloseIcon />
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <div className="text-6xl">🛒</div>
            <p className="text-lg font-semibold text-slate-900">Your cart is empty</p>
            <p className="text-sm text-slate-500">Add some comfort to get started.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 cursor-pointer rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition hover:opacity-90"
            >
              Continue shopping
            </button>
          </div>
        ) : (
          <>
            <div className="border-b border-border px-6 py-4">
              <p className="mb-2 flex items-center gap-2 text-xs text-slate-600">
                <TruckIcon className="h-4 w-4 text-pink-500" />
                {remaining > 0 ? (
                  <span>
                    Add <b className="text-pink-600">{formatPrice(remaining)}</b> more for free shipping
                  </span>
                ) : (
                  <span className="font-semibold text-emerald-600">You&apos;ve unlocked free shipping! 🎉</span>
                )}
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 via-pink-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <ul className="flex-1 divide-y divide-border overflow-y-auto px-6">
              {lines.map(({ product, quantity }) => {
                const style = CATEGORY_STYLES[product.category ?? "Other"] ?? CATEGORY_STYLES.Other;
                return (
                  <li key={product._id} className="flex gap-4 py-4">
                    <div className={`grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-white text-4xl shadow-sm ${style.tile}`}>
                      {product.emoji ?? "🎽"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">{product.name}</h3>
                        <button
                          type="button"
                          onClick={() => onDelete(product._id)}
                          aria-label={`Remove ${product.name} from cart`}
                          className="cursor-pointer text-slate-400 transition hover:text-rose-500"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">{formatPrice(product.price)} each</p>
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-border bg-muted/60">
                          <button
                            type="button"
                            onClick={() => onRemove(product._id)}
                            aria-label={`Decrease quantity of ${product.name}`}
                            className="grid h-8 w-8 cursor-pointer place-items-center text-slate-600 hover:text-pink-600"
                          >
                            <MinusIcon className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => onAdd(product._id)}
                            disabled={quantity >= product.stock}
                            aria-label={`Increase quantity of ${product.name}`}
                            className="grid h-8 w-8 cursor-pointer place-items-center text-slate-600 hover:text-pink-600 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <PlusIcon className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <span className="font-bold text-pink-600">{formatPrice(product.price * quantity)}</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="space-y-3 border-t border-border bg-gradient-to-b from-white to-orange-50/60 px-6 py-5">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span>
                <span className={freeShipping ? "font-semibold text-emerald-600" : ""}>
                  {freeShipping ? "FREE" : "Calculated at delivery"}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-lg font-bold text-slate-900">
                <span>Total</span>
                <span className="text-pink-600">{formatPrice(total)}</span>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                disabled={checkingOut}
                className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-violet-600 py-3.5 font-extrabold text-white shadow-lg shadow-pink-500/30 transition hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {checkingOut ? "Placing your order..." : `Checkout · ${formatPrice(total)}`}
              </button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
