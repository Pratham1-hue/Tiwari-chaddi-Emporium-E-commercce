export default function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-white shadow-lg shadow-black/5">
      <div className="h-56 animate-pulse bg-gradient-to-br from-orange-100 via-pink-100 to-violet-100" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
