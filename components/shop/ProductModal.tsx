"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Product, Review } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { CATEGORY_STYLES, SIZE_GUIDE } from "@/lib/catalog";
import { useShop } from "@/lib/shop-context";
import { Stars } from "./ProductCard";
import PincodeChecker from "./PincodeChecker";

export default function ProductModal({ product, onClose, onBuy }: { product: Product | null; onClose: () => void; onBuy: (p: Product, size: string) => void }) {
  const { addToCart, user } = useShop();
  const [size, setSize] = useState("M");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (!product) return;
    // Sync local state when a different product is opened.
    const sizes = product.sizes?.length ? product.sizes : ["M"];
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSize(sizes.includes("M") ? "M" : sizes[0]);
    setMsg("");
    setTitle("");
    setComment("");
    fetch(`/api/products/${product._id}`)
      .then((r) => r.json())
      .then((d) => d.success && setReviews(d.reviews || []))
      .catch(() => {});
  }, [product]);

  if (!product) return null;
  const style = CATEGORY_STYLES[product.category ?? "Other"] ?? CATEGORY_STYLES.Other;
  const soldOut = product.stock <= 0;

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch(`/api/products/${product._id}/reviews`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, title, comment }),
    });
    const data = await res.json();
    if (data.success) {
      setReviews((prev) => [data.review, ...prev]);
      setMsg("Thanks! Your rating has been recorded.");
    } else {
      setMsg(data.message || "Could not save review.");
    }
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className="fixed inset-0 bg-stone-950/50" onClick={onClose} />
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <button type="button" onClick={onClose} aria-label="Close details" className="absolute right-3 top-3 z-10 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-white shadow hover:bg-stone-100">
          <X className="h-5 w-5" />
        </button>
        <div className="grid md:grid-cols-2">
          <div className={`flex min-h-64 items-center justify-center p-10 ${style.tile}`}>
            <span className="text-9xl">{product.emoji}</span>
          </div>
          <div className="p-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-stone-400">{product.category} · {product.fabric}</p>
            <h2 className="mt-1 text-2xl font-extrabold text-stone-900">{product.name}</h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-stone-500">
              <Stars value={product.rating ?? 4} />
              <span className="font-bold text-stone-800">{(product.rating ?? 4).toFixed(1)}</span>
              <span>· {(product.reviews ?? 0).toLocaleString("en-IN")} ratings</span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{formatPrice(product.price)}</span>
              {product.mrp && <span className="text-stone-400 line-through">{formatPrice(product.mrp)}</span>}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">{product.description}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Select size</span>
                <button type="button" onClick={() => setShowGuide((v) => !v)} className="cursor-pointer text-xs font-semibold text-stone-500 underline">Size guide</button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(product.sizes?.length ? product.sizes : ["M"]).map((s) => (
                  <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={s === size}
                    className={`min-w-11 cursor-pointer rounded-lg border px-3 py-2 text-sm font-bold ${s === size ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 hover:border-stone-400"}`}>
                    {s}
                  </button>
                ))}
              </div>
              {showGuide && (
                <table className="mt-3 w-full overflow-hidden rounded-lg border border-stone-200 text-xs">
                  <thead><tr className="bg-stone-50 text-left text-stone-500"><th className="px-3 py-2">Size</th><th className="px-3 py-2">Waist</th><th className="px-3 py-2">Chest</th></tr></thead>
                  <tbody>
                    {SIZE_GUIDE.map((r) => (
                      <tr key={r.size} className={`border-t border-stone-100 ${r.size === size ? "bg-amber-50 font-bold" : ""}`}>
                        <td className="px-3 py-1.5">{r.size}</td><td className="px-3 py-1.5">{r.waist}</td><td className="px-3 py-1.5">{r.chest}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <button type="button" disabled={soldOut} onClick={() => { addToCart(product, size); onClose(); }}
                className="flex-1 cursor-pointer rounded-xl border border-stone-900 py-3 text-sm font-bold hover:bg-stone-900 hover:text-white disabled:opacity-30">
                {soldOut ? "Out of Stock" : "Add to Cart"}
              </button>
              <button type="button" disabled={soldOut} onClick={() => onBuy(product, size)}
                className="flex-1 cursor-pointer rounded-xl bg-stone-900 py-3 text-sm font-bold text-white hover:bg-stone-700 disabled:opacity-30">
                Buy Now
              </button>
            </div>

            <div className="mt-4"><PincodeChecker /></div>
          </div>
        </div>

        <div className="border-t border-stone-100 px-6 py-5">
          <h3 className="font-extrabold">Ratings &amp; reviews ({reviews.length})</h3>
          {user ? (
            <form onSubmit={submitReview} className="mt-3 rounded-xl bg-stone-50 p-4">
              <p className="text-sm font-bold">Rate this product</p>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setRating(s)} aria-label={`${s} star`}
                    className={`cursor-pointer text-2xl ${s <= rating ? "text-amber-400" : "text-stone-300"}`}>★</button>
                ))}
              </div>
              <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Review headline (optional)" className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-500" />
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="What did you like? Fit, fabric, delivery…" rows={2} className="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-500" />
              <button type="submit" className="mt-2 cursor-pointer rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-700">Submit review</button>
              {msg && <p className="mt-2 text-xs font-medium text-stone-600">{msg}</p>}
            </form>
          ) : (
            <p className="mt-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-500">Log in to write a rating for this product.</p>
          )}
          <ul className="mt-4 space-y-3">
            {reviews.map((r) => (
              <li key={r._id} className="rounded-xl border border-stone-100 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <Stars value={r.rating} className="h-3 w-3" />
                  <b>{r.title || `${r.rating}/5`}</b>
                  <span className="ml-auto text-xs text-stone-400">{r.userName} · {new Date(r.createdAt).toLocaleDateString("en-IN")}</span>
                </div>
                {r.comment && <p className="mt-1 text-sm text-stone-600">{r.comment}</p>}
              </li>
            ))}
            {reviews.length === 0 && <li className="text-sm text-stone-400">No reviews yet — be the first to rate it.</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
