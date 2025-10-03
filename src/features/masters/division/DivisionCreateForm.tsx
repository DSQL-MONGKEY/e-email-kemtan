'use client';
import * as React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { IconDatabasePlus } from '@tabler/icons-react';
import { toast } from 'sonner';
import type { Division } from '../types';
import { divisionSchema } from './schema';

type Values = z.infer<typeof divisionSchema>;

export default function DivisionCreateForm({ onCreated }: { onCreated: (item: Division) => void }) {
   const form = useForm<Values>({ resolver: zodResolver(divisionSchema), defaultValues: { code: '', name: '' } });

   async function onSubmit(values: Values) {
      const res = await fetch('/api/letters/divisions', {
         method: 'POST', headers: { 'content-type': 'application/json' },
         body: JSON.stringify({ code: values.code, name: values.name }),
      });
      const json = await res.json();
      if (!res.ok) return toast('Gagal', { description: json?.error || 'Gagal menyimpan divisi' });
      onCreated(json.item as Division);
      toast('Divisi tersimpan', { description: `${json.item.code} - ${json.item.name}` });
      form.reset({ code: '', name: '' });
   }

   return (
      <form className="grid gap-3 sm:grid-cols-[200px_1fr_auto]" onSubmit={form.handleSubmit(onSubmit)}>
         <div className="grid gap-2">
            <Label htmlFor="div-code">Kode</Label>
            <Input
               id="div-code"
               value={form.watch('code')}
               onChange={(e) => {
                  const v = e.target.value.toUpperCase().replace(/[^A-Z0-9.\-]/g, '').slice(0, 20);
                  form.setValue('code', v, { shouldValidate: true, shouldDirty: true });
               }}
               placeholder="TU.040"
               className="font-mono uppercase"
            />
            <div className="h-4">
               {form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}
            </div>
         </div>

         <div className="grid gap-2">
         <Label htmlFor="div-name">Nama</Label>
         <Input id="div-name" placeholder="Tata Usaha 040" {...form.register('name')} />
         <div className="h-4">{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
         </div>

         <div className="flex items-center justify-end">
         <Button className="gap-2" type="submit"><IconDatabasePlus className="h-4 w-4" /> Simpan</Button>
         </div>
      </form>
   );
}
