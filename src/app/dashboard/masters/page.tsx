// app/dashboard/masters/page.tsx
import PageContainer from '@/components/layout/page-container';
import MastersManager from '@/features/masters/masters-manager';
import { supabase } from '@/lib/supabase/client';

export const dynamic = 'force-dynamic'; // pastikan tidak di-cache berlebihan (opsional)

export default async function MastersPage() {

   // Ambil data master awal
   const [cats, divs] = await Promise.all([
      supabase.from('letter_categories').select('code,name,is_active').order('code'),
      supabase.from('divisions').select('id,code,name').order('code'),
   ]);

   const initialCategories = cats.data ?? [];
   const initialDivisions = divs.data ?? [];

   return (
      <PageContainer scrollable={false} useContainer>
         <div className="space-y-3">
         <MastersManager initialCategories={initialCategories} initialDivisions={initialDivisions} />
         </div>
      </PageContainer>
   );
}
