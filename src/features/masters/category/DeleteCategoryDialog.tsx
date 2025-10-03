'use client';
import * as React from 'react';
import {
   AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
   AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Category } from '../types';

export default function DeleteCategoryDialog({
   open, data, onOpenChange, onDeleted,
}: { open: boolean; data: Category | null; onOpenChange: (v: boolean) => void; onDeleted: (code: string) => void; }) {
   const [loading, setLoading] = React.useState(false);

   async function doDelete() {
      if (!data) return;
      setLoading(true);
      const res = await fetch(`/api/letters/categories/${encodeURIComponent(data.code)}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) return toast('Gagal menghapus', { description: json?.error || `HTTP ${res.status}` });
      toast('Kategori dihapus', { description: `${data.code} - ${data.name}` });
      onDeleted(data.code);
      onOpenChange(false);
   }

   return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
         <AlertDialogContent>
         <AlertDialogHeader>
            <AlertDialogTitle>Hapus kategori?</AlertDialogTitle>
            <AlertDialogDescription>
               {data ? <>Kategori <b className="font-mono">{data.code}</b> akan dihapus.</> : null}
               <br />Jika dipakai oleh surat, penghapusan ditolak — nonaktifkan saja.
            </AlertDialogDescription>
         </AlertDialogHeader>
         <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} disabled={loading}>{loading ? 'Menghapus…' : 'Hapus'}</AlertDialogAction>
         </AlertDialogFooter>
         </AlertDialogContent>
      </AlertDialog>
   );
}
