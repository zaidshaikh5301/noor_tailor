import { apiGet, apiPost } from './apiClient';
import type { Product } from '../types';

export type OrderItemPayload = {
  slug: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
};

export type OrderPayload = {
  items: OrderItemPayload[];
  customer: { name: string; email: string; phone: string };
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  couponCode?: string;
};

export type OrderResult = {
  id: string;
  items: OrderItemPayload[];
  customer: OrderPayload['customer'];
  address: OrderPayload['address'];
  couponCode?: string;
  discount: number;
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
};

export function buildOrderItems(
  cart: { slug: string; quantity: number; size: string; color: string }[],
  products: Product[],
): OrderItemPayload[] {
  return cart.map((line) => {
    const product = products.find((item) => item.slug === line.slug);
    return {
      slug: line.slug,
      name: product?.name ?? line.slug,
      price: product?.price ?? 0,
      quantity: line.quantity,
      size: line.size,
      color: line.color,
    };
  });
}

export function createOrder(payload: OrderPayload): Promise<OrderResult> {
  return apiPost<OrderResult>('/api/orders', payload);
}

export function getOrder(id: string): Promise<OrderResult> {
  return apiGet<OrderResult>(`/api/orders/${encodeURIComponent(id)}`);
}
