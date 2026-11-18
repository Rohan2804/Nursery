"use client";

import { ChevronDown } from "lucide-react";
import type { InputHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string; prefix?: string };

/** Floating-label input for the light checkout panel. */
export function Field({ label, error, prefix, className, id, ...rest }: FieldProps) {
  const fieldId = id ?? rest.name;
  return (
    <div className={className}>
      <div
        className={cn(
          "relative flex h-16 items-end rounded-2xl border bg-white/60 px-4 pb-2.5 transition-colors focus-within:border-forest-950 focus-within:bg-white",
          error ? "border-[#c2410c]" : "border-forest-950/15",
        )}
      >
        {prefix && <span className="mr-2 pb-px text-[0.95rem] text-forest-950/60">{prefix}</span>}
        <input
          id={fieldId}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={error ? `${fieldId}-error` : undefined}
          className="peer w-full bg-transparent text-[0.95rem] text-forest-950 focus:outline-none"
          {...rest}
        />
        <label
          htmlFor={fieldId}
          className={cn(
            "pointer-events-none absolute left-4 top-2.5 text-xs text-forest-950/55 transition-all duration-300",
            "peer-placeholder-shown:top-5 peer-placeholder-shown:text-[0.95rem] peer-focus:top-2.5 peer-focus:text-xs",
            prefix && "peer-placeholder-shown:left-[3.1rem]",
          )}
        >
          {label}
        </label>
      </div>
      {error && (
        <p id={`${fieldId}-error`} className="mt-1.5 pl-1 text-xs text-[#c2410c]">
          {error}
        </p>
      )}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: readonly string[] };

export function Select({ label, error, options, className, id, ...rest }: SelectProps) {
  const fieldId = id ?? rest.name;
  return (
    <div className={className}>
      <div
        className={cn(
          "relative h-16 rounded-2xl border bg-white/60 transition-colors focus-within:border-forest-950 focus-within:bg-white",
          error ? "border-[#c2410c]" : "border-forest-950/15",
        )}
      >
        <label htmlFor={fieldId} className="pointer-events-none absolute left-4 top-2.5 text-xs text-forest-950/55">
          {label}
        </label>
        <select
          id={fieldId}
          aria-invalid={!!error}
          className="h-full w-full appearance-none bg-transparent px-4 pt-5 text-[0.95rem] text-forest-950 focus:outline-none"
          {...rest}
        >
          <option value="">Select</option>
          {options.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-forest-950/50" />
      </div>
      {error && <p className="mt-1.5 pl-1 text-xs text-[#c2410c]">{error}</p>}
    </div>
  );
}

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
  "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman & Nicobar Islands", "Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu", "Delhi", "Jammu & Kashmir", "Ladakh", "Lakshadweep", "Puducherry",
] as const;
