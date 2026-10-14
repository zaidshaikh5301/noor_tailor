import { apiGet, ApiRequestError, USE_API } from './apiClient';
import { products } from '../data/products';
import { faqs } from '../data/faqs';
import { categories } from '../data/categories';
import { collections } from '../data/collections';
import { testimonials } from '../data/testimonials';
import { productPhotos } from '../data/productPhotos';
import { shopConfig } from '../config/shop';
import type { Product } from '../types';

type ProductListPayload = {
  items: Product[];
  total: number;
  page: number;
  pages: number;
};

type Faq = { q: string; a: string };

export function withPhoto(product: Product): Product {
  const photo = productPhotos[product.slug];
  return photo ? { ...product, images: [photo.src], imageAlt: photo.alt } : product;
}

export async function getProducts(): Promise<Product[]> {
  if (!USE_API) {
    return products.map(withPhoto);
  }
  try {
    const data = await apiGet<ProductListPayload>('/api/products?limit=200');
    return data.items.map(withPhoto);
  } catch {
    return products.map(withPhoto);
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  if (!USE_API) {
    const local = products.find((item) => item.slug === slug);
    return local ? withPhoto(local) : undefined;
  }
  try {
    const product = await apiGet<Product>(`/api/products/${encodeURIComponent(slug)}`);
    return product ? withPhoto(product) : undefined;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) return undefined;
    const local = products.find((item) => item.slug === slug);
    return local ? withPhoto(local) : undefined;
  }
}

export async function getFaqs(): Promise<Faq[]> {
  if (!USE_API) {
    return faqs;
  }
  try {
    return await apiGet<Faq[]>('/api/content/faqs');
  } catch {
    return faqs;
  }
}

export const editorialImages = {
  groom: '/images/products/ivory-pearl-groom-sherwani.jpg',
  kurtas: '/images/products/sand-linen-kurta.jpg',
  lookbookGroom: '/images/products/ivory-raw-silk-bandhgala.jpg',
  tailoring: '/images/products/stone-travel-blazer.jpg',
  featureWedding: productPhotos['maroon-groom-sherwani'].src,
  lookbookEvening: productPhotos['deep-green-festive-blazer'].src,
};

export const homeCategoryImages = {
  Suits: productPhotos['charcoal-two-piece'],
  Kurtas: productPhotos['sand-linen-kurta'],
  'Indo-Western': productPhotos['cream-cape-kurta'],
  Festive: productPhotos['saffron-festive-kurta'],
  Wedding: productPhotos['wine-embroidered-sherwani'],
};

export { categories, collections, testimonials, shopConfig };
