'use client';
import * as React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IconPencil, IconTrash } from '@tabler/icons-react';
import type { Category } from '../types';

export default function CategoryTable({
   items, onEdit, onDelete, maxHeight = 240,
}: { items: Category[]; onEdit: (c: Category) => void; onDelete: (c: Category) => void; maxHeight?: number }) {
   return (
      <div className="rounded-md border h-72 overflow-auto" style={{ maxHeight }}>
         <Table>
            <TableHeader>
               <TableRow>
                  <TableHead style={{ width: 80 }}>Kode</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead className="text-right" style={{ width: 160 }}>Aksi</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {items.map((c) => (
                  <TableRow key={c.code}>
                  <TableCell className="font-mono">{c.code}</TableCell>
                  <TableCell className="flex items-center gap-2">
                     <span>{c.name}</span>
                     <Badge variant={c.is_active ? 'secondary' : 'outline'}>{c.is_active ? 'Aktif' : 'Nonaktif'}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => onEdit(c)}><IconPencil className="h-4 w-4" /> Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => onDelete(c)}><IconTrash className="h-4 w-4" /> Hapus</Button>
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
