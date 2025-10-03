// app/api/numbers/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/client";

// ========= POST: generate nomor =========
const bodySchema = z.object({
   categoryCode: z.string().trim().transform(s => s.toUpperCase()).refine(s => /^[A-Z]{1,10}$/.test(s), "1–10 huruf A–Z"),
   divisionCode: z.string().min(1).trim().transform(s => s.toUpperCase()),
   issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
   purpose: z.string().trim().max(300).optional(),
});

export async function POST(req: NextRequest) {
   try {
      await auth();
      const user = await currentUser();

      const json = (await req.json()) as unknown;
      const { categoryCode, divisionCode, issueDate, purpose } = bodySchema.parse(json);

      const createdBy =
         user?.primaryEmailAddress?.emailAddress ??
         user?.username ??
         user?.id ??
         null;

      const { data, error } = await supabase.rpc("generate_letter_number", {
         p_category: categoryCode,
         p_division_code: divisionCode,
         p_issue_date: issueDate ?? null,
         p_created_by: createdBy,
         p_purpose: purpose ?? null,
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
         createdBy: data.created_by ?? createdBy ?? null,
         purpose: data.purpose ?? null,
      });
   } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid payload";
      return NextResponse.json({ error: msg }, { status: 400 });
   }
}

   // ========= GET: list + filter + pagination =========
export async function GET(req: NextRequest) {
   const url = new URL(req.url);

   const from = url.searchParams.get("from");            // YYYY-MM-DD
   const to = url.searchParams.get("to");                // YYYY-MM-DD
   const category = url.searchParams.get("category");    // e.g. B / URGENT
   const division = url.searchParams.get("division");    // e.g. TU.040
   const q = (url.searchParams.get("q") ?? "").trim();   // free text
   const page = Math.max(parseInt(url.searchParams.get("page") || "1", 10), 1);
   const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "10", 10), 5), 100);

   const fromIdx = (page - 1) * limit;
   const toIdx = fromIdx + limit - 1;

   // base query ke view letters_v (sudah mengandung created_by & purpose)
   let qb = supabase
      .from("letters_v")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(fromIdx, toIdx);

   if (from) qb = qb.gte("issued_on", from);
   if (to) qb = qb.lte("issued_on", to);
   if (category) qb = qb.eq("category_code", category);
   if (division) qb = qb.eq("division_code", division);

   // Pencarian sederhana: coba di number_text → division_code → category_code
   if (q) {
      const tryOnce = async (col: "number_text" | "division_code" | "category_code") =>
         supabase
         .from("letters_v")
         .select("*", { count: "exact" })
         .order("created_at", { ascending: false })
         .range(fromIdx, toIdx)
         .ilike(col, `%${q}%`);

      const a = await tryOnce("number_text");
      if (!a.error && a.data && a.data.length) {
         return NextResponse.json({ items: a.data, total: a.count ?? 0, page, limit });
      }
      const b = await tryOnce("division_code");
      if (!b.error && b.data && b.data.length) {
         return NextResponse.json({ items: b.data, total: b.count ?? 0, page, limit });
      }
      const c = await tryOnce("category_code");
      if (!c.error) {
         return NextResponse.json({ items: c.data ?? [], total: c.count ?? 0, page, limit });
      }
      return NextResponse.json({ error: c.error?.message ?? "Search error" }, { status: 400 });
   }

   const { data, error, count } = await qb;
   if (error) return NextResponse.json({ error: error.message }, { status: 400 });

   return NextResponse.json({
      items: data ?? [],
      total: count ?? 0,
      page,
      limit,
   });
}
