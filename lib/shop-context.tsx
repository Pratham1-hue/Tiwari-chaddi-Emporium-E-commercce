"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Address, CartItemDetailed, Order, Product, SessionUser } from "./types";

type ShopContextValue = {
  user: SessionUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  cart: CartItemDetailed[];
  addToCart: (product: Product, size?: string, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  removeLine: (key: string) => void;
  clearCart: () => void;
  cartCount: number;
  addresses: Address[];
  refreshAddresses: () => Promise<void>;
  saveAddress: (addr: Address) => Promise<{ ok: boolean; message?: string }>;
  deleteAddress: (id: string) => Promise<void>;
  orders: Order[];
  ordersLoading: boolean;
  refreshOrders: () => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export const cartKey = (productId: string, size: string) => `${productId}__${size}`;

function loadCart(): CartItemDetailed[] {
  try {
    const raw = localStorage.getItem("ce_cart_v2");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [cart, setCart] = useState<CartItemDetailed[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const refreshMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setUser(data.user || null);
      setAddresses(data.user?.addresses || []);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshMe();
    setCart(loadCart());
  }, [refreshMe]);

  useEffect(() => {
    try {
      localStorage.setItem("ce_cart_v2", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setAddresses(data.user.addresses || []);
      return { ok: true };
    }
    return { ok: false, message: data.message };
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(data.user);
      setAddresses([]);
      return { ok: true };
    }
    return { ok: false, message: data.message };
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setAddresses([]);
    setOrders([]);
  }, []);

  const addToCart = useCallback((product: Product, size?: string, qty = 1) => {
    const s = size || product.sizes?.[0] || "M";
    const key = cartKey(product._id, s);
    setCart((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) {
        return prev.map((l) =>
          l.key === key ? { ...l, quantity: Math.min(l.quantity + qty, 10, product.stock) } : l
        );
      }
      return [...prev, { key, productId: product._id, size: s, quantity: Math.min(qty, 10) }];
    });
  }, []);

  const setQty = useCallback((key: string, qty: number) => {
    setCart((prev) =>
      qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, quantity: Math.min(qty, 10) } : l))
    );
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const refreshAddresses = useCallback(async () => {
    try {
      const res = await fetch("/api/account/addresses");
      const data = await res.json();
      if (data.success) setAddresses(data.addresses);
    } catch {}
  }, []);

  const saveAddress = useCallback(async (addr: Address) => {
    const res = await fetch("/api/account/addresses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(addr),
    });
    const data = await res.json();
    if (data.success) {
      setAddresses(data.addresses);
      await refreshMe();
      return { ok: true };
    }
    return { ok: false, message: data.message };
  }, [refreshMe]);

  const deleteAddress = useCallback(async (id: string) => {
    await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    await refreshAddresses();
    await refreshMe();
  }, [refreshAddresses, refreshMe]);

  const refreshOrders = useCallback(async () => {
    if (!user) {
      setOrders([]);
      return;
    }
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch {} finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      refreshOrders();
    }
  }, [user, refreshOrders]);

  const cartCount = useMemo(() => cart.reduce((n, l) => n + l.quantity, 0), [cart]);

  const value: ShopContextValue = {
    user,
    authLoading,
    login,
    register,
    logout,
    refreshMe,
    cart,
    addToCart,
    setQty,
    removeLine,
    clearCart,
    cartCount,
    addresses,
    refreshAddresses,
    saveAddress,
    deleteAddress,
    orders,
    ordersLoading,
    refreshOrders,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}
