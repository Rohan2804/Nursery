import { AccountView } from "@/components/account/AccountView";
import { PageHeader } from "@/components/site/PageHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "My Account",
  description: "Sign in to track orders, manage addresses and see your saved plants.",
  path: "/account",
  noIndex: true,
});

export default function AccountPage() {
  return (
    <main>
      <PageHeader
        eyebrow="Account"
        crumbs={[{ name: "My account", path: "/account" }]}
        title={[
          <>
            My <em className="text-lime">Vanam.</em>
          </>,
        ]}
      />
      <div className="container-x pb-28">
        <AccountView />
      </div>
    </main>
  );
}
