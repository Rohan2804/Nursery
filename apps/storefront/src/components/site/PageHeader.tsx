import Image from "next/image";
import type { ReactNode } from "react";
import { FadeUp, RevealText } from "@/components/ui/RevealText";
import { cn, img } from "@/lib/utils";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

type Props = {
  eyebrow: string;
  title: ReactNode[];
  intro?: ReactNode;
  crumbs: Crumb[];
  image?: string;
  imageAlt?: string;
  children?: ReactNode;
  className?: string;
};

/** Editorial page header used across content pages. With an image it becomes a split hero. */
export function PageHeader({ eyebrow, title, intro, crumbs, image, imageAlt = "", children, className }: Props) {
  return (
    <header className={cn("container-x pb-14 pt-32 md:pb-20 lg:pt-40", className)}>
      <Breadcrumbs items={crumbs} />
      <div className={cn("mt-10 grid gap-12", image && "lg:grid-cols-[1.15fr_1fr] lg:items-end")}>
        <div>
          <p className="eyebrow text-brass">{eyebrow}</p>
          <RevealText
            as="h1"
            className="mt-5 font-display text-[clamp(3rem,8vw,8rem)] leading-[0.88] tracking-[-0.035em]"
            lines={title}
          />
          {intro && (
            <FadeUp delay={0.2}>
              <div className="mt-8 max-w-xl text-lg leading-relaxed text-cream/70">{intro}</div>
            </FadeUp>
          )}
          {children && <FadeUp delay={0.3}>{children}</FadeUp>}
        </div>
        {image && (
          <FadeUp delay={0.15} className="relative aspect-[5/4] overflow-hidden rounded-[32px] bg-forest-800">
            <Image src={img(image)} alt={imageAlt} fill priority sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
          </FadeUp>
        )}
      </div>
    </header>
  );
}
