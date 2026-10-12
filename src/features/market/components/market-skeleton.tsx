export function MarketSkeleton() {
  return (
    <div className="coin-grid" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="coin-card skeleton-card" key={index}>
          <div className="coin-card-heading"><span className="skeleton skeleton-circle" /><div className="skeleton-identity"><span className="skeleton skeleton-name" /><span className="skeleton skeleton-symbol" /></div></div>
          <span className="skeleton skeleton-price" /><span className="skeleton skeleton-change" />
          <div className="skeleton-meta"><span className="skeleton" /><span className="skeleton" /></div>
        </div>
      ))}
    </div>
  )
}
