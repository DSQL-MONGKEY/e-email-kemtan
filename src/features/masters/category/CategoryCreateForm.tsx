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
import type { Category } from '../types';
import { categorySchema } from './schema';

type Values = z.infer<typeof categorySchema>;

export default function CategoryCreateForm({ onCreated }: { onCreated: (item: Category) => void }) {
   const form = useForm<Values>({ resolver: zodResolver(categorySchema), defaultValues: { code: '', name: '' } });

   async function onSubmit(values: Values) {
      const res = await fetch('/api/letters/categories', {
         method: 'POST', headers: { 'content-type': 'application/json' },
         body: JSON.stringify({ code: values.code, name: values.name, isActive: true }),
      });
      const json = await res.json();
      if (!res.ok) return toast('Gagal', { description: json?.error || 'Gagal menyimpan kategori' });
      onCreated(json.item as Category);
      toast('Kategori tersimpan', { description: `${json.item.code} - ${json.item.name}` });
      form.reset({ code: '', name: '' });
   }

   return (
      <form className="grid gap-3 sm:grid-cols-[140px_1fr_auto]" onSubmit={form.handleSubmit(onSubmit)}>
         <div className="grid gap-2">
         <Label htmlFor="cat-code">Kode</Label>
         <Input
            id="cat-code"
            value={form.watch('code')}
            onChange={(e) => {
               const v = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10);
               form.setValue('code', v, { shouldValidate: true, shouldDirty: true });
            }}
            placeholder="B / URGENT"
            maxLength={10}
            className="font-mono text-center uppercase"
         />
         <div className="h-4">{form.formState.errors.code && <p className="text-xs text-destructive">{form.formState.errors.code.message}</p>}</div>
         </div>

         <div className="grid gap-2">
         <Label htmlFor="cat-name">Nama</Label>
         <Input id="cat-name" placeholder="Biasa" {...form.register('name')} />
         <div className="h-4">{form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}</div>
         </div>

         <div className="flex items-center justify-end">
         <Button className="gap-2" type="submit"><IconDatabasePlus className="h-4 w-4" /> Simpan</Button>
         </div>
      </form>
   );
}
