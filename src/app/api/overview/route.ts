import { NextResponse } from "next/server";
import {
  OverviewSeriesRow, OverviewTopCategoryRow, OverviewTopDivisionRow,
} from "@/types/api";
import { supabase } from "@/lib/supabase/client";

export const revalidate = 30;

const ymd = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export async function GET() {

   const now = new Date();
   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
   const start30 = new Date(today); start30.setDate(today.getDate() - 29);
   const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

   const p_from = ymd(start30);
   const p_to = ymd(today);

   const [
      totalQ,
      todayQ,
      monthQ,
      seriesQ,
      topCatQ,
      topDivQ,
      recentLettersQ,
      recentVisitorsQ,
      mastersCatsQ,
      mastersDivsQ,
   ] = await Promise.all([
      supabase.from("letters").select("id", { head: true, count: "exact" }),
      supabase.from("letters").select("id", { head: true, count: "exact" }).gte("issued_on", ymd(today)).lte("issued_on", ymd(today)),
      supabase.from("letters").select("id", { head: true, count: "exact" }).gte("issued_on", ymd(monthStart)).lte("issued_on", ymd(today)),
      supabase.rpc("letters_count_between", { p_from, p_to }),
      supabase.rpc("letters_top_categories", { p_limit: 5 }),
      supabase.rpc("letters_top_divisions", { p_limit: 5 }),
      supabase.from("letters_v").select("*").order("created_at", { ascending: false }).limit(8),
      supabase.from("activity_last_seen").select("*").order("last_seen", { ascending: false }).limit(10),
      supabase.from("letter_categories").select("code", { head: true, count: "exact" }),
      supabase.from("divisions").select("id", { head: true, count: "exact" }),
   ]);

   const bail = (e?: unknown) => NextResponse.json({ error: e instanceof Error ? e.message : "Overview query failed" }, { status: 400 });

   if (totalQ.error) return bail(totalQ.error);
   if (todayQ.error) return bail(todayQ.error);
   if (monthQ.error) return bail(monthQ.error);
   if (seriesQ.error) return bail(seriesQ.error);
   if (topCatQ.error) return bail(topCatQ.error);
   if (topDivQ.error) return bail(topDivQ.error);
   if (recentLettersQ.error) return bail(recentLettersQ.error);
   if (recentVisitorsQ.error) return bail(recentVisitorsQ.error);
   if (mastersCatsQ.error) return bail(mastersCatsQ.error);
   if (mastersDivsQ.error) return bail(mastersDivsQ.error);

   const series = (seriesQ.data as OverviewSeriesRow[] | null ?? []).map(r => ({
      date: String(r.issued_on).slice(5),
      count: Number(r.cnt) || 0,
   }));

   const topCategories = (topCatQ.data as OverviewTopCategoryRow[] | null ?? [])
      .map(r => ({ code: r.category_code, count: Number(r.cnt) || 0 }));

   const topDivisions = (topDivQ.data as OverviewTopDivisionRow[] | null ?? [])
      .map(r => ({ code: r.division_code, name: r.division_name, count: Number(r.cnt) || 0 }));

   return NextResponse.json({
      totals: {
         letters: totalQ.count ?? 0,
         today: todayQ.count ?? 0,
         thisMonth: monthQ.count ?? 0,
         categories: mastersCatsQ.count ?? 0,
         divisions: mastersDivsQ.count ?? 0,
      },
      series30: series,
      topCategories,
      topDivisions,
      recentLetters: recentLettersQ.data ?? [],
      recentVisitors: recentVisitorsQ.data ?? [],
   });
}
