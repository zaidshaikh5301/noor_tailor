export function productPath(slug: string): string {
  return `/product/${slug}`
}

export function shopPath(category?: string): string {
  return category ? `/shop/${category}` : '/shop'
}

export function homePath(): string {
  return '/'
}