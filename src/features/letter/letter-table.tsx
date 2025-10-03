/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useRouter, usePathname } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import {
   IconCalendar, IconChevronLeft, IconChevronRight, IconSearch, IconRefresh,
} from '@tabler/icons-react';
import { toast } from 'sonner';

type MasterCategory = { code: string; name: string; is_active?: boolean };
type MasterDivision = { id: string; code: string; name: string };

type LetterRow = {
   id: string;
   number_text: string;
   issued_on: string;   // ISO
   category_code: string;
   division_code: string;
   division_name: string;
   global_serial: number;
   daily_serial: number;
   created_at: string;
   created_by: string | null;
   purpose: string | null;
};

type InitialParams = {
   q: string;
   category: string;
   division: string;
   from: string; // YYYY-MM-DD
   to: string;   // YYYY-MM-DD
   page: number;
   limit: number;
};

const ALL_CATS = "__ALL__";
const ALL_DIVS = "__ALL_DIV__";

const TABLE_HEIGHT_PX = 560;       
const HEADER_H = 44;               // tinggi header tabel ~ px
const ROW_H = 48;                  // tinggi baris ~ px
const VISIBLE_ROWS = Math.floor((TABLE_HEIGHT_PX - HEADER_H) / ROW_H); // utk skeleton & dummy rows


function useDebounce<T>(value: T, delay = 400) {
   const [v, setV] = useState(value);
   useEffect(() => {
      const t = setTimeout(() => setV(value), delay);
      return () => clearTimeout(t);
   }, [value, delay]);
   return v;
}

export default function LettersTable({ initialParams }: { initialParams: InitialParams }) {
   const router = useRouter();
   const pathname = usePathname();

   const [mastersLoading, setMastersLoading] = useState(true);
   const [categories, setCategories] = useState<MasterCategory[]>([]);
   const [divisions, setDivisions] = useState<MasterDivision[]>([]);

   // Filters/state
   const [q, setQ] = useState(initialParams.q);
   const [category, setCategory] = useState(initialParams.category);
   const [division, setDivision] = useState(initialParams.division);
   const [from, setFrom] = useState<string | undefined>(initialParams.from || undefined);
   const [to, setTo] = useState<string | undefined>(initialParams.to || undefined);
   const [page, setPage] = useState(initialParams.page || 1);
   const [limit, setLimit] = useState(initialParams.limit || 10);

   const [loading, setLoading] = useState(true);
   const [rows, setRows] = useState<LetterRow[]>([]);
   const [total, setTotal] = useState(0);

   const debouncedQ = useDebounce(q);

   // Masters
   useEffect(() => {
      (async () => {
         try {
            setMastersLoading(true);
            const res = await fetch('/api/letters/masters', { cache: 'no-store' });
            const json = await res.json();
            if (!res.ok) throw new Error(json?.error || 'Gagal mengambil master');
            setCategories((json.categories ?? []).filter((c: MasterCategory)=> c.is_active !== false));
            setDivisions(json.divisions ?? []);
         } catch (e:any) {
            toast('Error master', { description: e.message });
         } finally {
            setMastersLoading(false);
         }
      })();
   }, []);

   // Build query string & fetch
   const runFetch = React.useCallback(async () => {
      setLoading(true);
      try {
         const usp = new URLSearchParams();
         if (debouncedQ) usp.set('q', debouncedQ);
         if (category) usp.set('category', category);
         if (division) usp.set('division', division);
         if (from) usp.set('from', from);
         if (to) usp.set('to', to);
         usp.set('page', String(page));
         usp.set('limit', String(limit));

         const url = `/api/numbers?${usp.toString()}`;
         const res = await fetch(url, { cache: 'no-store' });
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal memuat data');

         const items = (json.items as any[]) ?? [];
         const mapped: LetterRow[] = items.map((it) => ({
            id: it.id,
            number_text: it.number_text,
            issued_on: it.issued_on,
            category_code: it.category_code,
            division_code: it.division_code,
            division_name: it.division_name,
            global_serial: it.global_serial,
            daily_serial: it.daily_serial,
            created_at: it.created_at,
            created_by: it.created_by ?? null,
            purpose: it.purpose ?? null,
         }));

         setRows(mapped);
         setTotal(json.total ?? 0);

         // Sinkronkan URL (deep link)
         const urlParams = new URLSearchParams();
         if (q) urlParams.set('q', q);
         if (category) urlParams.set('category', category);
         if (division) urlParams.set('division', division);
         if (from) urlParams.set('from', from);
         if (to) urlParams.set('to', to);
         urlParams.set('page', String(page));
         urlParams.set('limit', String(limit));
         router.replace(`${pathname}?${urlParams.toString()}`);
      } catch (e:any) {
         toast('Error', { description: e.message });
         setRows([]);
         setTotal(0);
      } finally {
         setLoading(false);
      }
   }, [debouncedQ, category, division, from, to, page, limit, q, router, pathname]);

   // Refetch when dependencies change
   useEffect(() => { runFetch(); }, [runFetch]);

   // Pagination helpers
   const totalPages = Math.max(Math.ceil(total / limit), 1);
   const canPrev = page > 1;
   const canNext = page < totalPages;
   function goPrev() { if (canPrev) setPage((p) => p - 1); }
   function goNext() { if (canNext) setPage((p) => p + 1); }

   function resetFilters() {
      setQ("");
      setCategory("");
      setDivision("");
      setFrom(undefined);
      setTo(undefined);
      setPage(1);
   }

   // Dummy rows untuk tinggi tetap
   const visible = VISIBLE_ROWS; // how many rows fit in fixed height
   const fillerRows = Math.max(visible - Math.min(rows.length, visible), 0);

   // Date range UI
   const RangePicker = (
      <Popover>
         <PopoverTrigger asChild>
         <Button variant="outline" className="justify-start w-[260px]">
            <IconCalendar className="mr-2 h-4 w-4" />
            {from || to
               ? `${from ?? '...'} - ${to ?? '...'}`
               : 'Rentang tanggal'}
         </Button>
         </PopoverTrigger>
         <PopoverContent className="p-0" align="start">
            <Calendar
               mode="range"
               selected={{ from: from ? new Date(from) : undefined, to: to ? new Date(to) : undefined }}
               
               onSelect={(range) => {
                  const f = range?.from ? format(range.from, 'yyyy-MM-dd') : undefined;
                  const t = range?.to ? format(range.to, 'yyyy-MM-dd') : undefined;
                  setFrom(f);
                  setTo(t);
                  setPage(1);
               }}
               numberOfMonths={1}
            />
         </PopoverContent>
      </Popover>
   );

   return (
      <Card className="border-muted/40 shadow-sm">
         <CardHeader>
            <CardTitle className="text-xl">Histori Nomor Surat</CardTitle>
            <CardDescription>Lihat, cari, dan filter nomor surat yang telah dibuat.</CardDescription>
         </CardHeader>
         <Separator />
         <CardContent className="pt-6 space-y-4">
         {/* Toolbar filter */}
         <div className="grid gap-3 md:grid-cols-[1fr_220px_220px_260px_auto]">
            {/* Search */}
            <div className="relative">
               <IconSearch className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input
                  placeholder="Cari nomor / kode divisi / kategori…"
                  className="pl-8"
                  value={q}
                  onChange={(e) => { setQ(e.target.value); setPage(1); }}
               />
            </div>

            {/* Kategori */}
            <div>
               <Label className="sr-only">Kategori</Label>
               {mastersLoading ? (
               <Skeleton className="h-10 w-full" />
               ) : (
               <Select
                  value={category || ALL_CATS}
                  onValueChange={(v) => { setCategory(v === ALL_CATS ? "" : v); setPage(1); }}
               >
                  <SelectTrigger className="w-full">
                     <SelectValue placeholder="Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value={ALL_CATS}>Semua Kategori</SelectItem>
                     {categories.map((c) => (
                     <SelectItem key={c.code} value={c.code}>
                        <div className="flex items-center gap-2">
                           <Badge variant="secondary" className="font-mono">{c.code}</Badge>
                           <span>{c.name}</span>
                        </div>
                     </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               )}
            </div>

            {/* Divisi (combobox simple pakai Select agar cepat) */}
            <div>
               <Label className="sr-only">Divisi</Label>
               {mastersLoading ? (
               <Skeleton className="h-10 w-full" />
               ) : (
               <Select
                  value={division || ALL_DIVS}
                  onValueChange={(v) => { setDivision(v === ALL_DIVS ? "" : v); setPage(1); }}
               >
                  <SelectTrigger className="w-full">
                     <SelectValue placeholder="Divisi" />
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value={ALL_DIVS}>Semua Divisi</SelectItem>
                     {divisions.map((d) => (
                     <SelectItem key={d.code} value={d.code}>
                        <div className="flex items-center gap-2">
                           <Badge variant="outline" className="font-mono">
                              {d.code}
                           </Badge>
                           <span>{d.name}</span>
                        </div>
                     </SelectItem>
                     ))}
                  </SelectContent>
               </Select>
               )}
            </div>

            {/* Range tanggal */}
            <div className="flex items-center">{RangePicker}</div>

            {/* Reset */}
            <div className="flex gap-2 justify-end">
               <Button variant="secondary" className="gap-2" onClick={resetFilters}>
                  <IconRefresh className="h-4 w-4" /> Reset
               </Button>
            </div>
         </div>

         {/* Table */}
         <div className="rounded-md border overflow-hidden">
            <div className="overflow-auto" style={{ minHeight: TABLE_HEIGHT_PX }}>
               <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                     <TableRow>
                        <TableHead style={{ width: 220 }}>Nomor</TableHead>
                        <TableHead style={{ width: 120 }}>Tanggal</TableHead>
                        <TableHead style={{ width: 120 }}>Kategori</TableHead>
                        <TableHead style={{ width: 140 }}>Divisi</TableHead>
                        <TableHead style={{ width: 140 }}>Ringkasan</TableHead>
                        <TableHead style={{ width: 160 }}>Dibuat oleh</TableHead>
                        <TableHead style={{ width: 120 }} className="text-right">Global</TableHead>
                        <TableHead style={{ width: 120 }} className="text-right">Harian</TableHead>
                     </TableRow>
                  </TableHeader>
                  <TableBody>
                     {loading ? (
                        Array.from({ length: limit }).map((_, i) => (
                        <TableRow key={`sk-${i}`}>
                           <TableCell><Skeleton className="h-5 w-[200px]" /></TableCell>
                           <TableCell><Skeleton className="h-5 w-[100px]" /></TableCell>
                           <TableCell><Skeleton className="h-5 w-[80px]" /></TableCell>
                           <TableCell><Skeleton className="h-5 w-[120px]" /></TableCell>
                           <TableCell className="text-right"><Skeleton className="h-5 w-[60px] ml-auto" /></TableCell>
                           <TableCell className="text-right"><Skeleton className="h-5 w-[60px] ml-auto" /></TableCell>
                        </TableRow>
                        ))
                     ) : rows.length ? (
                        <>
                        {rows.map((r) => (
                           <TableRow key={r.id} className="hover:bg-muted/40">
                              <TableCell className="font-mono">
                                 {r.number_text}
                              </TableCell>
                              <TableCell>
                                 {new Date(r.issued_on).toLocaleDateString('id-ID')}
                              </TableCell>
                              
                              <TableCell>
                                 <Badge variant="secondary" className="font-mono">\
                                    {r.category_code}
                                 </Badge>
                              </TableCell>
                              
                              <TableCell>
                                 <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="font-mono">
                                       {r.division_code}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                       {r.division_name}
                                    </span>
                                 </div>
                              </TableCell>
                              <TableCell>{r.purpose ?? "-"}</TableCell>
                              <TableCell>{r.created_by ?? "-"}</TableCell>
                              <TableCell className="text-right font-mono">
                                 {r.global_serial}
                              </TableCell>
                              <TableCell className="text-right font-mono">
                                 {r.daily_serial}
                              </TableCell>
                           </TableRow>
                        ))}
                        {/* dummy rows untuk jaga tinggi tabel */}
                        {fillerRows > 0 &&
                           Array.from({ length: fillerRows }).map((_, i) => (
                              <TableRow key={`empty-${i}`}>
                              <TableCell colSpan={6}>&nbsp;</TableCell>
                              </TableRow>
                           ))
                        }
                        </>
                     ) : (
                        <>
                        <TableRow>
                           <TableCell colSpan={6} className="text-center text-muted-foreground">
                              Tidak ada data yang cocok.
                           </TableCell>
                        </TableRow>
                        {/* isi dummy rows agar tinggi tetap */}
                        {Array.from({ length: fillerRows || limit - 1 }).map((_, i) => (
                           <TableRow key={`empty0-${i}`}>
                              <TableCell colSpan={6}>&nbsp;</TableCell>
                           </TableRow>
                        ))}
                        </>
                     )}
                  </TableBody>
               </Table>
            </div>
         </div>

         {/* Pagination bar */}
         <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div className="text-sm text-muted-foreground">
               Menampilkan <b>{rows.length}</b> dari <b>{total}</b> entri • Halaman <b>{page}</b> / <b>{totalPages}</b>
            </div>

            <div className="flex items-center gap-3">
               <div className="flex items-center gap-2">
               <span className="text-sm text-muted-foreground">Limit</span>
               <Select
                  value={String(limit)}
                  onValueChange={(v) => { setLimit(parseInt(v,10)); setPage(1); }}
               >
                  <SelectTrigger className="w-[90px]">
                     <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                     {[10, 20, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
               </Select>
               </div>

               <div className="flex items-center gap-1">
               <Button variant="outline" onClick={goPrev} disabled={!canPrev} size="sm">
                  <IconChevronLeft className="h-4 w-4" />
               </Button>
               <Button variant="outline" onClick={goNext} disabled={!canNext} size="sm">
                  <IconChevronRight className="h-4 w-4" />
               </Button>
               </div>
            </div>
         </div>
         </CardContent>
      </Card>
   );
}
