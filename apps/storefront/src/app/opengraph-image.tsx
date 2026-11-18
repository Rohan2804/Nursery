import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default social share card, generated at build time with the bundled brand serif (OFL-licensed). */
export default async function OpengraphImage() {
  const [regular, italic] = await Promise.all([
    readFile(join(process.cwd(), "src/assets/InstrumentSerif-Regular.ttf")),
    readFile(join(process.cwd(), "src/assets/InstrumentSerif-Italic.ttf")),
  ]);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(circle at 80% 20%, #1c3628 0%, #08110c 60%)",
          color: "#ece6d8",
          fontFamily: "Instrument Serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 22, letterSpacing: 6, color: "#a8b89a", textTransform: "uppercase" }}>
          <span>{site.tagline}</span>
          <span>Est. {site.established}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 180, lineHeight: 0.9, letterSpacing: -6, display: "flex" }}>
            {site.name}
            <span style={{ color: "#c9a66b" }}>.</span>
          </div>
          <div style={{ fontSize: 44, marginTop: 24, color: "#d6e3a0", fontStyle: "italic" }}>Bring the forest home.</div>
        </div>
        <div style={{ fontSize: 24, color: "#a8b89a", display: "flex" }}>
          Nursery-grown plants · Delivered across India · 30-day guarantee
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Instrument Serif", data: regular, style: "normal", weight: 400 },
        { name: "Instrument Serif", data: italic, style: "italic", weight: 400 },
      ],
    },
  );
}
