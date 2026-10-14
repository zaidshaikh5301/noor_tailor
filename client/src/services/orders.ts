import { apiGet, apiPost, USE_API } from './apiClient';
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

export async function createOrder(payload: OrderPayload): Promise<OrderResult> {
  if (!USE_API) {
    // Mock order creation for local development
    const subtotal = payload.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = payload.couponCode === 'NOOR10' ? Math.round(subtotal * 0.1) : 0;
    return {
      id: `ORD-${Date.now()}`,
      items: payload.items,
      customer: payload.customer,
      address: payload.address,
      couponCode: payload.couponCode,
      discount,
      subtotal,
      total: subtotal - discount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
  }
  return apiPost<OrderResult>('/api/orders', payload);
}

export async function getOrder(id: string): Promise<OrderResult> {
  if (!USE_API) {
    throw new Error('Order lookup not available in local mode');
  }
  return apiGet<OrderResult>(`/api/orders/${encodeURIComponent(id)}`);
}
