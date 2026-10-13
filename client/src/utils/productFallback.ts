import type { Product } from '../types'

export const placeholderImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1600' height='1200' viewBox='0 0 1600 1200'%3E%3Crect fill='%23e8e4da'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='system-ui,sans-serif' font-size='24' fill='%23999'%3EImage unavailable%3C/text%3E%3C/svg%3E"

export function productFallbackImage(product: Product): string {
  return product.images[0] ?? '/images/products/ivory-raw-silk-bandhgala.jpg'
}

export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  context?: string,
) {
  const image = event.currentTarget
  const src = image.src
  image.onerror = null
  image.src = placeholderImage
  console.warn(`[Noor Tailor] Image failed to load${context ? ` (${context})` : ""}:`, src)
}