export type QuoteLine = {
   productId: string;
   productName: string;
   variantId: string;        // sesuai contoh
   variantName: string;
   quantity: number;
   unitPrice: number;
   subTotal: number;
};

export type QuoteResponse = {
   success: true;
   data: {
      items: QuoteLine[];
      total: number;
   };
   } | {
   success: false;
   error?: string;
};

// Payload untuk request quote (ikuti contohmu)
export type QuotePayload = {
   items: {
      productId: string;
      productVariantId?: string; // untuk create order nanti
      variantId?: string;        // untuk quote saat ini
      quantity: number;
   }[];
};
