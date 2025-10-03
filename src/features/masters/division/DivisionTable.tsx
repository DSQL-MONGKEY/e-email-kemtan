'use client';
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { Division } from '../types';

export default function DivisionTable({
   items, onEdit, onDelete, maxHeight = 240,
}: { items: Division[]; onEdit: (d: Division) => void; onDelete: (d: Division) => void; maxHeight?: number }) {
   return (
      <div className="rounded-md border h-72 overflow-auto" style={{ maxHeight }}>
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead style={{ width: 140 }}>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right" style={{ width: 160 }}>Aksi</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {items.map((d) => (
                  <TableRow key={d.id}>
                  <TableCell className="font-mono">{d.code}</TableCell>
                  <TableCell>{d.name}</TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(d)}><IconPencil className="h-4 w-4" /> Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(d)}><IconTrash className="h-4 w-4" /> Hapus</Button>
                     </div>
                  </TableCell>
                  </TableRow>
               ))}
               {!items.length && (
                  <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">Tidak ada data.</TableCell>
                  </TableRow>
               )}
            </TableBody>
         </Table>
      </div>
   );
}
