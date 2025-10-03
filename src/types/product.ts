// Product (client) – variant menyimpan KEDUA id
export type Variant = {
   productVariantId: string; // ← PK product_variant (untuk quote/qr)
   variantId: string;        // ← PK master_variant/variants (untuk label)
   name: string;
   totalMl: number;
   price: number;
};

export type Product = {
   id: string;
   name: string;
   description?: string;
   imageUrl?: string;
   isAvailable: boolean;
   rating?: number;
   variants: Variant[];
};

// backend response mentah (mengikuti contoh di awal)
export type BackendProduct = {
   id: string;
   name: string;
   description?: string;
   imageUrl?: string;
   isAvailable: boolean;
   rating?: number;
   productVariants: Array<{
      id: string;                 // ← product_variant.id
      variantPrice: number;
      variants: {                 // ← master variant (size)
         id: string;               // ← variant.id (size id)
         name: string;
         totalMl: number;
      };
   }>;
};

export const normalizeProduct = (p: BackendProduct): Product => ({
   id: p.id,
   name: p.name,
   description: p.description,
   imageUrl: p.imageUrl,
   isAvailable: p.isAvailable,
   rating: p.rating,
   variants: p.productVariants.map(v => ({
      productVariantId: v.id,          // ← penting
      variantId: v.variants.id,
      name: v.variants.name,
      totalMl: v.variants.totalMl,
      price: v.variantPrice,
   })),
});
