'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import type { Category } from '../types';

const schema = z.object({ code: z.string(), name: z.string().min(2).max(100), isActive: z.boolean() });
type Values = z.infer<typeof schema>;

export default function CategoryEditSheet({
   open, data, onOpenChange, onSaved,
}: { open: boolean; data: Category | null; onOpenChange: (v: boolean) => void; onSaved: (item: Category) => void; }) {
   const form = useForm<Values>({
      resolver: zodResolver(schema),
      defaultValues: { name: data?.name ?? '', isActive: data?.is_active ?? true },
      values: { code: data?.code ?? '', name: data?.name ?? '', isActive: data?.is_active ?? true },
   });
   const [saving, setSaving] = React.useState(false);

   async function onSubmit(values: Values) {
      if (!data) return;
      setSaving(true);
      const res = await fetch(`/api/letters/categories/${encodeURIComponent(data.code)}`, {
         method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(values),
      });
      const json = await res.json();
      setSaving(false);
      if (!res.ok) return toast('Gagal', { description: json?.error || 'Gagal menyimpan kategori' });
      onSaved(json.item as Category);
      toast('Kategori diperbarui', { description: `${json.item.code} - ${json.item.name}` });
      onOpenChange(false);
   }

   return (
      <Sheet open={open} onOpenChange={onOpenChange}>
         <SheetContent className="sm:max-w-md px-3">
            <SheetHeader>
               <SheetTitle>Edit Kategori</SheetTitle><SheetDescription>Kode tidak dapat diubah.</SheetDescription>
            </SheetHeader>
            <div className="mt-4 space-y-3">
               <div className="grid gap-2">
                  <Label>Kode</Label>
                  <Input {...form.register('code')} className="font-mono" disabled/>
               </div>
               <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-2">
                     <Label>Nama</Label>
                     <Input {...form.register('name')} />
                  </div>
                  <div className="flex items-center gap-2">
                  <input id="isActive" type="checkbox" className="size-4 accent-primary" {...form.register('isActive')} />
                  <Label htmlFor="isActive">Aktif</Label>
                  </div>
                  <SheetFooter className="pt-2">
                  <SheetClose asChild><Button type="button" variant="outline">Batal</Button></SheetClose>
                  <Button type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
                  </SheetFooter>
               </form>
            </div>
         </SheetContent>
      </Sheet>
   );
}
