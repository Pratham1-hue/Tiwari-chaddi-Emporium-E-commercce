"use client";

import { useState } from "react";
import { ProductRevealCard } from "@/components/ui/product-reveal-card";
import { CATEGORY_STYLES } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { useShop } from "@/lib/shop-context";
import type { Product } from "@/lib/types";

/**
 * Wires the shadcn ProductRevealCard to the real store:
 * per-card size state, live cart quantities, details modal.
 */
export default function RevealGridCard({
  product,
  onDetails,
}: {
  product: Product;
  onDetails: (p: Product) => void;
}) {
  const { cart, addToCart } = useShop();
  const sizes = product.sizes?.length ? product.sizes : ["M"];
  const [size, setSize] = useState(sizes.includes("M") ? "M" : sizes[0]);
  const style = CATEGORY_STYLES[product.category ?? "Other"] ?? CATEGORY_STYLES.Other;
  const soldOut = product.stock <= 0;
  const low = !soldOut && product.stock <= 5;
  const qty = cart
    .filter((l) => l.productId === product._id)
    .reduce((n, l) => n + l.quantity, 0);

  return (
    <ProductRevealCard
      className="w-full"
      name={product.name}
      price={formatPrice(product.price)}
      originalPrice={product.mrp ? formatPrice(product.mrp) : ""}
      image=""
      emoji={product.emoji}
      tileClass={style.tile}
      badge={product.badge}
      category={product.category ?? "Innerwear"}
      description={product.description ?? "Premium everyday innerwear, built for all-day comfort."}
      rating={product.rating ?? 4.5}
      reviewCount={product.reviews ?? 0}
      features={[
        { title: soldOut ? "Sold out" : low ? `Only ${product.stock} left` : `${product.stock} in stock`, subtitle: "Availability" },
        { title: product.fabric ?? "Combed cotton", subtitle: "Fabric" },
      ]}
      sizes={sizes}
      selectedSize={size}
      onSizeChange={setSize}
      cartQty={qty}
      soldOut={soldOut}
      onAdd={() => addToCart(product, size)}
      onDetails={() => onDetails(product)}
    />
  );
}
