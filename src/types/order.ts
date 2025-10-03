// REQUEST ke /api/orders/quote
export type QuoteItemReq = {
   productId: string;
   productVariantId: string; // ← wajib
   quantity: number;
};
export type QuoteReq = { items: QuoteItemReq[] };

// RESPONSE dari /api/orders/quote (sesuai contoh terakhirmu)
export type QuoteLineRes = {
   productId: string;
   productName: string;
   productVariantId: string;
   variantName: string;
   quantity: number;
   unitPrice: number;
   subTotal: number;
};
export type QuoteRes =
   | { success: true; data: { items: QuoteLineRes[]; total: number } }
   | { success: false; error?: string };

// REQUEST ke /qr/order-qr
export type QrOrderReq = {
   branchId: string;
   productId: string;
   productVariantId: string;
   quantity: number;
   userId: string;
};

// RESPONSE dari /qr/order-qr
export type QrOrderData = {
   code: string;
   validFrom: string;
   validTo: string;
   maxUses: number;
   remainingUses: number;
   productId: string;
   productName: string;
   variantId: string;      // dari ERD-mu; tetap ada di respons
   variantName: string;
   branchId: string;
   branchName: string;
   branchLocation: string;
   unitPrice: number;
   quantity: number;
   totalPrice: number;
};
export type QrOrderRes =
   | { success: true; data: QrOrderData }
   | { success: false; error?: string };
