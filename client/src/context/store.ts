import { createContext } from "react";
import type { CartLine } from "../types";

export type Store = {
  cart: CartLine[];
  wishlist: string[];
  toast: string;
  couponCode: string;
  discountPercent: number;
  add: (line: CartLine) => void;
  remove: (slug: string, size?: string) => void;
  setQty: (slug: string, quantity: number, size?: string) => void;
  toggleWish: (slug: string) => void;
  notify: (message: string) => void;
  applyCoupon: (code: string, percent: number) => void;
  clearCoupon: () => void;
};
export const StoreContext = createContext<Store | null>(null);
