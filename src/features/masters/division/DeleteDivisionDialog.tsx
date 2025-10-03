'use client';
import * as React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { Division } from '../types';

export default function DeleteDivisionDialog({
   open, data, onOpenChange, onDeleted,
}: { open: boolean; data: Division | null; onOpenChange: (v: boolean) => void; onDeleted: (id: string) => void }) {
   const [loading, setLoading] = React.useState(false);

   async function doDelete() {
      if (!data) return;
      setLoading(true);
      const res = await fetch(`/api/letters/divisions/${encodeURIComponent(data.id)}`, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      setLoading(false);
      if (!res.ok) return toast('Gagal menghapus', { description: json?.error || `HTTP ${res.status}` });
      toast('Divisi dihapus', { description: `${data.code} - ${data.name}` });
      onDeleted(data.id);
      onOpenChange(false);
   }

   return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
         <AlertDialogContent>
         <AlertDialogHeader>
            <AlertDialogTitle>Hapus divisi?</AlertDialogTitle>
            <AlertDialogDescription>
               {data ? <>Divisi <b className="font-mono">{data.code}</b> akan dihapus.</> : null}
               <br />Jika sedang dipakai oleh surat, penghapusan ditolak.
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
