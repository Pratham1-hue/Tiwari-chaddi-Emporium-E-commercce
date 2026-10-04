'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Splash from '@/components/Splash';
import MusicToggle from '@/components/MusicToggle';
import TiwariOrbit, { type OrbitItem } from '@/components/TiwariOrbit';
import Header from '@/components/shop/Header';
import RevealGridCard from '@/components/shop/RevealGridCard';
import ProductModal from '@/components/shop/ProductModal';
import CartDrawer from '@/components/shop/CartDrawer';
import CheckoutModal from '@/components/shop/CheckoutModal';
import Testimonials from '@/components/shop/Testimonials';
import AdminPanel from '@/components/shop/AdminPanel';
import AccountView from '@/components/shop/AccountView';
import { ShippingView, TrackView } from '@/components/shop/InfoPages';
import PincodeChecker from '@/components/shop/PincodeChecker';
import PromoSection from '@/components/ui/promo-section';
import { LetterSwap } from '@/components/ui/letter-swap';
import { TextReveal3d } from '@/components/ui/text-reveal-3d';
import { SpeedingText } from '@/components/ui/speeding-text';
import { TileReveal } from '@/components/ui/tile-reveal';
import { CardSpread } from '@/components/ui/card-spread';
import ProductSkeleton from '@/components/ProductSkeleton';
import { Truck, RotateCcw, ShieldCheck, Star } from 'lucide-react';
import { CATEGORIES, CATEGORY_STYLES, catalog } from '@/lib/catalog';
import { formatPrice } from '@/lib/format';
import type { CardMessage, Product } from '@/lib/types';
import { useBackgroundMusic } from '@/lib/use-background-music';
import { useShop } from '@/lib/shop-context';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'discount';
type View = 'home' | 'account' | 'admin' | 'track' | 'shipping';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
  { value: 'discount', label: 'Biggest Discount' },
];

const styleFor = (p: Pick<Product, 'category'>) => CATEGORY_STYLES[p.category ?? 'Other'] ?? CATEGORY_STYLES.Other;

const ORBIT_PICKS = [
  'classic-cotton-brief',
  'jumbo-comfort-boxer',
  'royal-rajwadi-baniyan',
  'merino-thermal-top',
  'ankle-socks-5-pack',
  'monsoon-combo',
  'travel-fresh-trunk',
  'sports-socks-pro',
];

const orbitItems: OrbitItem[] = ORBIT_PICKS.map((id) => catalog.find((p) => p._id === id)!).map((p) => ({
  emoji: p.emoji ?? '🎽',
  name: p.name,
  tileClass: styleFor(p).tile,
}));

const discountOf = (p: Product) => (p.mrp && p.mrp > p.price ? (p.mrp - p.price) / p.mrp : 0);

function InnerHome() {
  const { cart, addToCart, refreshOrders } = useShop();
  const [products, setProducts] = useState<Product[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState<View>('home');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState<SortKey>('featured');
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [trackId, setTrackId] = useState<string | undefined>(undefined);
  const [toast, setToast] = useState<CardMessage | null>(null);

  const [splashOpen, setSplashOpen] = useState(true);
  const music = useBackgroundMusic('/tiwari/tiwari-ji-ka-raaj.mp3');
  const enterSite = useCallback(() => {
    music.start();
    setSplashOpen(false);
  }, [music]);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/products', { cache: 'no-store' });
      const data = await res.json();
      return (data.success && data.products.length > 0 ? data.products : catalog) as Product[];
    } catch {
      return catalog as Product[];
    }
  }, []);

  useEffect(() => {
    load().then((list) => {
      setProducts(list);
      setLoaded(true);
    });
  }, [load]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const productsById = useMemo(() => new Map(products.map((p) => [p._id, p])), [products]);

  const categories = useMemo(() => {
    const present = new Set(products.map((p) => p.category ?? 'Other'));
    return ['All', ...CATEGORIES.filter((c) => present.has(c)), ...[...present].filter((c) => !(CATEGORIES as readonly string[]).includes(c))];
  }, [products]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (category === 'All' || (p.category ?? 'Other') === category) &&
        (!q || `${p.name} ${p.description ?? ''} ${p.category ?? ''}`.toLowerCase().includes(q))
    );
    const sorted = [...list];
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') sorted.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sort === 'discount') sorted.sort((a, b) => discountOf(b) - discountOf(a));
    return sorted;
  }, [products, query, category, sort]);

  const navigate = (v: string) => {
    setView(v as View);
    window.scrollTo({ top: 0 });
  };

  const quickBuy = (p: Product, size: string) => {
    addToCart(p, size);
    setSelected(null);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const onCheckoutSuccess = (orderId: string) => {
    setCheckoutOpen(false);
    refreshOrders();
    setTrackId(orderId);
    setView('track');
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-stone-900">
      <Splash open={splashOpen} items={orbitItems} playing={music.playing} muted={music.muted} onEnter={enterSite} />
      <MusicToggle playing={music.playing} muted={music.muted} onToggle={music.toggleMute} />
      <Header query={query} onQuery={setQuery} onCart={() => setCartOpen(true)} onNavigate={navigate} />

      {view === 'account' && <AccountView />}
      {view === 'admin' && (
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <h2 className="text-2xl font-extrabold">Management dashboard</h2>
          <p className="mt-1 text-sm text-stone-500">Orders, revenue, stock and catalogue — for store managers.</p>
          <div className="mt-5"><AdminPanel /></div>
        </div>
      )}
      {view === 'track' && <TrackView initialId={trackId} />}
      {view === 'shipping' && <ShippingView />}

      {view === 'home' && (
        <>
          {/* Hero — editorial, restrained */}
          <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6 md:pt-12">
            <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.7 rated · 50,000+ customers · Tiwari Ji recommends
                </span>
                <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
                  Innerwear for{' '}
                  <LetterSwap
                    words={['real India.', 'max comfort.', 'every day.', 'all sizes.']}
                    className="text-stone-900"
                  />
                </h1>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-stone-500 md:text-lg">
                  Combed-cotton briefs, boxers, baniyans, thermals and socks — in sizes S to XXL, with honest prices,
                  live order tracking and 7-day returns.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a href="#shop" className="rounded-full bg-stone-900 px-6 py-3 text-sm font-bold text-white hover:bg-stone-700">
                    Shop bestsellers
                  </a>
                  <button type="button" onClick={() => navigate('track')} className="cursor-pointer rounded-full border border-stone-300 px-6 py-3 text-sm font-bold hover:bg-white">
                    Track my order
                  </button>
                </div>
                <dl className="mt-8 flex gap-8 border-t border-stone-200 pt-5">
                  {[
                    ['24', 'Styles in stock'],
                    ['S–XXL', 'True Indian sizes'],
                    ['4.7★', '6,000+ reviews'],
                  ].map(([v, l]) => (
                    <div key={l}>
                      <dt className="text-2xl font-black">{v}</dt>
                      <dd className="text-xs text-stone-500">{l}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-5 max-w-md"><PincodeChecker /></div>
              </div>
              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Brand ambassador</p>
                  <p className="text-xs font-semibold text-stone-500">Tiwari Ji · approved ✓</p>
                </div>
                <TiwariOrbit items={orbitItems} className="mx-auto mt-2 max-w-md" />
                <p className="mt-2 text-center text-xs text-stone-400">His 8 everyday picks, circling. Tap any product below to choose a size.</p>
              </div>
            </div>
          </section>

          {/* Trust strip */}
          <section className="mx-auto max-w-7xl px-4 pt-8 md:px-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[
                { icon: Truck, t: 'Free shipping', d: 'On orders over ₹499' },
                { icon: RotateCcw, t: '7-day returns', d: 'No-question size exchange' },
                { icon: ShieldCheck, t: 'Secure checkout', d: 'Dummy UPI / Card / COD' },
                { icon: Star, t: 'Rated 4.7/5', d: 'By verified buyers' },
              ].map(({ icon: Icon, t, d }) => (
                <div key={t} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-900 text-white"><Icon className="h-5 w-5" /></span>
                  <span><span className="block text-sm font-bold">{t}</span><span className="block text-xs text-stone-500">{d}</span></span>
                </div>
              ))}
            </div>
          </section>

          {/* Speeding strip — smears with scroll velocity */}
          <div className="mt-10">
            <SpeedingText
              items={[
                'Free shipping over ₹499',
                '7-day easy returns',
                'COD available',
                'Sizes S to XXL',
                'Tiwari Ji approved',
                '4.7★ from 6,000+ reviews',
              ]}
            />
          </div>

          {/* Tiwari Ji's picks — vertical marquee promo band */}
          <div className="mt-10 border-y border-stone-200 bg-white">
            <PromoSection
              items={(products.length ? products : catalog).slice(0, 12).map((p) => ({
                emoji: p.emoji ?? '🎽',
                name: p.name,
                price: formatPrice(p.price),
                tileClass: styleFor(p).tile,
              }))}
              title="Tiwari Ji's handpicked favourites are here"
              description="Our brand ambassador wears nothing but the best. Scroll the collection he swears by — breathable, true-size and unbelievably comfortable."
              ctaLabel="Shop bestsellers"
              ctaHref="#shop"
            />
          </div>

          {/* Shop */}
          <main id="shop" className="mx-auto max-w-7xl scroll-mt-24 px-4 pb-4 pt-10 md:px-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                  <TextReveal3d text="Shop all products" />
                </h2>
                <p className="mt-1 text-sm text-stone-500">
                  {loaded ? `${visible.length} of ${products.length} products · prices include GST` : 'Loading inventory…'}
                </p>
              </div>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="cursor-pointer rounded-full border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium outline-none">
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
              {categories.map((c) => {
                const active = c === category;
                const n = c === 'All' ? products.length : products.filter((p) => (p.category ?? 'Other') === c).length;
                return (
                  <button key={c} type="button" onClick={() => setCategory(c)} aria-pressed={active}
                    className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold ${active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white text-stone-600 hover:border-stone-400'}`}>
                    {c} <span className="opacity-60">{n}</span>
                  </button>
                );
              })}
            </div>

            {/* Shop by category — fanned deck, click a card to filter */}
            <CardSpread
              className="mt-2"
              activeKey={category === 'All' ? undefined : category}
              cards={(
                [
                  { key: 'Chaddi', emoji: '🩳' },
                  { key: 'Baniyan', emoji: '🎽' },
                  { key: 'Thermals', emoji: '🧥' },
                  { key: 'Socks', emoji: '🧦' },
                  { key: 'Combos', emoji: '🎁' },
                ] as const
              ).map(({ key, emoji }) => {
                const style = CATEGORY_STYLES[key] ?? CATEGORY_STYLES.Other;
                const n = products.filter((p) => (p.category ?? 'Other') === key).length;
                return {
                  key,
                  emoji,
                  title: key,
                  subtitle: `${n} style${n === 1 ? '' : 's'}`,
                  tileClass: style.tile,
                };
              })}
              onSelect={(key) => {
                setCategory(key);
                document.getElementById('shop-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            />

            <div id="shop-grid" className="mt-5 grid scroll-mt-40 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {!loaded && Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)}
              {loaded && visible.map((p) => <RevealGridCard key={p._id} product={p} onDetails={setSelected} />)}
            </div>
            {loaded && visible.length === 0 && (
              <div className="py-20 text-center">
                <p className="font-bold">No products found</p>
                <p className="text-sm text-stone-500">Try a different search or category.</p>
                <button type="button" onClick={() => { setQuery(''); setCategory('All'); }} className="mt-4 cursor-pointer rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold">Clear filters</button>
              </div>
            )}
          </main>

          {/* Bestsellers tile reveal — sticky scroll experience */}
          <TileReveal
            tiles={(products.length ? products : catalog).slice(0, 16).map((p) => ({
              emoji: p.emoji ?? '🎽',
              name: p.name,
              tileClass: styleFor(p).tile,
            }))}
            eyebrow="The collection"
            title="Sixteen everyday essentials"
            description="One grid, every drawer covered — briefs, boxers, vests, thermals and socks in sizes S to XXL, all rated 4+ stars by verified buyers."
            ctaLabel="Shop the grid"
            ctaHref="#shop"
          />

          <Testimonials />

          {/* Account teaser */}
          <section className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
            <div className="grid gap-4 rounded-3xl border border-stone-200 bg-white p-6 md:grid-cols-3 md:p-8">
              <div>
                <h3 className="font-extrabold">Your account, sorted</h3>
                <p className="mt-1 text-sm text-stone-500">Login once — addresses, order history, tracking and returns stay in one place.</p>
                <button type="button" onClick={() => navigate('account')} className="mt-3 cursor-pointer rounded-full bg-stone-900 px-5 py-2.5 text-sm font-bold text-white">Open my profile</button>
              </div>
              <div>
                <h3 className="font-extrabold">How ordering works</h3>
                <ol className="mt-1 list-decimal space-y-1 pl-5 text-sm text-stone-500">
                  <li>Pick a size, add to cart.</li>
                  <li>Enter address + pincode (serviceability checked).</li>
                  <li>Pay with dummy UPI / Card / COD — get a transaction ID.</li>
                  <li>Track PLACED → PACKED → SHIPPED → DELIVERED.</li>
                </ol>
              </div>
              <div>
                <h3 className="font-extrabold">For managers</h3>
                <p className="mt-1 text-sm text-stone-500">Update order status, watch revenue and low stock, add new products.</p>
                <button type="button" onClick={() => navigate('admin')} className="mt-3 cursor-pointer rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold">Open dashboard</button>
                <p className="mt-2 font-mono text-[11px] text-stone-400">admin@chaddi.com / admin123</p>
              </div>
            </div>
          </section>
        </>
      )}

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
          <div className="md:col-span-2">
            <p className="font-extrabold">Chaddi &amp; Baniyan Emporium</p>
            <p className="mt-2 max-w-sm text-sm text-stone-500">Premium everyday innerwear in true Indian sizes. Designed in Jaipur, worn everywhere. Endorsed by Tiwari Ji.</p>
            <p className="mt-3 font-mono text-[11px] text-stone-400">Dummy store — payments are simulated, no real money moves.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">Shop</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              {CATEGORIES.map((c) => (
                <li key={c}><button type="button" onClick={() => { setCategory(c); navigate('home'); }} className="cursor-pointer hover:underline">{c}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400">Help</h4>
            <ul className="mt-2 space-y-1.5 text-sm text-stone-600">
              <li><button type="button" onClick={() => navigate('track')} className="cursor-pointer hover:underline">Track order</button></li>
              <li><button type="button" onClick={() => navigate('shipping')} className="cursor-pointer hover:underline">Shipping &amp; returns</button></li>
              <li><button type="button" onClick={() => navigate('account')} className="cursor-pointer hover:underline">My profile &amp; orders</button></li>
              <li><span>{formatPrice(499)}+ free shipping · 7-day returns</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-100 py-5 text-center text-xs text-stone-400">© 2026 Chaddi &amp; Baniyan Emporium · {products.length} styles · MongoDB + Next.js</div>
      </footer>

      <ProductModal product={selected} onClose={() => setSelected(null)} onBuy={quickBuy} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} productsById={productsById} />
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} productsById={productsById} onSuccess={onCheckoutSuccess} />

      {toast && (
        <div role="status" className={`fixed bottom-6 left-1/2 z-[90] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border px-5 py-3 text-sm shadow-xl ${toast.success ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
          {toast.text}
        </div>
      )}
      <span className="hidden">{cart.length}</span>
    </div>
  );
}

export default function Home() {
  return <InnerHome />;
}
