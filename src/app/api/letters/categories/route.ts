import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
   code: z.string().trim().transform(s => s.toUpperCase()).refine(s => /^[A-Z]{1,10}$/.test(s), "Kode 1–10 huruf A–Z"),
   name: z.string().min(2).max(100),
   isActive: z.boolean().optional().default(true),
});

export async function GET() {
   const { data, error } = await supabase.from("letter_categories").select("code,name,is_active").order("code");
   if (error) return NextResponse.json({ error: error.message }, { status: 400 });
   return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
   try {
      const json = (await req.json()) as unknown;
      const { code, name, isActive } = bodySchema.parse(json);

      const { data, error } = await supabase
         .from("letter_categories")
         .upsert({ code, name, is_active: isActive }, { onConflict: "code" })
         .select("code,name,is_active")
         .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ item: data });
   } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid payload";
      return NextResponse.json({ error: msg }, { status: 400 });
  }
}
