"use client"

import { motion, useReducedMotion, type Variants } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"
import { ShoppingCart, Star, Heart, Plus } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ProductRevealCardProps {
  name?: string
  price?: string
  originalPrice?: string
  image?: string
  /** Shown instead of an image when no `image` is provided. */
  emoji?: string
  /** Background classes for the emoji tile. */
  tileClass?: string
  badge?: string
  category?: string
  description?: string
  rating?: number
  reviewCount?: number
  /** Two highlights shown in the hover overlay. */
  features?: { title: string; subtitle: string }[]
  /** Quantity currently in the cart (shown on the button). */
  cartQty?: number
  soldOut?: boolean
  buying?: boolean
  message?: { success: boolean; text: string }
  /** Available sizes. Renders a size picker on the card when more than one. */
  sizes?: string[]
  selectedSize?: string
  onSizeChange?: (size: string) => void
  onAdd?: () => void
  onBuy?: () => void
  /** Opens the full product details (reviews, size guide, pincode check). */
  onDetails?: () => void
  onFavorite?: () => void
  enableAnimations?: boolean
  className?: string
}

const toNumber = (value: string) => parseFloat(value.replace(/[^0-9.]/g, ""))

export function ProductRevealCard({
  name = "Premium Wireless Headphones",
  price = "$199",
  originalPrice = "$299",
  image = "https://cdn.21st.dev/assets/mirror/bb/bba90456aaae85f4b66136b25f3a61c1cabc6717e9c44ff9485cc391106194d6.jpg", // Premium headphones
  emoji,
  tileClass,
  badge,
  category,
  description = "Experience studio-quality sound with advanced noise cancellation and 30-hour battery life. Perfect for music lovers and professionals.",
  rating = 4.8,
  reviewCount = 124,
  features = [
    { title: "30h Battery", subtitle: "Long-lasting" },
    { title: "Noise Cancel", subtitle: "Studio quality" },
  ],
  cartQty = 0,
  soldOut = false,
  buying = false,
  message,
  sizes = [],
  selectedSize,
  onSizeChange,
  onAdd,
  onBuy,
  onDetails,
  onFavorite,
  enableAnimations = true,
  className,
}: ProductRevealCardProps) {
  const [isFavorite, setIsFavorite] = useState(false)
  const shouldReduceMotion = useReducedMotion()
  const shouldAnimate = enableAnimations && !shouldReduceMotion

  const handleFavorite = () => {
    setIsFavorite(!isFavorite)
    onFavorite?.()
  }

  const priceValue = toNumber(price)
  const originalValue = originalPrice ? toNumber(originalPrice) : NaN
  const discount =
    originalValue > priceValue
      ? Math.round(((originalValue - priceValue) / originalValue) * 100)
      : 0

  const containerVariants: Variants = {
    rest: { 
      scale: 1,
      y: 0,
      filter: "blur(0px)",
    },
    hover: shouldAnimate ? { 
      scale: 1.03, 
      y: -8,
      filter: "blur(0px)",
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30,
        mass: 0.8,
      }
    } : {},
  }

  const imageVariants: Variants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
  }

  const overlayVariants: Variants = {
    rest: { 
      y: "100%", 
      opacity: 0,
      filter: "blur(4px)",
    },
    hover: { 
      y: "0%", 
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 28,
        mass: 0.6,
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  }

  const contentVariants: Variants = {
    rest: { 
      opacity: 0, 
      y: 20,
      scale: 0.95,
    },
    hover: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.5,
      },
    },
  }

  const buttonVariants_motion: Variants = {
    rest: { scale: 1, y: 0 },
    hover: shouldAnimate ? { 
      scale: 1.05, 
      y: -2,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 25 
      }
    } : {},
    tap: shouldAnimate ? { scale: 0.95 } : {},
  }

  const favoriteVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    favorite: { 
      scale: [1, 1.3, 1], 
      rotate: [0, 10, -10, 0],
      transition: { 
        duration: 0.5,
        ease: "easeInOut"
      }
    },
  }

  return (
    <motion.div
      data-slot="product-reveal-card"
      initial="rest"
      whileHover="hover"
      variants={containerVariants}
      className={cn(
        "relative w-80 rounded-2xl border border-border/50 bg-card text-card-foreground overflow-hidden",
        "shadow-lg shadow-black/5 cursor-pointer group",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative overflow-hidden">
        {image ? (
          <motion.img
            src={image}
            alt={name}
            className="h-56 w-full object-cover"
            variants={imageVariants}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        ) : (
          <div className={cn("flex h-56 w-full items-center justify-center", tileClass)}>
            <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.9)_1.5px,transparent_0)] [background-size:18px_18px]" />
            <motion.span
              variants={imageVariants}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={cn("relative text-8xl drop-shadow-[0_10px_16px_rgba(0,0,0,0.18)]", soldOut && "opacity-40 grayscale")}
            >
              {emoji ?? "🎽"}
            </motion.span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

        {/* Favorite Button */}
        <motion.button
          type="button"
          onClick={handleFavorite}
          aria-label={isFavorite ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          aria-pressed={isFavorite}
          variants={favoriteVariants}
          animate={isFavorite ? "favorite" : "rest"}
          className={cn(
            "absolute top-4 right-4 p-2 rounded-full backdrop-blur-sm border border-white/40 cursor-pointer",
            isFavorite 
              ? "bg-red-500 text-white" 
              : "bg-white/70 text-rose-500 hover:bg-white"
          )}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </motion.button>

        {/* Badges */}
        <div className="absolute top-4 left-4 flex flex-col items-start gap-1.5">
          {discount > 0 && !soldOut && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold"
            >
              {discount}% OFF
            </motion.div>
          )}
          {badge && !soldOut && (
            <span className="rounded-full bg-stone-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
              {badge}
            </span>
          )}
        </div>

        {soldOut && (
          <div className="absolute inset-0 grid place-items-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full border border-red-300 bg-red-50 px-4 py-1.5 text-sm font-bold text-red-600">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6 space-y-3">
        {category && (
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category}</div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-4 h-4",
                  i < Math.floor(rating) 
                    ? "text-yellow-400 fill-current" 
                    : "text-muted-foreground"
                )}
              />
            ))}
          </div>
          <span className="text-sm text-muted-foreground">
            {rating} ({reviewCount} reviews)
          </span>
        </div>

        {/* Product Info */}
        <div className="space-y-1">
          <motion.h3
            className="text-xl font-bold leading-tight tracking-tight"
            initial={{ opacity: 0.9 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {onDetails ? (
              <button type="button" onClick={onDetails} className="cursor-pointer text-left hover:underline">
                {name}
              </button>
            ) : (
              name
            )}
          </motion.h3>

          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">{price}</span>
              {originalPrice && (
                <span className="text-lg text-muted-foreground line-through">
                  {originalPrice}
                </span>
              )}
            </div>

            {/* Always-visible add button so touch devices (no hover) can still shop */}
            <button
              type="button"
              onClick={onAdd}
              disabled={soldOut}
              aria-label={`Add ${name} to cart`}
              className="relative grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-stone-900 text-white shadow-md transition active:scale-90 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              <Plus className="h-5 w-5" />
              {cartQty > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-black text-white shadow">
                  {cartQty}
                </span>
              )}
            </button>
          </div>

          {/* Size picker — always visible so size selection works without hover */}
          {sizes.length > 1 && (
            <div className="flex flex-wrap gap-1.5 pt-2" role="group" aria-label={`Choose size for ${name}`}>
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSizeChange?.(s)}
                  aria-pressed={s === selectedSize}
                  className={cn(
                    "min-w-9 cursor-pointer rounded-lg border px-2 py-1.5 text-xs font-bold",
                    s === selectedSize
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {message && (
          <div
            role="status"
            className={cn(
              "animate-fade-in rounded-xl border p-3 text-center text-xs font-medium",
              message.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            )}
          >
            {message.text}
          </div>
        )}
      </div>

      {/* Reveal Overlay */}
      <motion.div
        variants={overlayVariants}
        className="absolute inset-0 bg-background/96 backdrop-blur-xl flex flex-col justify-end"
      >
        <div className="p-6 space-y-4">
          {/* Product Description */}
          <motion.div variants={contentVariants}>
            <h4 className="font-semibold mb-2">Product Details</h4>
            <p className="line-clamp-3 text-sm text-muted-foreground leading-relaxed">
              {description}
            </p>
          </motion.div>

          {/* Features */}
          <motion.div variants={contentVariants}>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {features.slice(0, 2).map((f) => (
                <div key={f.title} className="bg-muted/50 rounded-lg p-2 text-center">
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-muted-foreground">{f.subtitle}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div variants={contentVariants} className="space-y-3">
            <motion.button
              type="button"
              onClick={onAdd}
              disabled={soldOut}
              variants={buttonVariants_motion}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-full h-12 font-medium cursor-pointer"
              )}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {soldOut ? "Out of Stock" : cartQty > 0 ? `Add to Cart (${cartQty} in cart)` : "Add to Cart"}
            </motion.button>

            <motion.button
              type="button"
              onClick={onDetails ?? onBuy}
              disabled={onDetails ? false : soldOut || buying}
              variants={buttonVariants_motion}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full h-10 font-medium cursor-pointer"
              )}
            >
              {onDetails ? "View Details & Reviews" : buying ? "Processing Order..." : "Buy Now"}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}
