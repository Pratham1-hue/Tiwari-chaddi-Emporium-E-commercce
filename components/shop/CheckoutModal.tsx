"use client";

import { useMemo, useState } from "react";
import { X, CreditCard, Smartphone, Banknote, MapPin, CheckCircle2, Loader2 } from "lucide-react";
import { useShop } from "@/lib/shop-context";
import type { Address, Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";

type Props = {
  open: boolean;
  onClose: () => void;
  productsById: Map<string, Product>;
  onSuccess: (orderId: string) => void;
};

const EMPTY: Address = { label: "Home", fullName: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "" };

export default function CheckoutModal({ open, onClose, productsById, onSuccess }: Props) {
  const { cart, user, addresses, saveAddress, clearCart, refreshOrders } = useShop();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedAddr, setSelectedAddr] = useState<string | null>(null);
  const [form, setForm] = useState<Address>(EMPTY);
  const [savingAddr, setSavingAddr] = useState(false);
  const [method, setMethod] = useState<"UPI" | "CARD" | "COD">("UPI");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | { orderId: string; txn: string; total: number; eta: number }>(null);

  const lines = useMemo(
    () =>
      cart.flatMap((l) => {
        const product = productsById.get(l.productId);
        return product ? [{ ...l, product }] : [];
      }),
    [cart, productsById]
  );
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.quantity, 0);
  const shipping = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal + shipping;

  if (!open) return null;

  const chosenAddress: Address | null =
    addresses.find((a) => a._id === selectedAddr) ??
    (addresses.length === 0 || selectedAddr === "new" ? null : addresses[0]);

  const useNewAddress = selectedAddr === "new" || addresses.length === 0;

  const startPlace = async () => {
    setError("");
    const addr: Address | null = useNewAddress ? form : chosenAddress;
    if (!addr) {
      setError("Please add a delivery address.");
      return;
    }
    if (method === "UPI" && !upiId.includes("@")) {
      setError("Enter a valid UPI ID (e.g. name@upi). This is a dummy payment — anything valid-looking works.");
      return;
    }
    if (method === "CARD") {
      if (card.number.replace(/\D/g, "").length < 12 || !card.expiry || card.cvv.length < 3) {
        setError("Enter a valid dummy card (any 12+ digit number, any expiry/CVV). No real charge happens.");
        return;
      }
    }
    setPlacing(true);
    // Brief dummy-gateway animation
    await new Promise((r) => setTimeout(r, 1600));
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, quantity: l.quantity, size: l.size })),
          address: addr,
          paymentMethod: method,
          cardLast4: method === "CARD" ? card.number.replace(/\D/g, "").slice(-4) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message || "Order failed.");
        setPlacing(false);
        return;
      }
      setDone({ orderId: data.orderId, txn: data.transactionId, total: data.totalAmount, eta: data.etaDays });
      setStep(3);
      clearCart();
      refreshOrders();
    } catch {
      setError("Network error. Please retry.");
    } finally {
      setPlacing(false);
    }
  };

  const saveNew = async () => {
    if (!user) return true; // guests can use the form without saving
    setSavingAddr(true);
    const res = await saveAddress(form);
    setSavingAddr(false);
    if (!res.ok) {
      setError(res.message || "Could not save address.");
      return false;
    }
    setForm(EMPTY);
    return true;
  };

  return (
    <div className="fixed inset-0 z-[75] overflow-y-auto p-4" role="dialog" aria-modal="true" aria-label="Checkout">
      <div className="fixed inset-0 bg-stone-950/50" onClick={placing ? undefined : onClose} />
      <div className="relative mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-stone-100 px-6 py-4">
          <h2 className="font-extrabold">Checkout <span className="ml-2 text-xs font-semibold text-stone-400">Step {step} of 3</span></h2>
          {!placing && (
            <button type="button" onClick={onClose} aria-label="Close checkout" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full hover:bg-stone-100">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex gap-2 px-6 pt-4 text-xs font-bold">
          {["Address", "Payment", "Done"].map((s, i) => (
            <div key={s} className={`flex-1 rounded-full py-1.5 text-center ${step === i + 1 ? "bg-stone-900 text-white" : step > i + 1 ? "bg-emerald-100 text-emerald-700" : "bg-stone-100 text-stone-400"}`}>
              {i + 1}. {s}
            </div>
          ))}
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {step === 1 && (
            <div>
              {!user && (
                <p className="mb-3 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Checking out as <b>guest</b>. <b>Log in</b> from the header to save addresses and see orders in your profile.
                </p>
              )}
              {user && addresses.length > 0 && (
                <div className="space-y-2">
                  {addresses.map((a) => (
                    <label key={a._id} className={`flex cursor-pointer gap-3 rounded-xl border p-3 text-sm ${selectedAddr === a._id || (!selectedAddr && addresses[0]._id === a._id) ? "border-stone-900 bg-stone-50" : "border-stone-200"}`}>
                      <input type="radio" name="addr" checked={selectedAddr === a._id || (!selectedAddr && addresses[0]._id === a._id)} onChange={() => setSelectedAddr(a._id!)} className="mt-1" />
                      <span>
                        <b>{a.label}</b> · {a.fullName}, {a.phone}<br />
                        <span className="text-stone-500">{a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} — {a.pincode}</span>
                      </span>
                    </label>
                  ))}
                  <button type="button" onClick={() => setSelectedAddr("new")} className="flex w-full cursor-pointer items-center gap-2 rounded-xl border border-dashed border-stone-300 p-3 text-sm font-semibold text-stone-600 hover:border-stone-500">
                    <MapPin className="h-4 w-4" /> Use a new address
                  </button>
                </div>
              )}

              {(useNewAddress || !user) && (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {(["fullName", "phone", "line1", "line2", "city", "state", "pincode"] as const).map((f) => (
                    <input
                      key={f}
                      value={form[f] || ""}
                      onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                      placeholder={{ fullName: "Full name", phone: "10-digit phone", line1: "House / street", line2: "Landmark (optional)", city: "City", state: "State", pincode: "Pincode" }[f]}
                      className={`rounded-lg border border-stone-200 px-3 py-2 text-sm outline-none focus:border-stone-500 ${["line1", "line2"].includes(f) ? "col-span-2" : ""}`}
                    />
                  ))}
                  {user && (
                    <button type="button" onClick={saveNew} disabled={savingAddr} className="col-span-2 cursor-pointer rounded-lg bg-stone-100 py-2 text-sm font-semibold hover:bg-stone-200 disabled:opacity-50">
                      {savingAddr ? "Saving…" : "Save to my address book"}
                    </button>
                  )}
                </div>
              )}

              {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <button
                type="button"
                onClick={() => {
                  const addr = useNewAddress ? form : chosenAddress;
                  if (!addr || !addr.fullName || !addr.phone || !addr.line1 || !addr.city || !addr.state || !addr.pincode) {
                    setError("Please complete the delivery address.");
                    return;
                  }
                  setError("");
                  setStep(2);
                }}
                className="mt-4 w-full cursor-pointer rounded-xl bg-stone-900 py-3 text-sm font-bold text-white hover:bg-stone-700"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { m: "UPI", icon: Smartphone, hint: "GPay / PhonePe" },
                  { m: "CARD", icon: CreditCard, hint: "Debit / Credit" },
                  { m: "COD", icon: Banknote, hint: "Pay on delivery" },
                ].map(({ m, icon: Icon, hint }) => (
                  <button key={m} type="button" onClick={() => setMethod(m as "UPI" | "CARD" | "COD")}
                    className={`cursor-pointer rounded-xl border p-3 text-center ${method === m ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 hover:border-stone-400"}`}>
                    <Icon className="mx-auto h-5 w-5" />
                    <div className="mt-1 text-sm font-bold">{m}</div>
                    <div className={`text-[11px] ${method === m ? "text-stone-300" : "text-stone-400"}`}>{hint}</div>
                  </button>
                ))}
              </div>

              {method === "UPI" && (
                <input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@upi (dummy — no real debit)" className="mt-3 w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-500" />
              )}
              {method === "CARD" && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <input value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16) })} placeholder="Card number (dummy)" inputMode="numeric" className="col-span-3 rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-500" />
                  <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="MM/YY" className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-500" />
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })} placeholder="CVV" inputMode="numeric" className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-500" />
                  <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} placeholder="Name on card" className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-stone-500" />
                </div>
              )}
              {method === "COD" && (
                <p className="mt-3 rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-600">Pay in cash/UPI when your order arrives. Please keep exact change ready.</p>
              )}
              <p className="mt-2 text-[11px] text-stone-400">Dummy gateway: test freely, no real money moves. A transaction ID like UPI_… is generated per order.</p>

              <div className="mt-4 rounded-xl bg-stone-50 p-3 text-sm">
                <div className="flex justify-between text-stone-500"><span>Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items)</span><span>{formatPrice(subtotal)}</span></div>
                <div className="flex justify-between text-stone-500"><span>Shipping</span><span>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span></div>
                <div className="mt-1 flex justify-between border-t border-stone-200 pt-2 font-extrabold"><span>Total</span><span>{formatPrice(total)}</span></div>
              </div>

              {error && <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setStep(1)} disabled={placing} className="cursor-pointer rounded-xl border border-stone-200 px-5 py-3 text-sm font-semibold hover:bg-stone-50 disabled:opacity-50">Back</button>
                <button type="button" onClick={startPlace} disabled={placing || lines.length === 0} className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-bold text-white hover:bg-stone-700 disabled:opacity-50">
                  {placing ? <><Loader2 className="h-4 w-4 animate-spin" /> Contacting dummy bank…</> : `Pay ${formatPrice(total)} (${method})`}
                </button>
              </div>
            </div>
          )}

          {step === 3 && done && (
            <div className="py-4 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <h3 className="mt-3 text-xl font-extrabold">Order placed!</h3>
              <p className="mt-1 text-sm text-stone-500">Order <b className="text-stone-800">{done.orderId.slice(-8).toUpperCase()}</b> · Txn <b className="font-mono text-xs">{done.txn}</b></p>
              <p className="mt-1 text-sm text-stone-500">Arriving in ~{done.eta} days · Total {formatPrice(done.total)}</p>
              <div className="mt-5 flex gap-2">
                <button type="button" onClick={() => { onSuccess(done.orderId); }} className="flex-1 cursor-pointer rounded-xl bg-stone-900 py-3 text-sm font-bold text-white hover:bg-stone-700">
                  Track this order
                </button>
                <button type="button" onClick={onClose} className="flex-1 cursor-pointer rounded-xl border border-stone-200 py-3 text-sm font-semibold hover:bg-stone-50">
                  Continue shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
