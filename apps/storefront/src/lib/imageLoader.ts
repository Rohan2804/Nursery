// Unsplash resizes on its CDN via w/q params. Uploaded photos (Supabase Storage) are served as-is;
// the width param keeps Next's srcset URLs distinct and is ignored by the storage server.
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const sep = src.includes("?") ? "&" : "?";
  if (src.includes("images.unsplash.com")) return `${src}${sep}w=${width}&q=${quality ?? 75}`;
  return `${src}${sep}width=${width}`;
}
