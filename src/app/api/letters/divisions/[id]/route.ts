/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";

import { z } from 'zod';

type Params = Promise<{ id: string }>;

const putSchema = z.object({
   code: z
      .string()
      .trim().regex(/^[A-Z0-9.\-]{2,20}$/, 'Huruf/angka/.-, 2–20 karakter')
      .transform((s) => s.toUpperCase())
      ,
   name: z.string().min(2).max(100),
});

export async function PUT(req: NextRequest, ctx: { params: Params }) {
   const { id } = await ctx.params;
   if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

   try {
      const body = putSchema.parse(await req.json());

      const { data, error } = await supabase
         .from('divisions')
         .update({ code: body.code, name: body.name })
         .eq('id', id)
         .select('id,code,name')
         .single();

      if (error) {
         // Unique code conflict → 409
         const status = /duplicate key|unique/i.test(error.message) ? 409 : 400;
         return NextResponse.json({ error: error.message }, { status });
      }
      if (!data) return NextResponse.json({ error: 'Divisi tidak ditemukan' }, { status: 404 });

      return NextResponse.json({ item: data });
   } catch (e) {
      const msg = e instanceof Error ? e.message : 'Invalid payload';
      return NextResponse.json({ error: msg }, { status: 400 });
   }
}


export async function DELETE(
   _req: NextRequest,
   ctx: { params: Params }
) {
   const { id } = await ctx.params;

   // 1) Preflight: apakah masih dipakai di letters?
   const used = await supabase
      .from("letters")
      .select("id", { head: true, count: "exact" })
      .eq("division_id", id);

   if (used.error) {
      return NextResponse.json(
         { error: `Gagal mengecek pemakaian divisi: ${used.error.message}` },
         { status: 400 }
      );
   }

   if ((used.count ?? 0) > 0) {
      return NextResponse.json(
         { error: `Tidak bisa menghapus. Divisi dipakai di ${used.count} surat.` },
         { status: 409 }
      );
   }

   // 2) Eksekusi delete
   const { error } = await supabase.from("divisions").delete().eq("id", id);

   if (error) {
      // Tangkap FK violation bila preflight gagal karena RLS dsb.
      const code = (error as any).code as string | undefined;
      if (code === "23503" || /foreign key/i.test(error.message)) {
         return NextResponse.json(
         { error: "Tidak bisa menghapus. Divisi masih direferensikan oleh surat." },
         { status: 409 }
         );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
   }

   return NextResponse.json({ ok: true });
}
