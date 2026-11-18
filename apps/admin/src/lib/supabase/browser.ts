"use client";

import { createBrowserClient } from "@supabase/ssr";

/** Browser client — used for direct image uploads to Storage (protected by storage policies). */
export const createClient = () =>
  createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!);
