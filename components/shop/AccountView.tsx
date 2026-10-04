"use client";

import { useState } from "react";
import { useShop } from "@/lib/shop-context";
import type { Address } from "@/lib/types";
import OrdersPanel from "./OrdersPanel";

const EMPTY: Address = { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function AccountView() {
  const { user, addresses, saveAddress, deleteAddress, logout } = useShop();
  const [form, setForm] = useState<Address>(EMPTY);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-lg font-extrabold">Please log in</p>
        <p className="text-sm text-stone-500">Use the Login button in the header. Your profile, addresses and orders will appear here.</p>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const res = await saveAddress(form);
    setBusy(false);
    if (res.ok) {
      setForm(EMPTY);
      setMsg("Address saved.");
    } else {
      setMsg(res.message || "Could not save.");
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 md:px-6">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-stone-200 bg-white p-5">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-stone-900 text-xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
        <div className="flex-1">
          <h2 className="text-xl font-extrabold">{user.name}</h2>
          <p className="text-sm text-stone-500">{user.email} · {user.role === "admin" ? "Administrator" : "Customer"}</p>
        </div>
        <button type="button" onClick={logout} className="cursor-pointer rounded-xl border border-stone-200 px-4 py-2 text-sm font-semibold hover:bg-stone-50">Log out</button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white p-5">
          <h3 className="font-extrabold">Saved addresses ({addresses.length})</h3>
          <ul className="mt-3 space-y-2">
            {addresses.map((a) => (
              <li key={a._id} className="flex items-start justify-between gap-2 rounded-xl bg-stone-50 p-3 text-sm">
                <span><b>{a.label}</b> · {a.fullName}, {a.phone}<br /><span className="text-stone-500">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} — {a.pincode}</span></span>
                <button type="button" onClick={() => a._id && deleteAddress(a._id)} className="cursor-pointer text-xs font-bold text-red-600 hover:underline">Remove</button>
              </li>
            ))}
            {addresses.length === 0 && <li className="text-sm text-stone-400">No addresses yet — add your first below.</li>}
          </ul>
          <form onSubmit={submit} className="mt-4 grid grid-cols-2 gap-2">
            <select value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} className="rounded-lg border border-stone-200 px-3 py-2 text-sm">
              {["Home", "Work", "Parents", "Other"].map((l) => <option key={l}>{l}</option>)}
            </select>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" required className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Full name" required className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} placeholder="House / street" required className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} placeholder="Landmark (optional)" className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="City" required className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} placeholder="State" required className="rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })} placeholder="Pincode" required className="col-span-2 rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none" />
            <button type="submit" disabled={busy} className="col-span-2 cursor-pointer rounded-xl bg-stone-900 py-2.5 text-sm font-bold text-white disabled:opacity-50">{busy ? "Saving…" : "Save address"}</button>
          </form>
          {msg && <p className="mt-2 text-sm text-stone-600">{msg}</p>}
        </div>

        <div>
          <h3 className="mb-3 font-extrabold">Order history</h3>
          <OrdersPanel />
        </div>
      </div>
    </div>
  );
}
