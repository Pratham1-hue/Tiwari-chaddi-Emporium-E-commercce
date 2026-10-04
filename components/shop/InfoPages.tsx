"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Order } from "@/lib/types";
import OrderTimeline from "./OrderTimeline";
import PincodeChecker from "./PincodeChecker";

export function ShippingView() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 md:px-6">
      <h2 className="text-2xl font-extrabold">Shipping &amp; Returns</h2>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-extrabold">Shipping policy</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
            <li>Orders ship within <b>24 hours</b> from Jaipur, Rajasthan.</li>
            <li>Metro cities: <b>2–3 days</b>. Rest of India: <b>3–6 days</b> (shown at checkout).</li>
            <li>Shipping is <b>FREE over {formatPrice(499)}</b>, otherwise {formatPrice(49)}.</li>
            <li>COD available on most pincodes (not starting with 9).</li>
            <li>Check your pincode before ordering:</li>
          </ul>
          <div className="mt-3"><PincodeChecker /></div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-extrabold">7-day easy returns</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-stone-600">
            <li>Unworn items with tags, within <b>7 days of delivery</b>.</li>
            <li>Hygiene rule: briefs/trunks must be <b>untried-on over underwear</b> — tried items can&apos;t be resold.</li>
            <li>Request a return from <b>My profile → Order history</b>. Pickup arranged in 2–3 days.</li>
            <li>Refund to source (dummy gateway) or bank in <b>3–5 days</b> after pickup.</li>
            <li>Size exchange is free — choose “wrong size” as the reason.</li>
          </ul>
        </div>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-5">
        <h3 className="font-extrabold">Size help</h3>
        <p className="mt-1 text-sm text-stone-500">Innerwear fits snug. If between sizes, take the larger one. Socks are Free Size (UK 6–10).</p>
      </div>
    </div>
  );
}

export function TrackView({ initialId }: { initialId?: string }) {
  const [id, setId] = useState(initialId || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const track = async () => {
    const clean = id.trim();
    if (clean.length < 8) {
      setMsg("Paste your full order ID (from the success screen or order history).");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      // Try direct id first, else fall back to searching own orders
      let res = await fetch(`/api/orders/${clean}`);
      let data = await res.json();
      if (!data.success) {
        const mine = await fetch("/api/orders").then((r) => r.json());
        const found = mine.orders?.find((o: Order) => o._id.toLowerCase().endsWith(clean.toLowerCase().slice(-8)) || o._id === clean);
        if (found) {
          res = await fetch(`/api/orders/${found._id}`);
          data = await res.json();
        }
      }
      if (data.success) setOrder(data.order);
      else setMsg(data.message || "Order not found. Log in with the account you ordered from.");
    } catch {
      setMsg("Network error.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
      <h2 className="text-2xl font-extrabold">Track your order</h2>
      <div className="mt-4 flex gap-2">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Order ID (e.g. 64f2…a91c)" className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 font-mono text-sm outline-none focus:border-stone-500" />
        <button type="button" onClick={track} disabled={busy} className="cursor-pointer rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-bold text-white disabled:opacity-50">
          {busy ? "…" : "Track"}
        </button>
      </div>
      {msg && <p className="mt-3 rounded-xl bg-stone-100 px-4 py-2 text-sm">{msg}</p>}
      {order && (
        <div className="mt-4 rounded-2xl border border-stone-200 bg-white p-5">
          <p className="text-sm"><b>#{order._id.slice(-8).toUpperCase()}</b> · {formatPrice(order.totalAmount ?? 0)} · {order.payment?.method ?? "—"}</p>
          <p className="mt-0.5 text-xs text-stone-500">Ordered {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN") : "—"} · {order.address?.city ?? ""} — {order.pincode ?? ""}</p>
          <div className="mt-4"><OrderTimeline order={order} /></div>
          <ul className="mt-4 space-y-1 text-sm text-stone-600">
            {(order.items ?? []).map((it, i) => (
              <li key={i}>{it.emoji} {it.name} · Size {it.size} · Qty {it.quantity}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
