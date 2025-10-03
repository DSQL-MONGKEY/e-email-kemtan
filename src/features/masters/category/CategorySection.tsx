'use client';
import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import MasterListToolbar from '../components/MasterListToolbar';
import SkeletonList from '../components/SkeletonList';
import CategoryCreateForm from './CategoryCreateForm';
import CategoryTable from './CategoryTable';
import CategoryEditSheet from './CategoryEditSheet';
import DeleteCategoryDialog from './DeleteCategoryDialog';
import type { Category } from '../types';

export default function CategorySection({
   loading, items, onCreateMerge, onUpdateMerge, onDeleted,
}: { loading: boolean; items: Category[]; onCreateMerge: (i: Category) => void; onUpdateMerge: (i: Category) => void; onDeleted: (code: string) => void; }) {
   const [q, setQ] = React.useState('');
   const [editing, setEditing] = React.useState<Category | null>(null);
   const [deleting, setDeleting] = React.useState<Category | null>(null);

   const filtered = React.useMemo(() => {
      const s = q.trim().toLowerCase();
      if (!s) return [...items].sort((a, b) => a.code.localeCompare(b.code));
      return items.filter(i => i.code.toLowerCase().includes(s) || i.name.toLowerCase().includes(s))
                  .sort((a, b) => a.code.localeCompare(b.code));
   }, [q, items]);

   return (
      <Card className="border-muted/40 shadow-sm">
         <CardHeader className="pb-3"><CardTitle className="text-lg">Kategori Surat</CardTitle><CardDescription>Tambah atau perbarui kategori.</CardDescription></CardHeader>
         <Separator />
         <CardContent className="pt-6 space-y-6">
         <CategoryCreateForm onCreated={onCreateMerge} />
         <MasterListToolbar placeholder="Cari kategori…" total={items.length} value={q} onChange={setQ} />
         {loading ? <SkeletonList rows={5} /> : <CategoryTable items={filtered} onEdit={setEditing} onDelete={setDeleting} />}
         </CardContent>

         <CategoryEditSheet open={!!editing} data={editing} onOpenChange={(v) => !v && setEditing(null)} onSaved={onUpdateMerge} />
         <DeleteCategoryDialog open={!!deleting} data={deleting} onOpenChange={(v) => !v && setDeleting(null)} onDeleted={onDeleted} />
      </Card>
   );
}
