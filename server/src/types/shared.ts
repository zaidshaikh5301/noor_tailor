export interface Color {
  name: string;
  hex: string;
}

export interface CartItem {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  occasion: string;
}

export interface StoreInfo {
  name: string;
  address: string;
  hours: string;
  phone: string;
  whatsapp: string;
}

export interface Category {
  name: string;
  slug: string;
  note: string;
}

export interface Collection {
  name: string;
  eyebrow: string;
  copy: string;
  link: string;
}