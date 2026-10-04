/** Dummy serviceability logic (no external API). */
export function checkPincode(pincode) {
  const code = String(pincode || '').trim();
  if (!/^\d{6}$/.test(code)) {
    return { serviceable: false, reason: 'Enter a valid 6-digit pincode.' };
  }
  if (code.startsWith('0')) {
    return { serviceable: false, reason: 'Sorry, we do not deliver to this pincode yet.' };
  }
  // Deterministic ETA: 2–6 days based on digits, metro pincodes faster.
  const metro = ['110', '400', '560', '600', '700', '500'].some((p) => code.startsWith(p));
  const sum = code.split('').reduce((a, d) => a + Number(d), 0);
  const etaDays = metro ? 2 + (sum % 2) : 3 + (sum % 4);
  return { serviceable: true, etaDays, codAvailable: !code.startsWith('9') };
}

export function shippingFor(subtotal) {
  const FREE_THRESHOLD = 499;
  if (subtotal >= FREE_THRESHOLD) return { fee: 0, free: true };
  return { fee: 49, free: false };
}
