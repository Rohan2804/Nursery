"use client";

import { Check, Loader2 } from "lucide-react";
import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
const variants: Record<Variant, string> = {
  primary: "bg-forest-950 text-cream hover:bg-forest-700",
  secondary: "border border-line bg-white text-ink hover:border-forest-700/40",
  ghost: "text-ink/70 hover:bg-forest-950/5 hover:text-ink",
  danger: "bg-danger text-white hover:bg-danger/90",
};
const base = "inline-flex h-10 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({ variant = "primary", loading, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; loading?: boolean }) {
  return (
    <button className={cn(base, variants[variant], className)} disabled={loading || rest.disabled} {...rest}>
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function LinkButton({ variant = "primary", className, ...rest }: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...rest} />;
}

/** Labelled form row. Use `group` when the control is a set of buttons (chips, segmented) rather than one input. */
export function Field({ label, hint, error, children, className, counter, group }: { label: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string; counter?: { value: number; max: number }; group?: boolean }) {
  const Tag = group ? "div" : "label";
  return (
    <Tag className={cn("block", className)} {...(group && { role: "group", "aria-label": label })}>
      <span className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {counter && <span className={cn("text-xs tabular-nums", counter.value > counter.max ? "text-danger" : "text-ink/40")}>{counter.value}/{counter.max}</span>}
      </span>
      {children}
      {hint && !error && <span className="mt-1.5 block text-xs text-ink/50">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs text-danger">{error}</span>}
    </Tag>
  );
}

export function Card({ title, description, actions, children, className }: { title?: string; description?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("card p-6", className)}>
      {(title || actions) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            {title && <h2 className="font-display text-2xl leading-tight">{title}</h2>}
            {description && <p className="mt-1 text-sm text-ink/55">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: ReactNode; description?: ReactNode; actions?: ReactNode }) {
  return (
    <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && <p className="eyebrow text-moss">{eyebrow}</p>}
        <h1 className="mt-1 font-display text-5xl leading-[0.95] tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink/60">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

const statusStyle = {
  published: "bg-moss/15 text-forest-700",
  draft: "bg-brass/20 text-[#7a5a22]",
  archived: "bg-ink/10 text-ink/60",
} as const;

export function StatusPill({ status }: { status: keyof typeof statusStyle }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize", statusStyle[status])}><span className="size-1.5 rounded-full bg-current" />{status}</span>;
}

export function StockPill({ stock, threshold }: { stock: number; threshold: number }) {
  const tone = stock === 0 ? "bg-danger/10 text-danger" : stock <= threshold ? "bg-brass/20 text-[#7a5a22]" : "bg-moss/15 text-forest-700";
  return <span className={cn("inline-flex min-w-12 justify-center rounded-full px-2 py-1 text-xs font-bold tabular-nums", tone)}>{stock === 0 ? "Out" : stock}</span>;
}

export function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50", checked ? "bg-forest-700" : "bg-ink/15")}
    >
      <span className={cn("absolute top-1 size-4 rounded-full bg-white shadow transition-all", checked ? "left-6" : "left-1")} />
    </button>
  );
}

export function Chips<T extends string | number>({ options, value, onChange, disabled }: { options: { value: T; label: string }[]; value: T[]; onChange: (v: T[]) => void; disabled?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.value);
        return (
          <button
            key={String(o.value)}
            type="button"
            disabled={disabled}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter((v) => v !== o.value) : [...value, o.value])}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors disabled:opacity-60",
              on ? "border-forest-950 bg-forest-950 text-cream" : "border-line bg-white hover:border-forest-700/40",
            )}
          >
            {on && <Check className="size-3.5" />}
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Segmented<T extends string | number>({ options, value, onChange, disabled }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; disabled?: boolean }) {
  return (
    <div className="inline-flex rounded-full border border-line bg-paper p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition-colors", value === o.value ? "bg-forest-950 text-cream" : "text-ink/60 hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <p className="font-display text-3xl">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-ink/55">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
