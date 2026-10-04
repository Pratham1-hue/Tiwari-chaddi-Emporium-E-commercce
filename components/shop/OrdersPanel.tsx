"use client";

import { useState } from "react";
import { Package, RotateCcw } from "lucide-react";
import { useShop } from "@/lib/shop-context";
import { formatPrice } from "@/lib/format";
import OrderTimeline from "./OrderTimeline";

export default function OrdersPanel() {
  const { orders, ordersLoading, refreshOrders, user } = useShop();
  const [openId, setOpenId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  if (!user) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <Package className="mx-auto h-10 w-10 text-stone-300" />
        <p className="mt-2 font-bold">Log in to see your orders</p>
        <p className="text-sm text-stone-500">Your past orders, tracking and returns live here.</p>
      </div>
    );
  }

  if (ordersLoading) return <p className="text-sm text-stone-500">Loading orders…</p>;

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <Package className="mx-auto h-10 w-10 text-stone-300" />
        <p className="mt-2 font-bold">No orders yet</p>
        <p className="text-sm text-stone-500">When you place an order it will appear here with live tracking.</p>
      </div>
    );
  }

  const requestReturn = async (id: string) => {
    if (!reason.trim()) {
      setMsg("Please enter a return reason.");
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/orders/${id}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    const data = await res.json();
    setBusy(false);
    if (data.success) {
      setMsg("Return requested successfully.");
      setReason("");
      refreshOrders();
    } else {
      setMsg(data.message || "Return failed.");
    }
  };

  return (
    <div className="space-y-3">
      {msg && <p className="rounded-xl bg-stone-100 px-4 py-2 text-sm">{msg}</p>}
      {orders.map((o) => {
        const open = openId === o._id;
        return (
          <div key={o._id} className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
            <button type="button" onClick={() => setOpenId(open ? null : o._id)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left hover:bg-stone-50">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-xl">📦</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-bold">#{o._id.slice(-8).toUpperCase()} · {(o.items?.length ?? 0)} item(s) · {formatPrice(o.totalAmount ?? 0)}</span>
                <span className="block text-xs text-stone-500">{o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : "—"} · {o.payment?.method ?? "—"} · {(o.status ?? "").replaceAll("_", " ")}</span>
              </span>
              <span className="text-xs font-bold text-stone-400">{open ? "▲" : "▼"}</span>
            </button>
            {open && (
              <div className="space-y-3 border-t border-stone-100 px-4 py-4">
                <OrderTimeline order={o} />
                <ul className="divide-y divide-stone-100 rounded-xl border border-stone-100">
                  {(o.items ?? []).map((it, i) => (
                    <li key={i} className="flex items-center gap-3 px-3 py-2 text-sm">
                      <span className="text-2xl">{it.emoji}</span>
                      <span className="flex-1"><b>{it.name}</b> <span className="text-stone-500">· Size {it.size} · Qty {it.quantity}</span></span>
                      <span className="font-bold">{formatPrice((it.priceAtPurchase ?? 0) * (it.quantity ?? 0))}</span>
                    </li>
                  ))}
                </ul>
                <div className="grid gap-2 text-xs text-stone-500 md:grid-cols-3">
                  <div className="rounded-xl bg-stone-50 p-3"><b className="text-stone-700">Deliver to</b><br />{o.address?.fullName ?? "—"}, {o.address?.line1 ?? ""}, {o.address?.city ?? ""}{o.address?.pincode ? ` — ${o.address.pincode}` : ""}<br />{o.address?.phone ?? ""}</div>
                  <div className="rounded-xl bg-stone-50 p-3"><b className="text-stone-700">Payment (dummy)</b><br />{o.payment?.method ?? "—"} · {o.payment?.transactionId ?? "—"}<br />{o.payment?.status ?? ""}</div>
                  <div className="rounded-xl bg-stone-50 p-3"><b className="text-stone-700">History</b><br />{(o.statusHistory ?? []).map((h) => `${h.status} (${h.at ? new Date(h.at).toLocaleDateString("en-IN") : ""})`).join(" → ") || "—"}</div>
                </div>
                {["DELIVERED", "SHIPPED", "OUT_FOR_DELIVERY"].includes(o.status) && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="flex items-center gap-2 text-sm font-bold text-amber-800"><RotateCcw className="h-4 w-4" /> Need to return this order?</p>
                    <div className="mt-2 flex gap-2">
                      <input value={openId === o._id ? reason : reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. wrong size)" className="flex-1 rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none" />
                      <button type="button" disabled={busy} onClick={() => requestReturn(o._id)} className="cursor-pointer rounded-lg bg-stone-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">
                        {busy ? "…" : "Request return"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
