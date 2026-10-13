import type { Product } from '../types'

export function productFallbackImage(product: Product): string {
  return product.images[0] ?? '/images/products/ivory-raw-silk-bandhgala.jpg'
}