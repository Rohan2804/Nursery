import { NextResponse, type NextRequest } from "next/server";
import { isPreview } from "@/lib/repo";
import { PREVIEW_ROLE_COOKIE } from "@/lib/repo/preview";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const res = NextResponse.redirect(new URL("/login", request.url), { status: 303 });
  if (isPreview()) {
    res.cookies.delete(PREVIEW_ROLE_COOKIE);
    return res;
  }
  const supabase = await createClient();
  await supabase.auth.signOut();
  return res;
}
