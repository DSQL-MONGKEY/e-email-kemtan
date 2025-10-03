'use client';

import { Product, Variant } from "@/types/product";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CartItem = {
   key: string;
   productId: string;
   name: string;
   variant: Pick<Variant, "productVariantId" | "variantId" | "name" | "totalMl">;
   price: number; // price per unit
   qty: number;
}


type CartState = {
   items: CartItem[];
   add: (p: Product, variant: Variant) => void;
   inc: (key: string) => void;
   dec: (key: string) => void;
   remove: (key: string) => void;
   clear: () => void,
   totalQty: () => number;
   totalPrice: () => number;
   updateVariant: (key: string, product: Product, next: Variant) => void;
}

export const useCart = create<CartState>()(
   persist(
   (set, get) => ({
      items: [],

      add: (p, variant) =>
      set((s) => {
         const key = `${p.id}:${variant.productVariantId}`;
         const found = s.items.find((i) => i.key === key);

         if (found) {
            return {
            items: s.items.map((i) =>
               i.key === key ? { ...i, qty: i.qty + 1 } : i
            ),
            };
         }

         return {
            items: [
            ...s.items,
            {
               key,
               productId: p.id,
               name: p.name,
               variant: {
                  productVariantId: variant.productVariantId,
                  variantId: variant.variantId,
                  name: variant.name,
                  totalMl: variant.totalMl,
               },
               price: variant.price,
               qty: 1,
            },
            ],
         };
      }),

      inc: (key) =>
      set((s) => ({
         items: s.items.map((i) =>
            i.key === key ? { ...i, qty: i.qty + 1 } : i
         ),
      })),

      dec: (key) =>
      set((s) => ({
         items: s.items.map((i) =>
            i.key === key ? { ...i, qty: Math.max(1, i.qty - 1) } : i
         ),
      })),

      remove: (key) =>
      set((s) => ({
         items: s.items.filter((i) => i.key !== key),
      })),

      clear: () => set({ items: [] }),

      totalQty: () => get().items.reduce((a, i) => a + i.qty, 0),

      totalPrice: () =>
      get().items.reduce((a, i) => a + i.price * i.qty, 0),

      updateVariant: (key, product, next) => {
         set((s) => {
            const items = [...s.items];
            const sourceIdx = items.findIndex((i) => i.key === key);
            if(sourceIdx < 0) return {};

            const source = items[sourceIdx];
            const newKey = `${product.id}:${next.productVariantId}`;
            const targetIdx = items.findIndex((i) => i.key === newKey);

            const updated = {
               ...source,
               key: newKey,
               variant: {
                  productVariantId: next.productVariantId,
                  variantId: next.variantId,
                  name: next.name,
                  totalMl: next.totalMl,
               },
               price: next.price,
            }
            
            
            // change variant but fixed position in array
            if(targetIdx === -1) {
               items[sourceIdx] = updated;
               return { items };
            }

            // target same with the source -> only update the field
            if(targetIdx === sourceIdx) {
               items[sourceIdx] = updated;
               return { items };
            }

            items[targetIdx] = { 
               ...items[targetIdx], 
               qty: items[targetIdx].qty + source.qty,
            }

            items.splice(sourceIdx, 1);
            return { items }
         })
      }
   }),
   { name: "dscvry-cart" }
)
)

