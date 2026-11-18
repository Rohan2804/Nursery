import { LoginForm } from "./LoginForm";

export const metadata = { title: "Sign in" };

const notices: Record<string, string> = {
  "not-authorised": "Please sign in with an admin account.",
  "link-expired": "That link has expired. Request a new one below.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next = "/", error } = await searchParams;
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-forest-950 p-12 text-cream lg:flex lg:flex-col lg:justify-between">
        <p className="font-display text-3xl">
          Vanam<span className="text-brass">.</span> <span className="eyebrow ml-2 align-middle text-sage">Admin</span>
        </p>
        <div>
          <h1 className="font-display text-7xl leading-[0.9]">
            Tend the <em className="text-lime">catalog.</em>
          </h1>
          <p className="mt-6 max-w-sm text-cream/60">Plants, prices, photos, stock and collections — everything the storefront shows, managed here.</p>
        </div>
        <p className="text-xs text-cream/40">Restricted area · activity is logged</p>
      </section>
      <section className="grid place-items-center p-6">
        <div className="w-full max-w-sm">
          <LoginForm next={next} notice={error ? notices[error] : undefined} />
        </div>
      </section>
    </main>
  );
}
