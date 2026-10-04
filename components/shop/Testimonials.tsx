"use client";

import { TESTIMONIALS } from "@/lib/catalog";
import { Stars } from "./ProductCard";

export default function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Customer reviews</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 md:text-3xl">Loved across India</h2>
        </div>
        <span className="hidden rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white md:block">4.7 ★ average · 6,000+ ratings</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((t) => (
          <figure key={t.name} className="flex flex-col rounded-2xl border border-stone-200 bg-white p-5">
            <Stars value={t.rating} />
            <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-stone-600">“{t.text}”</blockquote>
            <figcaption className="mt-4 border-t border-stone-100 pt-3 text-sm">
              <b className="text-stone-900">{t.name}</b> <span className="text-stone-400">· {t.city}</span>
              <span className="block text-xs text-stone-400">Verified buyer · {t.product}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
