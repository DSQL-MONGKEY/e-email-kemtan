'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

import { IconDatabasePlus, IconSearch } from '@tabler/icons-react';
import { toast } from 'sonner';

type Category = { code: string; name: string; is_active: boolean };
type Division = { id: string; code: string; name: string };

const catSchema = z.object({
   code: z.string().trim().toUpperCase()
      .refine((s) => /^[A-Z]{1, 10}$/.test(s), 'Kode minimal harus 1-10 huruf A–Z'),
   name: z.string().min(2).max(100),
});
type CatValues = z.infer<typeof catSchema>;

const divSchema = z.object({
   code: z.string().trim().toUpperCase()
      .refine((s) => /^[A-Z0-9.\-]{2,20}$/.test(s), 'Huruf/angka/.-, 2–20 karakter'),
   name: z.string().min(2).max(100),
});
type DivValues = z.infer<typeof divSchema>;

export default function MastersManager() {
   const [loading, setLoading] = useState(true);
   const [categories, setCategories] = useState<Category[]>([]);
   const [divisions, setDivisions] = useState<Division[]>([]);
   const [qCat, setQCat] = useState('');
   const [qDiv, setQDiv] = useState('');

   // bootstrap
   useEffect(() => {
      (async () => {
         try {
            setLoading(true);
            const res = await fetch('/api/letters/masters', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Gagal mengambil master');
            setCategories(json.categories || []);
            setDivisions(json.divisions || []);
         } catch (e) {
            if(e instanceof Error) {
               toast('Error',{ description: e.message });
            }
         } finally {
            setLoading(false);
         }
      })();
   }, []);

   // forms
   const catForm = useForm<CatValues>({
      resolver: zodResolver(catSchema),
      defaultValues: { code: '', name: '' },
   });

   const divForm = useForm<DivValues>({
      resolver: zodResolver(divSchema),
      defaultValues: { code: '', name: '' },
   });

   async function submitCategory(values: CatValues) {
      try {
         const res = await fetch('/api/letters/categories', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code: values.code.toUpperCase(), name: values.name, isActive: true }),
         });
         
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan kategori');
         
         // merge/replace
         setCategories((prev) => {
            const others = prev.filter((c) => c.code !== json.item.code);
            return [...others, json.item].sort((a, b) => a.code.localeCompare(b.code));
         });
         catForm.reset({ code: '', name: '' });
         toast('Kategori tersimpan', { 
            description: `${json.item.code} - ${json.item.name}` 
         });
      } catch (e) {
         if(e instanceof Error) {
            toast('Gagal', { description: e.message });
         }
      }
   }

   async function submitDivision(values: DivValues) {
      try {
         const res = await fetch('/api/letters/divisions', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ code: values.code.toUpperCase(), name: values.name }),
         });
         
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal menyimpan divisi');
         
         setDivisions((prev) => {
            const others = prev.filter((d) => d.code !== json.item.code);
            return [...others, json.item].sort((a, b) => a.code.localeCompare(b.code));
         });
         
         divForm.reset({ code: '', name: '' });
         toast('Divisi tersimpan', { 
            description: `${json.item.code} - ${json.item.name}` 
         });
      } catch (e) {
         if(e instanceof Error) {
            toast('Gagal',{ description: e.message });
         }
      }
   }

   const filteredCategories = useMemo(() => {
      const q = qCat.trim().toLowerCase();
      if (!q) return [...categories].sort((a,b) => a.code.localeCompare(b.code));
      return categories
         .filter(c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q))
         .sort((a,b) => a.code.localeCompare(b.code));
   }, [qCat, categories]);

   const filteredDivisions = useMemo(() => {
      const q = qDiv.trim().toLowerCase();
      if (!q) return [...divisions].sort((a,b) => a.code.localeCompare(b.code));
      return divisions
         .filter(d => d.code.toLowerCase().includes(q) || d.name.toLowerCase().includes(q))
         .sort((a,b) => a.code.localeCompare(b.code));
   }, [qDiv, divisions]);

   return (
      <div className="grid gap-6 md:grid-cols-2">
         {/* Kategori */}
         <Card className="border-muted/40 shadow-sm">
            <CardHeader className="pb-3">
               <CardTitle className="text-lg">Kategori Surat</CardTitle>
               <CardDescription>Tambah atau perbarui kategori (huruf A–Z).</CardDescription>
            </CardHeader>
         <Separator />
         <CardContent className="pt-6 space-y-6">
            {/* Form */}
            <form
               className="grid gap-3 sm:grid-cols-[140px_1fr_auto]"
               onSubmit={catForm.handleSubmit(submitCategory)}
            >
               <div className="grid gap-2">
                  <Label htmlFor="cat-code">Kode</Label>
                  <Input
                     id="cat-code"
                     placeholder="B / URGENT"
                     maxLength={10}
                     {...catForm.register('code')}
                     className="font-mono text-center uppercase"
                  />
                  {catForm.formState.errors.code && (
                     <p className="text-xs text-destructive">{catForm.formState.errors.code.message}</p>
                  )}
               </div>

               <div className="grid gap-2">
                  <Label htmlFor="cat-name">Nama</Label>
                  <Input id="cat-name" placeholder="Biasa" {...catForm.register('name')} />
                  {catForm.formState.errors.name && (
                     <p className="text-xs text-destructive">{catForm.formState.errors.name.message}</p>
                  )}
                  </div>

                  <div className="flex items-end">
                  <Button className="gap-2" type="submit">
                     <IconDatabasePlus className="h-4 w-4" /> Simpan
                  </Button>
               </div>
            </form>

            {/* List */}
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                  <div className="relative w-full">
                     <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                     <Input
                        placeholder="Cari kategori…"
                        className="pl-8"
                        value={qCat}
                        onChange={(e)=>setQCat(e.target.value)}
                     />
                  </div>
                  <Badge variant="outline">{categories.length}</Badge>
               </div>

               {loading ? (
               <div className="space-y-2">
                  {Array.from({length:5}).map((_,i)=><Skeleton key={i} className="h-9 w-full" />)}
               </div>
               ) : (
               <div className="rounded-md border">
                  <Table>
                     <TableHeader>
                     <TableRow>
                        <TableHead style={{width: 80}}>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                        <TableHead className="text-right">Status</TableHead>
                     </TableRow>
                     </TableHeader>
                     <TableBody>
                     {filteredCategories.map((c) => (
                        <TableRow key={c.code}>
                           <TableCell className="font-mono">{c.code}</TableCell>
                           <TableCell>{c.name}</TableCell>
                           <TableCell className="text-right">
                           <Badge variant={c.is_active ? "secondary" : "outline"}>
                              {c.is_active ? "Aktif" : "Nonaktif"}
                           </Badge>
                           </TableCell>
                        </TableRow>
                     ))}
                     {!filteredCategories.length && (
                        <TableRow>
                           <TableCell colSpan={3} className="text-center text-muted-foreground">
                           Tidak ada data.
                           </TableCell>
                        </TableRow>
                     )}
                     </TableBody>
                  </Table>
               </div>
               )}
            </div>
         </CardContent>
         </Card>

         {/* Divisi */}
         <Card className="border-muted/40 shadow-sm">
         <CardHeader className="pb-3">
            <CardTitle className="text-lg">Divisi</CardTitle>
            <CardDescription>Tambah atau perbarui kode & nama divisi.</CardDescription>
         </CardHeader>
         <Separator />
         <CardContent className="pt-6 space-y-6">
            {/* Form */}
            <form
               className="grid gap-3 sm:grid-cols-[200px_1fr_auto]"
               onSubmit={divForm.handleSubmit(submitDivision)}
            >
               <div className="grid gap-2">
                  <Label htmlFor="div-code">Kode</Label>
                  <Input
                     id="div-code"
                     placeholder="TU.040"
                     {...divForm.register('code')}
                     className="font-mono uppercase"
                  />
                  {divForm.formState.errors.code && (
                     <p className="text-xs text-destructive">{divForm.formState.errors.code.message}</p>
                  )}
               </div>

               <div className="grid gap-2">
                  <Label htmlFor="div-name">Nama</Label>
                  <Input id="div-name" placeholder="Tata Usaha 040" {...divForm.register('name')} />
                  {divForm.formState.errors.name && (
                     <p className="text-xs text-destructive">{divForm.formState.errors.name.message}</p>
                  )}
                  </div>

                  <div className="flex items-end">
                  <Button className="gap-2" type="submit">
                     <IconDatabasePlus className="h-4 w-4" /> Simpan
                  </Button>
               </div>
            </form>

            {/* List */}
            <div className="space-y-2">
               <div className="flex items-center gap-2">
               <div className="relative w-full">
                  <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                     placeholder="Cari divisi…"
                     className="pl-8"
                     value={qDiv}
                     onChange={(e)=>setQDiv(e.target.value)}
                  />
               </div>
               <Badge variant="outline">{divisions.length}</Badge>
               </div>

               {loading ? (
               <div className="space-y-2">
                  {Array.from({length:6}).map((_,i)=><Skeleton key={i} className="h-9 w-full" />)}
               </div>
               ) : (
               <div className="rounded-md border">
                  <Table>
                     <TableHeader>
                     <TableRow>
                        <TableHead style={{width: 140}}>Kode</TableHead>
                        <TableHead>Nama</TableHead>
                     </TableRow>
                     </TableHeader>
                     <TableBody>
                     {filteredDivisions.map((d) => (
                        <TableRow key={d.code}>
                           <TableCell className="font-mono">{d.code}</TableCell>
                           <TableCell>{d.name}</TableCell>
                        </TableRow>
                     ))}
                     {!filteredDivisions.length && (
                        <TableRow>
                           <TableCell colSpan={2} className="text-center text-muted-foreground">
                           Tidak ada data.
                           </TableCell>
                        </TableRow>
                     )}
                     </TableBody>
                  </Table>
               </div>
               )}
            </div>
         </CardContent>
         </Card>
      </div>
   );
}
