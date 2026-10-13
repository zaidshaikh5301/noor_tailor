import { useEffect, useMemo, useState, type ReactNode } from "react";
import { StoreContext } from "./store";
import type { CartLine } from "../types";

import type { Store } from "./store";
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable */
  }
}
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>(() => read("noor-cart", [])),
    [wishlist, setWishlist] = useState<string[]>(() =>
      read("noor-wishlist", []),
    ),
    [toast, setToast] = useState("");
  const [couponCode, setCouponCode] = useState<string>(() =>
    read("noor-coupon", ""),
  );
  const [discountPercent, setDiscountPercent] = useState<number>(() =>
    read("noor-coupon-percent", 0),
  );
  useEffect(() => write("noor-cart", cart), [cart]);
  useEffect(() => write("noor-wishlist", wishlist), [wishlist]);
  useEffect(() => write("noor-coupon", couponCode), [couponCode]);
  useEffect(() => write("noor-coupon-percent", discountPercent), [
    discountPercent,
  ]);
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const value = useMemo<Store>(
    () => ({
      cart,
      wishlist,
      toast,
      couponCode,
      discountPercent,
      notify,
      add(line) {
        setCart((old) => {
          const found = old.find(
            (item) => item.slug === line.slug && item.size === line.size,
          );
          return found
            ? old.map((item) =>
                item === found
                  ? {
                      ...item,
                      quantity: Math.min(10, item.quantity + line.quantity),
                    }
                  : item,
              )
            : [...old, line];
        });
        notify("Added to your bag");
      },
      remove(slug, size) {
        setCart((old) =>
          old.filter(
            (item) =>
              item.slug !== slug || (size !== undefined && item.size !== size),
          ),
        );
      },
      setQty(slug, quantity, size) {
        setCart((old) =>
          old.map((item) =>
            item.slug === slug && (size === undefined || item.size === size)
              ? { ...item, quantity: Math.max(1, Math.min(10, quantity)) }
              : item,
          ),
        );
      },
      toggleWish(slug) {
        setWishlist((old) => {
          const exists = old.includes(slug);
          notify(
            exists ? "Removed from saved pieces" : "Saved to your wishlist",
          );
          return exists ? old.filter((id) => id !== slug) : [...old, slug];
        });
      },
      applyCoupon(code, percent) {
        setCouponCode(code);
        setDiscountPercent(percent);
        notify(`${percent}% offer applied`);
      },
      clearCoupon() {
        setCouponCode("");
        setDiscountPercent(0);
      },
    }),
    [cart, wishlist, toast, couponCode, discountPercent],
  );
  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}
