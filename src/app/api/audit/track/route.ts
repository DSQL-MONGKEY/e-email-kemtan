import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
   try {
      await auth(); // ensure session context
      const user = await currentUser();
      const { path } = await req.json();

      const ua = req.headers.get("user-agent") ?? "";

      const { error } = await supabase.from("activity_logs").insert({
         user_id: user?.id ?? null,
         user_email: user?.primaryEmailAddress?.emailAddress ?? null,
         user_name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || null,
         path: path || null,
         user_agent: ua,
      });

      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true });
   } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      return NextResponse.json({ error: msg }, { status: 400 });
   }
}
