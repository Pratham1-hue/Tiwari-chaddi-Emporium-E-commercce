"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CATEGORY_STYLES } from "@/lib/catalog";
import { useShop } from "@/lib/shop-context";

export function Stars({ value, className = "h-3.5 w-3.5" }: { value: number; className?: string }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"}`} />
      ))}
    </span>
  );
}

export default function ProductCard({ product, onDetails }: { product: Product; onDetails: (p: Product) => void }) {
  const { addToCart } = useShop();
  const sizes = product.sizes?.length ? product.sizes : ["M"];
  const [size, setSize] = useState(sizes.includes("M") ? "M" : sizes[0]);
  const style = CATEGORY_STYLES[product.category ?? "Other"] ?? CATEGORY_STYLES.Other;
  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 5;
  const discount = product.mrp && product.mrp > product.price ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-200">
      <button type="button" onClick={() => onDetails(product)} className={`relative flex aspect-[4/3] cursor-pointer items-center justify-center ${style.tile}`} aria-label={`View ${product.name}`}>
        <span className={`text-7xl transition-transform duration-300 group-hover:scale-110 ${soldOut ? "opacity-40 grayscale" : ""}`}>{product.emoji ?? "🎽"}</span>
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {discount > 0 && !soldOut && (
            <span className="rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">{discount}% OFF</span>
          )}
          {product.badge && !soldOut && (
            <span className="rounded-full bg-stone-900 px-2.5 py-1 text-[11px] font-semibold text-white">{product.badge}</span>
          )}
        </div>
        {soldOut && (
          <span className="absolute inset-0 grid place-items-center bg-white/60">
            <span className="rounded-full bg-stone-900 px-4 py-1.5 text-sm font-bold text-white">Sold Out</span>
          </span>
        )}
      </button>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{product.category}</span>
          <span className="flex items-center gap-1.5 text-xs text-stone-500">
            <Stars value={product.rating ?? 4} />
            <span className="font-semibold text-stone-700">{(product.rating ?? 4).toFixed(1)}</span>
            <span>({(product.reviews ?? 0).toLocaleString("en-IN")})</span>
          </span>
        </div>
        <button type="button" onClick={() => onDetails(product)} className="mt-1 cursor-pointer text-left text-[15px] font-bold leading-snug text-stone-900 hover:underline">
          {product.name}
        </button>
        <p className="mt-0.5 line-clamp-1 text-xs text-stone-500">{product.fabric}</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-extrabold text-stone-900">{formatPrice(product.price)}</span>
          {product.mrp && <span className="text-sm text-stone-400 line-through">{formatPrice(product.mrp)}</span>}
          <span className={`ml-auto text-xs font-medium ${soldOut ? "text-red-600" : low ? "text-orange-600" : "text-emerald-600"}`}>
            {soldOut ? "Out of stock" : low ? `Only ${product.stock} left` : "In stock"}
          </span>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Choose size">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              aria-pressed={s === size}
              className={`min-w-9 cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-bold ${s === size ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-600 hover:border-stone-400"}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            disabled={soldOut}
            onClick={() => addToCart(product, size)}
            className="flex-1 cursor-pointer rounded-xl border border-stone-900 py-2.5 text-sm font-bold text-stone-900 hover:bg-stone-900 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-stone-900"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={() => onDetails(product)}
            className="cursor-pointer rounded-xl bg-stone-100 px-4 py-2.5 text-sm font-semibold text-stone-700 hover:bg-stone-200"
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
}
