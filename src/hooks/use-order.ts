'use client';

import { useMutation } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";
import { QrOrderRes, QuoteReq, QuoteRes } from "@/types/order";


// NOTE: path dari user: "/api/order/quote"
export function useQuoteOrder() {
   return useMutation<QuoteRes, Error, QuoteReq>({
      mutationKey: ["order", "quote"],
      mutationFn: (payload) => apiPost<QuoteRes>("/api/orders/quote", payload),
   });
}

// NOTE: path dari user: "/qr/order-qr"
export function useCreateQrOrder() {
   return useMutation<QrOrderRes, Error, QuoteReq>({
      mutationKey: ["order", "create"],
      mutationFn: (payload) => apiPost<QrOrderRes>("/api/qr/order-qr", payload),
   });
   }
