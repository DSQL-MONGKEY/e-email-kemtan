export const runtime = 'nodejs';

import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// PUT /api/letters/categories/[code]
export async function PUT(
   req: NextRequest,
   ctx: { params: Promise<{ code: string }> }
) {
   const { code } = await ctx.params;
   const CODE = (code ?? "").toUpperCase();

   const bodySchema = z.object({
      name: z.string().min(2).max(100),
      isActive: z.boolean().optional().default(true),
   });

   try {
      const body = bodySchema.parse(await req.json());
      const { data, error } = await supabase
         .from("letter_categories")
         .update({ name: body.name, is_active: body.isActive })
         .eq("code", CODE)
         .select("code,name,is_active")
         .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      if (!data) return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
      return NextResponse.json({ item: data });
   } catch (e) {
      const msg = e instanceof Error ? e.message : "Invalid payload";
      return NextResponse.json({ error: msg }, { status: 400 });
   }
}

// DELETE /api/letters/categories/[code]
export async function DELETE(
   _req: NextRequest,
   ctx: { params: Promise<{ code: string }> }
) {
   const { code } = await ctx.params;
   const CODE = (code ?? "").toUpperCase();

   // preflight: apakah dipakai di letters?
   const used = await supabase
      .from("letters")
      .select("id", { head: true, count: "exact" })
      .eq("category_code", CODE);

   if (used.error) {
      return NextResponse.json({ error: used.error.message }, { status: 400 });
   }
   if ((used.count ?? 0) > 0) {
      return NextResponse.json(
         { error: `Tidak bisa menghapus. Kategori dipakai di ${used.count} surat. Nonaktifkan saja.` },
         { status: 409 }
      );
   }

   const { error } = await supabase.from("letter_categories").delete().eq("code", CODE);
   if (error) {
      // antisipasi race → FK violation
      if (error.code === "23503" || /foreign key/i.test(error.message)) {
         return NextResponse.json(
         { error: "Tidak bisa menghapus. Kategori masih direferensikan oleh surat." },
         { status: 409 }
         );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
   }

   return NextResponse.json({ ok: true });
}
