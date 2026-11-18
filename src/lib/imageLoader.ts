// Unsplash resizes on its own CDN, so the browser requests the right size directly
// instead of routing through the Next.js image optimiser.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const sep = src.includes("?") ? "&" : "?";
  return `${src}${sep}w=${width}&q=${quality ?? 75}`;
}
