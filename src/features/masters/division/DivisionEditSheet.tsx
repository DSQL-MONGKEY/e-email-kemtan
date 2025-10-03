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
import type { Division } from '../types';
import { divisionSchema } from './schema';

type Values = z.infer<typeof divisionSchema>;

export default function DivisionEditSheet({
   open, data, onOpenChange, onSaved,
}: { open: boolean; data: Division | null; onOpenChange: (v: boolean) => void; onSaved: (item: Division) => void }) {
   const form = useForm<Values>({
      resolver: zodResolver(divisionSchema),
      defaultValues: { code: data?.code ?? '', name: data?.name ?? '' },
      values: { code: data?.code ?? '', name: data?.name ?? '' },
   });
   const [saving, setSaving] = React.useState(false);

   async function onSubmit(values: Values) {
      if (!data) return;
      setSaving(true);
      const res = await fetch(`/api/letters/divisions/${encodeURIComponent(data.id)}`, {
         method: 'PUT', headers: { 'content-type': 'application/json' },
         body: JSON.stringify({ code: values.code, name: values.name }),
      });
      const json = await res.json();
      setSaving(false);
      if (!res.ok) return toast('Gagal', { description: json?.error || 'Gagal menyimpan divisi' });
      onSaved(json.item as Division);
      toast('Divisi diperbarui', { description: `${json.item.code} - ${json.item.name}` });
      onOpenChange(false);
   }

   return (
      <Sheet open={open} onOpenChange={onOpenChange}>
         <SheetContent className="sm:max-w-md px-3">
         <SheetHeader><SheetTitle>Edit Divisi</SheetTitle><SheetDescription>Ubah kode atau nama divisi.</SheetDescription></SheetHeader>
         <form className="mt-4 space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
               <Label>Kode</Label>
               <Input
               value={form.watch('code')}
               onChange={(e) =>
                  form.setValue('code', e.target.value.toUpperCase().replace(/[^A-Z0-9.\-]/g, '').slice(0, 20),
                     { shouldValidate: true, shouldDirty: true })}
               className="font-mono uppercase"
               />
            </div>
            <div className="grid gap-2">
               <Label>Nama</Label>
               <Input {...form.register('name')} />
            </div>
            <SheetFooter className="pt-2">
               <SheetClose asChild><Button type="button" variant="outline">Batal</Button></SheetClose>
               <Button type="submit" disabled={saving}>{saving ? 'Menyimpan…' : 'Simpan'}</Button>
            </SheetFooter>
         </form>
         </SheetContent>
      </Sheet>
   );
}
