"use client";

import { useCallback, useEffect, useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Order, Product } from "@/lib/types";

const STATUSES = ["ALL", "PLACED", "PACKED", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "RETURN_REQUESTED", "CANCELLED", "RETURNED"];

type AdminStats = {
  revenue: number;
  orderCount: number;
  productCount: number;
  userCount: number;
  ordersByStatus: { _id: string; count: number }[];
  recentOrders: Order[];
  lowStock: Product[];
};

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("ALL");
  const [msg, setMsg] = useState("");
  const [newProduct, setNewProduct] = useState({ name: "", price: "", mrp: "", stock: "50", category: "Chaddi", emoji: "🎽", description: "" });
  const [adding, setAdding] = useState(false);

  const load = useCallback(async () => {
    const [s, o] = await Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch(`/api/admin/orders?status=${filter}`).then((r) => r.json()),
    ]);
    if (s.success) setStats(s.stats);
    if (o.success) setOrders(o.orders);
    if (!s.success) setMsg(s.message || "Admin access required. Log in as admin@chaddi.com / admin123.");
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const setStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (data.success) load();
    else setMsg(data.message);
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newProduct.name,
        price: Number(newProduct.price),
        mrp: newProduct.mrp ? Number(newProduct.mrp) : undefined,
        stock: Number(newProduct.stock),
        category: newProduct.category,
        emoji: newProduct.emoji,
        description: newProduct.description,
      }),
    });
    const data = await res.json();
    setAdding(false);
    if (data.success) {
      setMsg(`Product "${data.product.name}" added.`);
      setNewProduct({ name: "", price: "", mrp: "", stock: "50", category: "Chaddi", emoji: "🎽", description: "" });
      load();
    } else {
      setMsg(data.message);
    }
  };

  if (!stats) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center">
        <p className="font-bold">Loading admin dashboard…</p>
        {msg && <p className="mt-2 text-sm text-red-600">{msg}</p>}
        <p className="mt-2 text-xs text-stone-400">Log in as <b>admin@chaddi.com / admin123</b> to manage the store.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {msg && <p className="rounded-xl bg-stone-100 px-4 py-2 text-sm">{msg}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Revenue", formatPrice(stats.revenue)],
          ["Orders", stats.orderCount],
          ["Products", stats.productCount],
          ["Customers", stats.userCount],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-stone-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-400">{k}</p>
            <p className="mt-1 text-2xl font-extrabold">{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <h3 className="font-extrabold">Orders by status</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {stats.ordersByStatus.map((s) => (
            <span key={s._id} className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold">{s._id}: {s.count}</span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-stone-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-extrabold">All orders</h3>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="ml-auto cursor-pointer rounded-lg border border-stone-200 px-3 py-1.5 text-sm">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">
          {orders.map((o) => (
            <div key={o._id} className="flex flex-wrap items-center gap-2 rounded-xl border border-stone-100 px-3 py-2 text-sm">
              <span className="font-mono text-xs font-bold">#{String(o._id).slice(-8).toUpperCase()}</span>
              <span className="text-stone-500">{o.userEmail} · {o.items.length} items · <b className="text-stone-900">{formatPrice(o.totalAmount)}</b></span>
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-bold">{o.status}</span>
              <select
                value={o.status}
                onChange={(e) => setStatus(o._id, e.target.value)}
                className="ml-auto cursor-pointer rounded-lg border border-stone-200 px-2 py-1 text-xs"
              >
                {STATUSES.filter((s) => s !== "ALL").map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          ))}
          {orders.length === 0 && <p className="text-sm text-stone-400">No orders in this status.</p>}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <form onSubmit={addProduct} className="rounded-2xl border border-stone-200 bg-white p-4">
          <h3 className="font-extrabold">Add a product</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} required placeholder="Product name" className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-500" />
            <input value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} required type="number" min="1" placeholder="Price ₹" className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={newProduct.mrp} onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })} type="number" min="0" placeholder="MRP ₹ (optional)" className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} type="number" min="0" placeholder="Stock" className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="rounded-lg border border-stone-200 px-3 py-2 text-sm">
              {["Chaddi", "Baniyan", "Thermals", "Socks", "Combos", "Other"].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input value={newProduct.emoji} onChange={(e) => setNewProduct({ ...newProduct, emoji: e.target.value })} placeholder="Emoji 🎽" className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Short description" rows={2} className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
          </div>
          <button type="submit" disabled={adding} className="mt-3 w-full cursor-pointer rounded-xl bg-stone-900 py-2.5 text-sm font-bold text-white disabled:opacity-50">
            {adding ? "Adding…" : "Add product"}
          </button>
        </form>

        <div className="rounded-2xl border border-stone-200 bg-white p-4">
          <h3 className="font-extrabold">Low stock alerts</h3>
          <ul className="mt-3 space-y-2">
            {stats.lowStock.map((p) => (
              <li key={p._id} className="flex items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm">
                <span className="text-xl">{p.emoji}</span>
                <span className="flex-1 font-semibold">{p.name}</span>
                <span className="font-bold text-red-700">{p.stock} left</span>
              </li>
            ))}
            {stats.lowStock.length === 0 && <li className="text-sm text-stone-400">All stocked up.</li>}
          </ul>
          <h3 className="mt-4 font-extrabold">Latest orders</h3>
          <ul className="mt-2 space-y-1 text-sm text-stone-500">
            {stats.recentOrders.map((o) => (
              <li key={o._id}>#{String(o._id).slice(-8).toUpperCase()} · {formatPrice(o.totalAmount)} · {o.status}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
