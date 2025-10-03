'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import MasterListToolbar from '../components/MasterListToolbar';
import SkeletonList from '../components/SkeletonList';
import DivisionCreateForm from './DivisionCreateForm';
import DivisionTable from './DivisionTable';
import DivisionEditSheet from './DivisionEditSheet';
import DeleteDivisionDialog from './DeleteDivisionDialog';

import type { Division } from '../types';

type Props = {
   loading: boolean;
   items: Division[];
   onCreateMerge: (item: Division) => void;
   onUpdateMerge: (item: Division) => void;
   onDeleted: (id: string) => void;
   };

export default function DivisionSection({
   loading,
   items,
   onCreateMerge,
   onUpdateMerge,
   onDeleted,
}: Props) {
   const [q, setQ] = useState<string>('');
   const [editing, setEditing] = useState<Division | null>(null);
   const [deleting, setDeleting] = useState<Division | null>(null);

   const filtered = useMemo(() => {
      const s = q.trim().toLowerCase();
      const base = !s
         ? items
         : items.filter(
            (i) => i.code.toLowerCase().includes(s) || i.name.toLowerCase().includes(s),
         );
      // sort by code for deterministic order
      return [...base].sort((a, b) => a.code.localeCompare(b.code));
   }, [q, items]);

   return (
      <Card className="border-muted/40 shadow-sm">
         <CardHeader className="pb-3">
         <CardTitle className="text-lg">Divisi</CardTitle>
         <CardDescription>Tambah atau perbarui kode &amp; nama divisi.</CardDescription>
         </CardHeader>

         <Separator />

         <CardContent className="pt-6 space-y-6">
         {/* Create form */}
         <DivisionCreateForm onCreated={onCreateMerge} />

         {/* Toolbar + counter */}
         <MasterListToolbar
            placeholder="Cari divisi…"
            total={items.length}
            value={q}
            onChange={setQ}
         />

         {/* Table area (fixed height + internal scroll for smooth UX) */}
         {loading ? (
            <SkeletonList rows={6} />
         ) : (
            <div className="h-72 overflow-auto">
               <DivisionTable
               items={filtered}
               onEdit={(d) => setEditing(d)}
               onDelete={(d) => setDeleting(d)}
               />
            </div>
         )}
         </CardContent>

         {/* Edit sheet */}
         <DivisionEditSheet
            open={!!editing}
            data={editing}
            onOpenChange={(v) => !v && setEditing(null)}
            onSaved={(item) => {
               onUpdateMerge(item);
            }}
         />

         {/* Delete dialog */}
         <DeleteDivisionDialog
            open={!!deleting}
            data={deleting}
            onOpenChange={(v) => !v && setDeleting(null)}
            onDeleted={(id) => {
               onDeleted(id);
            }}
         />
      </Card>
   );
}
