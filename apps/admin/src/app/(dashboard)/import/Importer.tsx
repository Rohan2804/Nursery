"use client";

import { Download, FileUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useToast } from "@/components/Toast";
import { Button, Card, LinkButton } from "@/components/ui";
import { cn } from "@/lib/cn";
import { parseCsv, PLANT_COLUMNS } from "@/lib/csv";
import { rowSchema, type ImportRow } from "@/lib/import-schema";
import { importPlants } from "./actions";

type Parsed = { row: ImportRow; line: number; error?: string; isNew: boolean };

export function Importer({ existingSlugs }: { existingSlugs: string[] }) {
  const [parsed, setParsed] = useState<Parsed[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [fatal, setFatal] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const input = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  const read = async (file: File) => {
    setFileName(file.name);
    setFatal(null);
    const rows = parseCsv(await file.text());
    const [header, ...body] = rows;
    const cols = header?.map((h) => h.trim().toLowerCase()) ?? [];
    const missing = PLANT_COLUMNS.filter((c) => !cols.includes(c));
    if (missing.length) {
      setParsed(null);
      return setFatal(`Missing columns: ${missing.join(", ")}. Start from an exported file.`);
    }
    setParsed(
      body.map((cells, i) => {
        const row = Object.fromEntries(PLANT_COLUMNS.map((c) => [c, (cells[cols.indexOf(c)] ?? "").trim()])) as unknown as ImportRow;
        const check = rowSchema.safeParse(row);
        const issue = check.success ? undefined : `${check.error.issues[0].path.join(".")}: ${check.error.issues[0].message}`;
        return { row, line: i + 2, error: issue, isNew: !existingSlugs.includes(String(row.slug)) };
      }),
    );
  };

  const errors = parsed?.filter((p) => p.error) ?? [];
  const valid = parsed?.filter((p) => !p.error) ?? [];

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="space-y-6">
        <Card title="1. Export" description="Download the current catalog as CSV.">
          <LinkButton href="/api/export/plants" variant="secondary" prefetch={false}>
            <Download className="size-4" /> Download CSV
          </LinkButton>
        </Card>
        <Card title="2. Edit" description="Change prices, stock, status or descriptions. Separate multiple light/placement values with |. Add a row with a new slug to create a plant (as draft by default).">
          <p className="text-xs text-ink/50">Photos and care details aren&rsquo;t in the file — edit those in the plant editor.</p>
        </Card>
        <Card title="3. Import" description="Nothing changes until you confirm.">
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex w-full flex-col items-center rounded-2xl border-2 border-dashed border-line px-4 py-8 text-center hover:border-forest-700/40"
          >
            <FileUp className="size-6 text-moss" />
            <span className="mt-2 text-sm font-semibold">{fileName || "Choose a CSV file"}</span>
          </button>
          <input
            ref={input}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) read(f);
              e.target.value = "";
            }}
          />
          {fatal && <p className="mt-3 text-sm text-danger">{fatal}</p>}
        </Card>
      </div>

      <Card
        title="Preview"
        description={parsed ? `${valid.length} ready · ${valid.filter((p) => p.isNew).length} new · ${errors.length} with errors` : "Choose a file to see what will change."}
        actions={
          parsed &&
          valid.length > 0 && (
            <Button
              loading={pending}
              onClick={() =>
                start(async () => {
                  const res = await importPlants(valid.map((p) => p.row));
                  if (!res.ok) return toast("error", res.error);
                  toast("success", res.message ?? "Imported");
                  setParsed(null);
                  setFileName("");
                  router.refresh();
                })
              }
            >
              Import {valid.length} plants
            </Button>
          )
        }
      >
        {parsed && (
          <div className="max-h-[640px] overflow-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="text-left text-xs uppercase tracking-wider text-ink/45">
                  <th className="py-2 font-semibold">Line</th>
                  <th className="py-2 font-semibold">Plant</th>
                  <th className="py-2 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Prices S/M/L</th>
                  <th className="py-2 font-semibold">Stock S/M/L</th>
                  <th className="py-2 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((p) => (
                  <tr key={p.line} className={cn("border-t border-line", p.error && "bg-danger/5")}>
                    <td className="py-2 text-ink/45">{p.line}</td>
                    <td className="py-2">
                      <p className="font-semibold">{p.row.name}</p>
                      <p className="font-mono text-xs text-ink/45">{p.row.slug}</p>
                    </td>
                    <td className="py-2 capitalize">{String(p.row.status ?? "")}</td>
                    <td className="py-2 tabular-nums">{[p.row.price_s, p.row.price_m, p.row.price_l].map((x) => x || "—").join(" / ")}</td>
                    <td className="py-2 tabular-nums">{[p.row.stock_s, p.row.stock_m, p.row.stock_l].map((x) => x || "0").join(" / ")}</td>
                    <td className="py-2 text-xs">
                      {p.error ? <span className="text-danger">{p.error}</span> : p.isNew ? <span className="font-bold text-moss">New</span> : "Update"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
