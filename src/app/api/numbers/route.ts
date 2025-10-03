import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
   categoryCode: z.string().trim().transform(s => s.toUpperCase()).refine(s => /^[A-Z]{1,10}$/.test(s), "1–10 huruf A–Z"),
   divisionCode: z.string().min(1).trim().transform(s => s.toUpperCase()),
   issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function POST(req: NextRequest) {
   try {
      const json = (await req.json()) as unknown;
      const { categoryCode, divisionCode, issueDate } = bodySchema.parse(json);

      const { data, error } = await supabase.rpc("generate_letter_number", {
         p_category: categoryCode,
         p_division_code: divisionCode,
         p_issue_date: issueDate ?? null,
         p_created_by: null,
      });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });

      return NextResponse.json({
         id: data.id,
         number: data.number_text,
         issuedOn: data.issued_on,
         category: data.category_code,
         divisionId: data.division_id,
         globalSerial: data.global_serial,
         dailySerial: data.daily_serial,
      });
   } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid payload";
      return NextResponse.json({ error: msg }, { status: 400 });
   }
}

export async function GET(req: NextRequest) {
   const url = new URL(req.url);

   const from = url.searchParams.get("from");
   const to = url.searchParams.get("to");
   const category = url.searchParams.get("category");
   const divisionCode = url.searchParams.get("division");
   const q = (url.searchParams.get("q") ?? "").trim();
   const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
   const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "10", 10), 5), 100);

   const fromIdx = (page - 1) * limit;
   const toIdx = fromIdx + limit - 1;

   // base query
   let qb = supabase
      .from("letters_v")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(fromIdx, toIdx);

   if (from) qb = qb.gte("issued_on", from);
   if (to) qb = qb.lte("issued_on", to);
   if (category) qb = qb.eq("category_code", category);
   if (divisionCode) qb = qb.eq("division_code", divisionCode);

   if (q) {
      // strategi sederhana: coba di number_text → division_code → category_code
      const tryOnce = async (col: "number_text" | "division_code" | "category_code") =>
         supabase
         .from("letters_v")
         .select("*", { count: "exact" })
         .order("created_at", { ascending: false })
         .range(fromIdx, toIdx)
         .ilike(col, `%${q}%`);

      const first = await tryOnce("number_text");
      if (!first.error && first.data && first.data.length) {
         return NextResponse.json({ items: first.data, total: first.count ?? 0, page, limit });
      }
      const second = await tryOnce("division_code");
      if (!second.error && second.data && second.data.length) {
         return NextResponse.json({ items: second.data, total: second.count ?? 0, page, limit });
      }
      const third = await tryOnce("category_code");
      if (!third.error) {
         return NextResponse.json({ items: third.data ?? [], total: third.count ?? 0, page, limit });
      }
      return NextResponse.json({ error: third.error?.message ?? "Search error" }, { status: 400 });
   }

   const { data, error, count } = await qb;
   if (error) return NextResponse.json({ error: error.message }, { status: 400 });

   return NextResponse.json({ items: data ?? [], total: count ?? 0, page, limit });
}
