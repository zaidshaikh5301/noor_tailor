import { products } from '../src/data/products.ts'

const requiredFields = [
  'id', 'slug', 'name', 'category', 'subcategory', 'price',
  'description', 'fabric', 'fit', 'occasion', 'colors', 'sizes',
  'images', 'tags', 'isNew', 'isBestseller', 'inStock',
  'careInstructions', 'deliveryNote', 'customTailoringAvailable'
]

const issues: Array<{ slug: string; field: string; issue: string }> = []

const slugs = new Set<string>()

for (const product of products) {
  // Check duplicate slugs
  if (slugs.has(product.slug)) {
    issues.push({ slug: product.slug, field: 'slug', issue: 'Duplicate slug' })
  }
  slugs.add(product.slug)

  // Check empty/missing slug
  if (!product.slug || product.slug.trim() === '') {
    issues.push({ slug: product.slug || '(empty)', field: 'slug', issue: 'Empty or missing slug' })
  }

  // Check slug format (lowercase, hyphenated, no spaces/special chars)
  if (product.slug && product.slug !== product.slug.toLowerCase()) {
    issues.push({ slug: product.slug, field: 'slug', issue: 'Slug contains uppercase letters' })
  }
  if (product.slug && /\s/.test(product.slug)) {
    issues.push({ slug: product.slug, field: 'slug', issue: 'Slug contains spaces' })
  }
  if (product.slug && /[^a-z0-9-]/.test(product.slug)) {
    issues.push({ slug: product.slug, field: 'slug', issue: 'Slug contains special characters' })
  }

  // Check required fields
  for (const field of requiredFields) {
    const value = product[field as keyof typeof product]
    if (value === undefined || value === null || value === '') {
      issues.push({ slug: product.slug, field, issue: 'Missing or empty' })
    }
  }

  // Specific checks
  if (typeof product.price === 'number' && product.price === 0) {
    // Allow 0 price for unclassified products (known placeholders)
    if (!product.slug.startsWith('img-')) {
      issues.push({ slug: product.slug, field: 'price', issue: 'Price is 0 (placeholder)' })
    }
  }
  if (product.colors && product.colors.length === 0) {
    issues.push({ slug: product.slug, field: 'colors', issue: 'Empty colors array' })
  }
  if (product.sizes && product.sizes.length === 0) {
    issues.push({ slug: product.slug, field: 'sizes', issue: 'Empty sizes array' })
  }
  if (product.occasion && product.occasion.length === 0) {
    issues.push({ slug: product.slug, field: 'occasion', issue: 'Empty occasion array' })
  }
  if (product.images && product.images.length === 0) {
    issues.push({ slug: product.slug, field: 'images', issue: 'Empty images array' })
  }
  if (product.description && product.description.length < 20) {
    issues.push({ slug: product.slug, field: 'description', issue: 'Description too short' })
  }
}

console.log('Data Integrity Report')
console.log('=====================')
console.log(`Total products: ${products.length}`)
console.log(`Unique slugs: ${slugs.size}`)
console.log(`Issues found: ${issues.length}\n`)

if (issues.length > 0) {
  console.table(issues)
} else {
  console.log('✅ No issues found!')
}

process.exit(issues.length > 0 ? 1 : 0)