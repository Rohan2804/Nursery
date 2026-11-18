export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
  adminUrl: process.env.ADMIN_URL ?? "http://localhost:3001",
  storefrontUrl: process.env.STOREFRONT_URL ?? "http://localhost:3000",
};

export const isConfigured = () => Boolean(env.supabaseUrl && env.supabaseKey);
