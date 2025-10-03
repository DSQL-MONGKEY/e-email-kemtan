'use client';

import { apiGet } from "@/lib/api";
import { BackendList } from "@/types/common";
import { BackendProduct, normalizeProduct, Product } from "@/types/product";
import { useQuery } from "@tanstack/react-query";

export function useProducts() {
   return useQuery<Product[]>({
      queryKey: ["products"],
      queryFn: async() => {
         const res = await apiGet<BackendList<BackendProduct>>(`/api/products`, { cache: "no-store" });
         return (res.data || []).map(normalizeProduct);
      },
      staleTime: 60_000
   });
}
