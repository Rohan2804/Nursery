import { LegalPage } from "@/components/site/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Privacy Policy",
  description: `How ${site.legalName} collects, uses and protects your personal data.`,
  path: "/privacy-policy",
});

// Template only — have this reviewed by a lawyer for DPDP Act 2023 compliance before launch.
export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy policy"
      path="/privacy-policy"
      updated="17 November 2026"
      intro={`${site.legalName} ("we", "us") respects your privacy. This policy explains what personal data we collect, why, and the choices you have, in line with India's Digital Personal Data Protection Act, 2023.`}
      sections={[
        {
          heading: "Data we collect",
          body: [
            "Information you give us: your name, mobile number, email, delivery address, gift messages and anything you send us in forms, on WhatsApp or by email.",
            "Order information: what you buy, delivery preferences and payment status. Card and UPI details are handled by our payment partner — we never see or store them.",
            "Usage information: pages visited, device and browser type, collected through essential and (with consent) analytics cookies.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "To process and deliver orders, provide plant-care support, respond to enquiries, prevent fraud, and — only if you opt in — send our newsletter and offers. We never sell your personal data.",
          ],
        },
        {
          heading: "Sharing",
          body: [
            "We share only what's needed with delivery partners (name, address, phone), payment processors, and service providers who host our website and send emails, all bound by confidentiality obligations.",
          ],
        },
        {
          heading: "Storage & security",
          body: ["Data is stored on secure servers with access limited to staff who need it. We keep order records for as long as required by tax law, and other data only as long as it's needed."],
        },
        {
          heading: "Your rights",
          body: [
            `You can ask to access, correct or erase your personal data, withdraw consent for marketing at any time, and nominate someone to exercise your rights. Write to ${site.email} and we'll respond within 30 days.`,
          ],
        },
        {
          heading: "Cookies",
          body: ["Essential cookies keep your bag and sign-in working. Analytics cookies are used only with your consent and can be switched off at any time."],
        },
        {
          heading: "Contact & grievances",
          body: [`For privacy questions or complaints, contact our Grievance Officer at ${site.email} or ${site.address.join(", ")}.`],
        },
      ]}
    />
  );
}
