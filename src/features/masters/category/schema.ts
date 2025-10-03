import { z } from 'zod';
export const categorySchema = z.object({
   code: z.string().trim().regex(/^[A-Z]{1,10}$/, 'Kode minimal harus 1–10 huruf A–Z').transform(s => s.toUpperCase()),
   name: z.string().min(2, 'Minimal 2 huruf').max(100, 'Maksimal 100 huruf'),
});