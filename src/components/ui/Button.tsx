"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/SmoothScroll";
import { scrollToHash } from "@/lib/utils";
import { Magnetic } from "./Magnetic";

type Variant = "solid" | "ghost" | "dark";

const styles: Record<Variant, string> = {
  solid: "bg-lime text-forest-950",
  ghost: "border border-cream/30 text-cream backdrop-blur-sm",
  dark: "bg-forest-950 text-cream",
};

const fill: Record<Variant, string> = {
  solid: "bg-cream",
  ghost: "bg-cream",
  dark: "bg-forest-700",
};

const hoverText: Record<Variant, string> = {
  solid: "",
  ghost: "group-hover:text-forest-950",
  dark: "",
};

type Props = Omit<ComponentProps<"a">, "children"> & {
  children: ReactNode;
  variant?: Variant;
  icon?: boolean;
  magnetic?: boolean;
};

/** Pill CTA with a liquid fill on hover. In-page hashes scroll smoothly. */
export function Button({ children, variant = "solid", icon = true, magnetic = true, className, href = "#", onClick, ...rest }: Props) {
  const lenis = useLenis();

  const classes = cn(
    "group relative inline-flex h-14 items-center gap-3 overflow-hidden rounded-full px-7 text-[0.95rem] font-semibold tracking-tight transition-colors duration-500",
    styles[variant],
    hoverText[variant],
    className,
  );
  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 translate-y-full rounded-[50%] transition-[translate,border-radius] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0 group-hover:rounded-none",
          fill[variant],
        )}
      />
      <span className="relative">{children}</span>
      {icon && (
        <span className="relative grid size-7 place-items-center overflow-hidden rounded-full bg-current/10">
          <ArrowUpRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-5 group-hover:translate-x-5" />
          <ArrowUpRight className="absolute size-4 -translate-x-5 translate-y-5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-0 group-hover:translate-y-0" />
        </span>
      )}
    </>
  );

  // Internal routes use client-side navigation; in-page hashes glide; everything else is a plain link.
  const link = href.startsWith("/") ? (
    <Link href={href} onClick={onClick} className={classes} {...rest}>
      {inner}
    </Link>
  ) : (
    <a
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (href.startsWith("#") && href.length > 1) {
          e.preventDefault();
          scrollToHash(href, lenis);
        }
      }}
      className={classes}
      {...rest}
    >
      {inner}
    </a>
  );

  return magnetic ? <Magnetic strength={0.2}>{link}</Magnetic> : link;
}
