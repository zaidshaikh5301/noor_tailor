import { apiPost, USE_API } from './apiClient';

export type CouponResult = {
  valid: boolean;
  discountPercent: number;
  discount?: number;
  message: string;
};

export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<CouponResult> {
  if (!USE_API) {
    // Local coupon logic: NOOR10 gives 10% off
    const upper = code.trim().toUpperCase();
    if (upper === 'NOOR10') {
      return { valid: true, discountPercent: 10, discount: Math.round(subtotal * 0.1), message: 'Offer applied' };
    }
    return { valid: false, discountPercent: 0, message: 'Invalid offer code' };
  }
  return apiPost<CouponResult>('/api/coupons/validate', { code, subtotal });
}
