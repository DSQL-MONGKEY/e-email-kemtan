'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import CategorySection from './category/CategorySection';
import DivisionSection from './division/DivisionSection';
import type { Category, Division } from './types';
import { toast } from 'sonner';

/**
 * Props optional initialData agar bisa di-hydrate dari server (lebih cepat & minim flicker).
 * Kalau tidak dipass, komponen tetap fallback fetch dari /api/letters/masters.
 */
export default function MastersManager({
   initialCategories,
   initialDivisions,
}: {
   initialCategories?: Category[];
   initialDivisions?: Division[];
}) {
   const [loading, setLoading] = useState<boolean>(!initialCategories || !initialDivisions);
   const [categories, setCategories] = useState<Category[]>(initialCategories ?? []);
   const [divisions, setDivisions] = useState<Division[]>(initialDivisions ?? []);

   // Bootstrap bila tidak ada initial data
   useEffect(() => {
      if (initialCategories && initialDivisions) return;
      (async () => {
         try {
         setLoading(true);
         const res = await fetch('/api/letters/masters', { cache: 'no-store' });
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal mengambil master');
         setCategories(json.categories || []);
         setDivisions(json.divisions || []);
         } catch (e) {
         if (e instanceof Error) toast('Error', { description: e.message });
         } finally {
         setLoading(false);
         }
      })();
   }, [initialCategories, initialDivisions]);

   // helpers merge sort
   const mergeCategory = (item: Category) =>
      setCategories((prev) =>
         [...prev.filter((c) => c.code !== item.code), item].sort((a, b) => a.code.localeCompare(b.code))
      );

   const mergeDivision = (item: Division) =>
      setDivisions((prev) =>
         [...prev.filter((d) => d.id !== item.id), item].sort((a, b) => a.code.localeCompare(b.code))
      );

   return (
      <div className="grid gap-6 md:grid-cols-2">
         <CategorySection
         loading={loading}
         items={categories}
         onCreateMerge={mergeCategory}
         onUpdateMerge={mergeCategory}
         onDeleted={(code) => setCategories((prev) => prev.filter((c) => c.code !== code))}
         />

         <DivisionSection
         loading={loading}
         items={divisions}
         onCreateMerge={mergeDivision}
         onUpdateMerge={mergeDivision}
         onDeleted={(id) => setDivisions((prev) => prev.filter((d) => d.id !== id))}
         />
      </div>
   );
}
