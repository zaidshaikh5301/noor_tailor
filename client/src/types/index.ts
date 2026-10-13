export type Product = {
  id: string; slug: string; name: string; category: string; subcategory: string; price: number; compareAtPrice?: number;
  description: string; fabric: string; fit: string; occasion: string[]; colors: { name: string; hex: string }[]; sizes: string[];
  images: string[]; imageAlt?: string; tags: string[]; isNew: boolean; isBestseller: boolean; inStock: boolean; careInstructions: string;
  deliveryNote: string; customTailoringAvailable: boolean;
}
export type CartLine = { slug: string; quantity: number; size: string; color: string }
