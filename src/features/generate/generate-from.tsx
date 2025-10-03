/* eslint-disable @typescript-eslint/no-explicit-any */
// src/features/letter/generate-form.tsx
'use client';

import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

import {
   Command,
   CommandEmpty,
   CommandGroup,
   CommandInput,
   CommandItem,
} from '@/components/ui/command';

import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogDescription,
   DialogFooter,
} from '@/components/ui/dialog';

import {
   IconCalendar,
   IconCheck,
   IconClipboardCopy,
   IconHash,
   IconHistory,
   IconPrinter,
   IconRefresh,
} from '@tabler/icons-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { toast } from 'sonner';

type MasterCategory = { code: string; name: string };
type MasterDivision = { id: string; code: string; name: string };

type LetterItem = {
   id: string;
   number: string;
   issuedOn: string;
   category: string;
   divisionId: string;
   globalSerial: number;
   dailySerial: number;
};

const schema = z.object({
   categoryCode: z.string().min(1, 'Pilih kategori'),
   divisionCode: z.string().min(1, 'Pilih divisi'),
   issueDate: z.date().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function GenerateForm() {
   const [loadingMaster, setLoadingMaster] = useState(true);
   const [categories, setCategories] = useState<MasterCategory[]>([]);
   const [divisions, setDivisions] = useState<MasterDivision[]>([]);

   const [loadingHistory, setLoadingHistory] = useState(true);
   const [history, setHistory] = useState<LetterItem[]>([]);

   const [submitting, setSubmitting] = useState(false);
   const [result, setResult] = useState<LetterItem | null>(null);
   const [openDialog, setOpenDialog] = useState(false);

   const form = useForm<FormValues>({
      resolver: zodResolver(schema),
      defaultValues: {
         categoryCode: '',
         divisionCode: '',
         issueDate: new Date(),
      },
   });

   // --- masters
   useEffect(() => {
      (async () => {
         try {
         setLoadingMaster(true);
         const res = await fetch('/api/letters/masters', { cache: 'no-store' });
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal mengambil master');
         const cats = (json.categories ?? []) as MasterCategory[];
         const divs = (json.divisions ?? []) as MasterDivision[];

         setCategories(cats);
         setDivisions(divs);

         // set default selection kalau ada
         if (cats[0]?.code) form.setValue('categoryCode', cats[0].code);
         if (divs[0]?.code) form.setValue('divisionCode', divs[0].code);
         } catch (e) {
            if(e instanceof Error) {
               toast( 'Error master data', { description: e.message });
            }
         } finally {
            setLoadingMaster(false);
         }
      })();
   }, [form]);

   // --- history
   useEffect(() => {
      (async () => {
         try {
            setLoadingHistory(true);
            const res = await fetch('/api/numbers?limit=8', { cache: 'no-store' });
            const json = await res.json();
               if (res.ok) {
                  const items: LetterItem[] = (json.items ?? []).map((it:any) => ({
                     id: it.id,
                     number: it.number_text ?? it.number,
                     issuedOn: it.issued_on ?? it.issuedOn,
                     category: it.category_code ?? it.category,
                     divisionId: it.division_id ?? it.divisionId,
                     globalSerial: it.global_serial ?? it.globalSerial,
                     dailySerial: it.daily_serial ?? it.dailySerial,
                  }));
                  setHistory(items);
               } else {
                  setHistory([]);
               }
            } catch {
               setHistory([]);
            } finally {
               setLoadingHistory(false);
            }
      })();
       
   }, []);

   async function onSubmit(values: FormValues) {
      setSubmitting(true);
      try {
         const payload = {
            categoryCode: values.categoryCode,
            divisionCode: values.divisionCode,
            issueDate: values.issueDate ? format(values.issueDate, 'yyyy-MM-dd') : undefined,
         };

         const res = await fetch('/api/numbers', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(payload),
         });
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal membuat nomor');

         const item: LetterItem = {
            id: json.id,
            number: json.number,
            issuedOn: json.issuedOn,
            category: json.category,
            divisionId: json.divisionId,
            globalSerial: json.globalSerial,
            dailySerial: json.dailySerial,
         };

         setResult(item);
         setOpenDialog(true);
         setHistory((prev) => [item, ...(prev ?? [])].slice(0, 8));
         toast('Nomor berhasil dibuat', { description: item.number });
      } catch (e: any) {
         toast('Gagal', { description: e.message });
      } finally {
         setSubmitting(false);
      }
   }

   const numberForPrint = useMemo(() => result?.number ?? '', [result]);

   function copyNumber() {
      if (!result?.number) return;
      navigator.clipboard.writeText(result.number);
      toast('Disalin ke clipboard', { description: result.number });
   }

   function printNumber() {
      if (!result?.number) return;
      const win = window.open('', '_blank');
      
      if (!win) return;
      
      win.document.write(`
         <html>
            <head>
            <title>Nomor Surat</title>
               <style>
               body{font-family:ui-sans-serif,system-ui,Segoe UI,Roboto,Arial}
               .wrap{display:flex;height:100vh;align-items:center;justify-content:center}
               .num{font-size:28px;font-weight:700;letter-spacing:.4px}
               .meta{margin-top:6px;color:#6b7280;font-size:12px}
               </style>
            </head>
            <body>
               <div class="wrap">
                  <div>
                     <div class="num">${numberForPrint}</div>
                     <div class="meta">Dicetak ${new Date().toLocaleString('id-ID')}</div>
                  </div>
               </div>
               <script>window.print(); setTimeout(()=>window.close(), 300);</script>
            </body>
         </html>`);
      win.document.close();
   }

   // ---- UI parts
   const CategoryCombobox = (
      <Popover>
         <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between w-full">
               <div className="flex items-center gap-2">
                  {form.watch('categoryCode') && (
                  <Badge variant="secondary" className="font-mono">
                     {form.watch('categoryCode')}
                  </Badge>
                  )}
                  <span className={cn(!form.watch('categoryCode') && 'text-muted-foreground')}>
                  {form.watch('categoryCode')
                     ? categories.find((c) => c.code === form.watch('categoryCode'))?.name
                     : 'Pilih kategori'}
                  </span>
               </div>
            </Button>
         </PopoverTrigger>
         <PopoverContent className="p-0 w-[260px]" align="start">
         <Command>
            <CommandInput placeholder="Cari kategori…" />
            <CommandEmpty>Tidak ada</CommandEmpty>
            <CommandGroup>
               {categories.map((c) => (
               <CommandItem
                  key={c.code}
                  value={`${c.code} ${c.name}`}
                  onSelect={() => form.setValue('categoryCode', c.code, { shouldDirty: true })}
               >
                  <Badge variant="secondary" className="mr-2 font-mono">{c.code}</Badge>
                  {c.name}
                  {form.watch('categoryCode') === c.code && <IconCheck className="ml-auto h-4 w-4" />}
               </CommandItem>
               ))}
            </CommandGroup>
         </Command>
         </PopoverContent>
      </Popover>
   );

   const DivisionCombobox = (
      <Popover>
         <PopoverTrigger asChild>
            <Button variant="outline" className="justify-between w-full">
               <div className="flex items-center gap-2">
                  {form.watch('divisionCode') && (
                  <Badge variant="outline" className="font-mono">
                     {form.watch('divisionCode')}
                  </Badge>
                  )}
                  <span className={cn(!form.watch('divisionCode') && 'text-muted-foreground')}>
                  {form.watch('divisionCode')
                     ? divisions.find((d) => d.code === form.watch('divisionCode'))?.name
                     : 'Pilih divisi'}
                  </span>
               </div>
            </Button>
         </PopoverTrigger>
         <PopoverContent className="p-0 w-[320px]" align="start">
         <Command>
            <CommandInput placeholder="Cari divisi (kode/nama) …" />
            <CommandEmpty>Tidak ada</CommandEmpty>
            <CommandGroup>
               {divisions.map((d) => (
               <CommandItem
                  key={d.code}
                  value={`${d.code} ${d.name}`}
                  onSelect={() => form.setValue('divisionCode', d.code, { shouldDirty: true })}
               >
                  <Badge variant="outline" className="mr-2 font-mono">{d.code}</Badge>
                  {d.name}
                  {form.watch('divisionCode') === d.code && <IconCheck className="ml-auto h-4 w-4" />}
               </CommandItem>
               ))}
            </CommandGroup>
         </Command>
         </PopoverContent>
      </Popover>
   );

   return (
      <div className="grid gap-6 md:grid-cols-[1fr_380px]">
         {/* LEFT */}
         <Card className="border-muted/40 shadow-sm">
            <CardHeader className="pb-4">
               <CardTitle className="text-xl">Generate Nomor Surat</CardTitle>
               <CardDescription>Masukkan parameter berikut lalu tekan Generate.</CardDescription>
            </CardHeader>
         <Separator />
         <CardContent className="pt-6">
            {loadingMaster ? (
               <div className="grid gap-4 sm:grid-cols-2">
               {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
               ))}
               </div>
            ) : (
               <form
               className="grid gap-4 sm:grid-cols-2"
               onSubmit={form.handleSubmit(onSubmit)}
               >
               <div className="grid gap-2">
                  <Label>Kategori</Label>
                  {CategoryCombobox}
               </div>

               <div className="grid gap-2">
                  <Label>Divisi</Label>
                  {DivisionCombobox}
               </div>

               <div className="grid gap-2">
                  <Label>Tanggal Surat</Label>
                  <Popover>
                     <PopoverTrigger asChild>
                        <Button type="button" variant="outline" className={cn('justify-start font-normal', !form.watch('issueDate') && 'text-muted-foreground')}>
                           <IconCalendar className="mr-2 h-4 w-4" />
                           {form.watch('issueDate')
                              ? format(form.watch('issueDate')!, 'dd MMMM yyyy', { locale: idLocale })
                              : 'Pilih tanggal'}
                        </Button>
                     </PopoverTrigger>
                     <PopoverContent className="p-0" align="start">
                     <Calendar
                        mode="single"
                        selected={form.watch('issueDate')}
                        onSelect={(d) => form.setValue('issueDate', d ?? undefined, { shouldDirty: true })}
                        initialFocus
                     />
                     </PopoverContent>
                  </Popover>
               </div>

               <div className="sm:col-span-2 flex gap-2 pt-2">
                  <Button disabled={submitting} type="submit" className="gap-2">
                     <IconHash className="h-4 w-4" />
                     {submitting ? 'Mengenerate…' : 'Generate'}
                  </Button>
                  <Button
                     type="button"
                     variant="secondary"
                     className="gap-2"
                     onClick={() => {
                     form.reset({
                        categoryCode: categories[0]?.code ?? '',
                        divisionCode: divisions[0]?.code ?? '',
                        issueDate: new Date(),
                     });
                     setResult(null);
                     }}
                  >
                     <IconRefresh className="h-4 w-4" />
                     Reset
                  </Button>
               </div>
               </form>
            )}
         </CardContent>

         {/* Hasil (footer kosong; dialog terpisah) */}
         <CardFooter />
         </Card>

         {/* RIGHT: Riwayat */}
         <aside className="space-y-4">
         <Card className="border-muted/40 shadow-sm">
            <CardHeader className="pb-3">
               <CardTitle className="text-base flex items-center gap-2">
                  <IconHistory className="h-4 w-4" /> Riwayat Terakhir
               </CardTitle>
               <CardDescription>8 nomor terakhir yang dibuat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 overflow-scroll max-h-[180px]">
               {loadingHistory ? (
               <div className="space-y-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                     <Skeleton key={i} className="h-8 w-full" />
                  ))}
               </div>
               ) : history.length ? (
               <ul className="space-y-2">
                  {history.map((h) => (
                     <li key={h.id} className="rounded-md border p-2 hover:bg-muted/40 transition">
                     <div className="font-mono text-sm">{h.number}</div>
                     <div className="text-xs text-muted-foreground">
                        {new Date(h.issuedOn).toLocaleDateString('id-ID')}
                     </div>
                     </li>
                  ))}
               </ul>
               ) : (
               <div className="text-sm text-muted-foreground">Belum ada data.</div>
               )}
            </CardContent>
         </Card>

         <Card className="border-muted/40">
            <CardHeader className="pb-3">
               <CardTitle className="text-base">Format</CardTitle>
               <CardDescription>
                  <span className="font-mono">
                     B-588.3/TU.040/H.3.1/07/2025
                  </span>
               </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-1">
               <p><b>B</b> = kategori, <b>588</b> = serial global, <b>.3</b> = serial harian.</p>
               <p><b>H.dd.x</b> = tanggal & serial harian; lalu <b>MM/YYYY</b>.</p>
            </CardContent>
         </Card>
         </aside>

         {/* Dialog hasil */}
         <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogContent className="sm:max-w-md">
               <DialogHeader>
                  <DialogTitle>Nomor Surat</DialogTitle>
                  <DialogDescription>Nomor berhasil digenerate.</DialogDescription>
               </DialogHeader>

               <div className="rounded-md border p-3 bg-muted/30">
                  <div className="text-sm sm:text-2xl font-semibold tracking-wide font-mono text-center">
                  {result?.number}
                  </div>
               </div>

               <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between">
                  <div className="text-xs text-muted-foreground">
                  Tanggal: {result ? new Date(result.issuedOn).toLocaleDateString('id-ID') : '-'}
                  </div>
                  <div className="flex gap-2">
                  <Button size="sm" className="gap-2" onClick={copyNumber}>
                     <IconClipboardCopy className="h-4 w-4" /> Salin
                  </Button>
                  <Button size="sm" variant="outline" className="gap-2" onClick={printNumber}>
                     <IconPrinter className="h-4 w-4" /> Cetak
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => setOpenDialog(false)}>
                     OK
                  </Button>
                  </div>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}
