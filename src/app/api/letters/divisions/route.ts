import { supabase } from "@/lib/supabase/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
   code: z.string().trim().transform(s => s.toUpperCase()).refine(s => /^[A-Z0-9.\-]{2,20}$/.test(s), "Huruf/angka/.-, 2–20"),
   name: z.string().min(2).max(100),
});

export async function GET() {
   const { data, error } = await supabase.from("divisions").select("id,code,name").order("code");
   if (error) return NextResponse.json({ error: error.message }, { status: 400 });
   return NextResponse.json({ items: data });
}

export async function POST(req: NextRequest) {
   try {
      const json = (await req.json()) as unknown;
      const { code, name } = bodySchema.parse(json);

      const { data, error } = await supabase
         .from("divisions")
         .upsert({ code, name }, { onConflict: "code" })
         .select("id,code,name")
         .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ item: data });
   } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid payload";
      return NextResponse.json({ error: msg }, { status: 400 });
   }
}
