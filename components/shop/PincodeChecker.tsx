"use client";

import { useState } from "react";
import { Truck } from "lucide-react";

export default function PincodeChecker({ compact = false }: { compact?: boolean }) {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<null | { ok: boolean; text: string }>(null);
  const [busy, setBusy] = useState(false);

  const check = async () => {
    if (code.trim().length !== 6) {
      setResult({ ok: false, text: "Enter a 6-digit pincode." });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/pincode?pincode=${encodeURIComponent(code.trim())}`);
      const data = await res.json();
      if (data.serviceable) {
        setResult({ ok: true, text: `Delivery in ${data.etaDays} days · COD ${data.codAvailable ? "available" : "not available"}` });
      } else {
        setResult({ ok: false, text: data.reason || "Not serviceable." });
      }
    } catch {
      setResult({ ok: false, text: "Could not check right now." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "" : "rounded-xl border border-stone-200 bg-stone-50 p-3"}>
      <div className="flex items-center gap-2">
        <Truck className="h-4 w-4 text-stone-500" />
        <span className="text-xs font-bold uppercase tracking-wide text-stone-500">Delivery check</span>
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="Pincode"
          inputMode="numeric"
          className="w-28 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-stone-500"
        />
        <button type="button" onClick={check} disabled={busy} className="cursor-pointer rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-50">
          {busy ? "…" : "Check"}
        </button>
      </div>
      {result && <p className={`mt-2 text-xs font-medium ${result.ok ? "text-emerald-700" : "text-red-600"}`}>{result.text}</p>}
    </div>
  );
}
