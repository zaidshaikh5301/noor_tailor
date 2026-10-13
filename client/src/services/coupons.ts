import { apiPost } from './apiClient';

export type CouponResult = {
  valid: boolean;
  discountPercent: number;
  discount?: number;
  message: string;
};

export function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  return apiPost<CouponResult>('/api/coupons/validate', { code, subtotal });
}
