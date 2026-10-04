/** Backfill defaults for orders created before newer fields existed. */
export function normalizeOrder(o) {
  if (!o) return o;
  return {
    ...o,
    items: Array.isArray(o.items) ? o.items : [],
    status: o.status || 'PLACED',
    subtotal: o.subtotal ?? o.totalAmount ?? 0,
    shipping: o.shipping ?? 0,
    totalAmount: o.totalAmount ?? 0,
    address: o.address && typeof o.address === 'object' ? o.address : {},
    pincode: o.pincode || o.address?.pincode || '',
    payment: o.payment || { method: 'UPI', transactionId: 'legacy-order', status: 'SUCCESS' },
    statusHistory: Array.isArray(o.statusHistory) ? o.statusHistory : [],
  };
}

export function normalizeOrders(list) {
  return (Array.isArray(list) ? list : []).map(normalizeOrder);
}
