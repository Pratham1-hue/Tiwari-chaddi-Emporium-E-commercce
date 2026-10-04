"use client";

import { useState } from "react";
import { useShop } from "@/lib/shop-context";
import { CartIcon } from "../icons";
import AuthModal from "./AuthModal";

export default function Header({
  query,
  onQuery,
  onCart,
  onNavigate,
}: {
  query: string;
  onQuery: (q: string) => void;
  onCart: () => void;
  onNavigate: (view: string) => void;
}) {
  const { user, cartCount, logout } = useShop();
  const [authOpen, setAuthOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <div className="bg-stone-900 px-4 py-1.5 text-center text-[11px] font-medium tracking-wide text-stone-200 md:text-xs">
        Free shipping over ₹499 · 7-day easy returns · COD available
      </div>
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:gap-6 md:px-6">
          <button type="button" onClick={() => onNavigate("home")} className="flex cursor-pointer items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-stone-900 text-lg">🩳</span>
            <span className="text-left leading-tight">
              <span className="block text-[15px] font-extrabold tracking-tight text-stone-900">Chaddi &amp; Baniyan</span>
              <span className="block text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-400">Emporium · Est. 2026</span>
            </span>
          </button>

          <div className="hidden flex-1 md:block">
            <input
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder="Search briefs, vests, thermals…"
              className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm outline-none placeholder:text-stone-400 focus:border-stone-400 focus:bg-white"
            />
          </div>

          <nav className="ml-auto flex items-center gap-1 text-sm font-medium text-stone-600 md:gap-2">
            <button type="button" onClick={() => onNavigate("home")} className="hidden cursor-pointer rounded-full px-3 py-2 hover:bg-stone-100 lg:block">Shop</button>
            <button type="button" onClick={() => onNavigate("track")} className="hidden cursor-pointer rounded-full px-3 py-2 hover:bg-stone-100 lg:block">Track Order</button>
            <button type="button" onClick={() => onNavigate("shipping")} className="hidden cursor-pointer rounded-full px-3 py-2 hover:bg-stone-100 lg:block">Shipping &amp; Returns</button>
            {user?.role === "admin" && (
              <button type="button" onClick={() => onNavigate("admin")} className="cursor-pointer rounded-full bg-stone-900 px-3 py-2 text-white hover:bg-stone-700">Admin</button>
            )}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-stone-200 px-3 py-2 hover:bg-stone-50"
                >
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-stone-900 text-[11px] font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="hidden max-w-24 truncate text-sm font-semibold md:block">{user.name.split(" ")[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl">
                    {[
                      { label: "My profile & orders", view: "account" },
                      { label: "Track order", view: "track" },
                      { label: "Shipping & returns", view: "shipping" },
                    ].map((m) => (
                      <button
                        key={m.view}
                        type="button"
                        onClick={() => { onNavigate(m.view); setMenuOpen(false); }}
                        className="block w-full cursor-pointer px-4 py-2.5 text-left text-sm hover:bg-stone-50"
                      >
                        {m.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => { logout(); setMenuOpen(false); }}
                      className="block w-full cursor-pointer border-t border-stone-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthOpen(true)}
                className="cursor-pointer rounded-full border border-stone-900 px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-900 hover:text-white"
              >
                Login
              </button>
            )}
            <button
              type="button"
              onClick={onCart}
              aria-label={`Open cart, ${cartCount} items`}
              className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-stone-900 text-white hover:bg-stone-700"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </nav>
        </div>
        <div className="border-t border-stone-100 px-4 py-2 md:hidden">
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search briefs, vests, thermals…"
            className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm outline-none focus:border-stone-400"
          />
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
