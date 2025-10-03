import { supabase } from "@/lib/supabase/client";
import { NextResponse } from "next/server";

// Cache ringan agar cepat, tapi masih bisa revalidate cepat
export const revalidate = 60;

export async function GET() {

   const [cats, divs] = await Promise.all([
      supabase.from("letter_categories").select("code,name,is_active").eq("is_active", true).order("code"),
      supabase.from("divisions").select("id,code,name").order("code"),
   ]);

   if (cats.error) return NextResponse.json({ error: cats.error.message }, { status: 400 });
   if (divs.error) return NextResponse.json({ error: divs.error.message }, { status: 400 });

   return NextResponse.json({
      categories: cats.data,
      divisions: divs.data,
   });
}
