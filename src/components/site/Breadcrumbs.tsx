import Link from "next/link";
import { Fragment } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type Crumb = { name: string; path: string };

/** Visible breadcrumb trail plus BreadcrumbList structured data. "Home" is added automatically. */
export function Breadcrumbs({ items, light }: { items: Crumb[]; light?: boolean }) {
  const all = [{ name: "Home", path: "/" }, ...items];
  return (
    <>
      <nav aria-label="Breadcrumb">
        <ol className={cn("flex flex-wrap items-center gap-2 text-xs", light ? "text-forest-950/50" : "text-cream/50")}>
          {all.map((c, i) => (
            <Fragment key={c.path}>
              {i > 0 && <li aria-hidden>/</li>}
              <li>
                {i === all.length - 1 ? (
                  <span aria-current="page" className={light ? "text-forest-950/80" : "text-cream/80"}>
                    {c.name}
                  </span>
                ) : (
                  <Link href={c.path} className={light ? "hover:text-moss" : "hover:text-lime"}>
                    {c.name}
                  </Link>
                )}
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
      <JsonLd data={breadcrumbLd(all)} />
    </>
  );
}
