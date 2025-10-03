import { z } from 'zod';
export const divisionSchema = z.object({
  code: z.string().trim().regex(/^[A-Z0-9.\-]{2,20}$/, 'Huruf/angka/.-, 2–20 karakter').transform(s => s.toUpperCase()),
  name: z.string().min(2, 'Minimal 2 huruf').max(100, 'Maksimal 100 huruf'),
});