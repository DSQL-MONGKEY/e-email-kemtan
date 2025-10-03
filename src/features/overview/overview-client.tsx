/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

import {
   ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip,
   PieChart, Pie, Cell,
} from 'recharts';
import { IconRefresh } from '@tabler/icons-react';
import { toast } from 'sonner';

type APIData = {
   totals: { letters: number; today: number; thisMonth: number; categories: number; divisions: number; };
   series30: { date: string; count: number; }[];
   topCategories: { code: string; count: number; }[];
   topDivisions: { code: string; name: string; count: number; }[];
   recentLetters: any[];
   recentVisitors: { user_id: string; user_email: string; user_name: string; last_seen: string; }[];
};

export default function OverviewClient({ initial }: { initial: APIData | null }) {
   const [data, setData] = useState<APIData | null>(initial);
   const [loading, setLoading] = useState(!initial);

   // Track access
   useEffect(() => {
      fetch('/api/audit/track', {
         method: 'POST',
         headers: { 'content-type': 'application/json' },
         body: JSON.stringify({ path: '/dashboard/overview' })
      }).catch(()=>{});
   }, []);

   // Client fetch fallback / refresh
   async function refresh() {
      try {
         setLoading(true);
         const res = await fetch('/api/overview', { cache: 'no-store' });
         const json = await res.json();
         if (!res.ok) throw new Error(json?.error || 'Gagal memuat overview');
         setData(json);
      } catch (e) {
         if(e instanceof Error) {
            toast('Error',{ description: e.message });
         }
      } finally {
         setLoading(false);
      }
   }
   useEffect(() => { if (!initial) refresh(); }, []); // first load if needed

   const COLORS = ['hsl(var(--primary))','hsl(var(--muted-foreground))','hsl(var(--secondary))','hsl(var(--accent))','hsl(var(--destructive))'];

   return (
      <div className="space-y-6">
         {/* Header action */}
         <div className="flex items-center justify-between">
         <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Ringkasan aktivitas dan statistik penomoran.</p>
         </div>
         <Button variant="outline" className="gap-2" onClick={refresh}>
            <IconRefresh className="h-4 w-4" /> Refresh
         </Button>
         </div>

         {/* KPI Cards */}
         <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
         {loading || !data ? (
            Array.from({length:4}).map((_,i)=>(
               <Card key={i}><CardHeader><Skeleton className="h-4 w-[120px]" /></CardHeader><CardContent><Skeleton className="h-10 w-[80px]" /></CardContent></Card>
            ))
         ) : (
            <>
               <KPICard title="Total Surat" value={data.totals.letters} footer={`${data.totals.categories} kategori • ${data.totals.divisions} divisi`} />
               <KPICard title="Hari Ini" value={data.totals.today} footer="Surat terbit" />
               <KPICard title="Bulan Ini" value={data.totals.thisMonth} footer="Akumulasi" />
               <KPICard title="Rata-rata 30 Hari" value={avg(data.series30).toFixed(1)} footer="surat / hari" />
            </>
         )}
         </div>

         {/* Charts */}
         <div className="grid gap-4 lg:grid-cols-3">
         <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
               <CardTitle>30 Hari Terakhir</CardTitle>
               <CardDescription>Jumlah surat per hari</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
               {loading || !data ? (
               <Skeleton className="h-[260px] w-full" />
               ) : (
               <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <LineChart data={data.series30}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                     <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                     <Tooltip />
                     <Line type="monotone" dataKey="count" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                     </LineChart>
                  </ResponsiveContainer>
               </div>
               )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2">
               <CardTitle>Top Kategori</CardTitle>
               <CardDescription>5 terbanyak</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
               {loading || !data ? (
               <Skeleton className="h-[260px] w-full" />
               ) : data.topCategories.length ? (
               <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                     <Pie data={data.topCategories} dataKey="count" nameKey="code" outerRadius={100} innerRadius={55}>
                        {data.topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                     </Pie>
                     <Tooltip />
                     </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-wrap gap-2 justify-center mt-2">
                     {data.topCategories.map((c,)=>(
                     <Badge key={c.code} variant="secondary" className="font-mono">{c.code} • {c.count}</Badge>
                     ))}
                  </div>
               </div>
               ) : <div className="text-sm text-muted-foreground">Belum ada data.</div>}
            </CardContent>
         </Card>
         </div>

         {/* Bottom grid: Recent Letters & Visitors */}
         <div className="grid gap-4 lg:grid-cols-3">
         <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
               <CardTitle>Surat Terbaru</CardTitle>
               <CardDescription>8 entri terakhir</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
               {loading || !data ? (
               <div className="space-y-2">{Array.from({length:8}).map((_,i)=><Skeleton key={i} className="h-9 w-full" />)}</div>
               ) : (
               <div className="rounded-md border overflow-hidden">
                  <div className="max-h-[320px] overflow-auto">
                     <Table>
                     <TableHeader className="sticky top-0 bg-background z-10">
                        <TableRow>
                           <TableHead style={{width: 240}}>Nomor</TableHead>
                           <TableHead style={{width: 120}}>Tanggal</TableHead>
                           <TableHead style={{width: 120}}>Kategori</TableHead>
                           <TableHead>Divisi</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {data.recentLetters.map((r:any)=>(
                           <TableRow key={r.id} className="hover:bg-muted/40">
                           <TableCell className="font-mono">{r.number_text}</TableCell>
                           <TableCell>{new Date(r.issued_on).toLocaleDateString('id-ID')}</TableCell>
                           <TableCell><Badge variant="secondary" className="font-mono">{r.category_code}</Badge></TableCell>
                           <TableCell>
                              <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="font-mono">{r.division_code}</Badge>
                                 <span className="text-muted-foreground">{r.division_name}</span>
                              </div>
                           </TableCell>
                           </TableRow>
                        ))}
                        {!data.recentLetters.length && (
                           <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Belum ada data.</TableCell></TableRow>
                        )}
                     </TableBody>
                     </Table>
                  </div>
               </div>
               )}
            </CardContent>
         </Card>

         <Card>
            <CardHeader className="pb-2">
               <CardTitle>Akses Terakhir</CardTitle>
               <CardDescription>Pengguna yang baru aktif</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
               {loading || !data ? (
               <div className="space-y-3">
                  {Array.from({length:8}).map((_,i)=><Skeleton key={i} className="h-10 w-full" />)}
               </div>
               ) : data.recentVisitors.length ? (
               <ul className="space-y-3">
                  {data.recentVisitors.map((u)=>(
                     <li key={u.user_id} className="flex items-center gap-3 rounded-md border p-2">
                     <Avatar className="h-8 w-8">
                        <AvatarFallback>{initials(u.user_name || u.user_email)}</AvatarFallback>
                     </Avatar>
                     <div className="min-w-0">
                        <div className="text-sm truncate">{u.user_name || u.user_email}</div>
                        <div className="text-xs text-muted-foreground">{new Date(u.last_seen).toLocaleString('id-ID')}</div>
                     </div>
                     </li>
                  ))}
               </ul>
               ) : (
               <div className="text-sm text-muted-foreground">Belum ada log akses.</div>
               )}
            </CardContent>
         </Card>
         </div>
      </div>
   );
}

function KPICard({ title, value, footer }: { title: string; value: number|string; footer?: string; }) {
   return (
      <Card className="border-muted/40 shadow-sm">
         <CardHeader className="pb-2">
         <CardDescription>{title}</CardDescription>
         <CardTitle className="text-3xl">{value}</CardTitle>
         </CardHeader>
         {footer && <CardContent className="pt-0"><div className="text-xs text-muted-foreground">{footer}</div></CardContent>}
      </Card>
   );
}

function initials(s?: string|null) {
   if (!s) return "U";
   const parts = s.trim().split(/\s+/).slice(0,2);
   return parts.map(p=>p[0]?.toUpperCase()).join("") || "U";
}
function avg(arr: {count:number}[]) { if (!arr.length) return 0; return arr.reduce((a,b)=>a+b.count,0)/arr.length; }
