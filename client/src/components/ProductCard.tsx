import { Link } from 'react-router-dom'
import type { Product } from '../types'
import { useStore } from '../hooks/useStore'
import { handleImageError } from '../utils/productFallback'

export function ProductCard({ product }: { product: Product }) {
  const { wishlist, toggleWish } = useStore()

  return (
    <article className="product-card">
      <Link className="product-art" to={`/product/${product.slug}`} aria-label={`View ${product.name}`}>
        <div className={`art-swatch ${product.category.toLowerCase().replace(/\W/g, '')}`} style={{ '--garment': product.colors[0]?.hex } as React.CSSProperties}>
          <span className="art-mark">N</span>
        </div>
        <img className="product-photo" src={product.images[0]} alt={product.imageAlt ?? product.name} width="600" height="750" loading="lazy" onError={(e) => handleImageError(e, `product:${product.slug}`)} />
        <span className="art-note">NOOR / {product.subcategory.toUpperCase()}</span>
        {product.isNew && <span className="badge">New</span>}
      </Link>
      <button className={`wish-button ${wishlist.includes(product.slug) ? 'active' : ''}`} aria-label={wishlist.includes(product.slug) ? 'Remove from wishlist' : 'Add to wishlist'} onClick={() => toggleWish(product.slug)}>
        {wishlist.includes(product.slug) ? '♥' : '♡'}
      </button>
      <Link className="product-meta" to={`/product/${product.slug}`}>
        <span>{product.category} <span className="dot">·</span> {product.fabric}</span>
        <strong>{product.name}</strong>
      </Link>
    </article>
  )
}
