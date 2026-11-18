"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { Field, Select } from "@/components/checkout/fields";
import { cn } from "@/lib/utils";

export type FormField =
  | { name: string; label: string; type: "text" | "email" | "tel" | "date" | "number"; required?: boolean; half?: boolean; min?: string }
  | { name: string; label: string; type: "select"; options: readonly string[]; required?: boolean; half?: boolean }
  | { name: string; label: string; type: "textarea"; required?: boolean; half?: boolean };

type Props = {
  fields: FormField[];
  submitLabel: string;
  successTitle: string;
  successBody: string;
  className?: string;
};

const validators: Partial<Record<string, (v: string) => string | undefined>> = {
  email: (v) => (/^\S+@\S+\.\S+$/.test(v) ? undefined : "Enter a valid email"),
  tel: (v) => (/^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10)) ? undefined : "Enter a 10-digit mobile number"),
};

/**
 * Light-panel enquiry form with validation and a success state.
 * NOTE: submissions are not sent anywhere yet — connect `onSubmit` to your CRM / email API.
 */
export function EnquiryForm({ fields, submitLabel, successTitle, successBody, className }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const set = (name: string, v: string) => {
    setValues((x) => ({ ...x, [name]: v }));
    if (errors[name]) setErrors((x) => ({ ...x, [name]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string | undefined> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (f.required && !v) next[f.name] = "This field is required";
      else if (v && validators[f.type]) next[f.name] = validators[f.type]!(v);
    }
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  return (
    <div className={cn("rounded-[32px] bg-bone p-6 text-forest-950 sm:p-10", className)}>
      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[360px] flex-col items-center justify-center text-center">
            <span className="grid size-16 place-items-center rounded-full bg-moss text-cream">
              <Check className="size-7" />
            </span>
            <p className="mt-6 font-display text-4xl">{successTitle}</p>
            <p className="mt-3 max-w-sm text-forest-950/65">{successBody}</p>
          </motion.div>
        ) : (
          <motion.form key="form" exit={{ opacity: 0, y: -20 }} onSubmit={submit} noValidate className="grid gap-3 sm:grid-cols-2">
            {fields.map((f) => {
              const common = { name: f.name, label: f.label, error: errors[f.name], className: f.half ? undefined : "sm:col-span-2" };
              if (f.type === "select")
                return <Select key={f.name} {...common} options={f.options} value={values[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />;
              if (f.type === "textarea")
                return (
                  <div key={f.name} className="sm:col-span-2">
                    <label htmlFor={f.name} className="sr-only">
                      {f.label}
                    </label>
                    <textarea
                      id={f.name}
                      rows={4}
                      placeholder={f.label}
                      value={values[f.name] ?? ""}
                      onChange={(e) => set(f.name, e.target.value)}
                      className={cn(
                        "w-full resize-none rounded-2xl border bg-white/60 p-4 text-[0.95rem] placeholder:text-forest-950/55 focus:border-forest-950 focus:bg-white focus:outline-none",
                        errors[f.name] ? "border-[#c2410c]" : "border-forest-950/15",
                      )}
                    />
                    {errors[f.name] && <p className="mt-1.5 pl-1 text-xs text-[#c2410c]">{errors[f.name]}</p>}
                  </div>
                );
              return (
                <Field
                  key={f.name}
                  {...common}
                  type={f.type}
                  min={"min" in f ? f.min : undefined}
                  prefix={f.type === "tel" ? "+91" : undefined}
                  inputMode={f.type === "tel" || f.type === "number" ? "numeric" : undefined}
                  value={values[f.name] ?? ""}
                  onChange={(e) => set(f.name, f.type === "tel" ? e.target.value.replace(/\D/g, "").slice(0, 10) : e.target.value)}
                />
              );
            })}
            <button
              type="submit"
              disabled={sending}
              className="group relative mt-3 flex h-14 items-center justify-center overflow-hidden rounded-full bg-forest-950 font-semibold text-cream sm:col-span-2"
            >
              <span className="absolute inset-0 translate-y-full bg-forest-700 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" />
              <span className="relative">{sending ? "Sending…" : submitLabel}</span>
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
