export function formatBytes(bytes: number | null): string {
  if (bytes == null) return "-";
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export async function getPublicFileSize(publicPath: string): Promise<number | null> {
  try {
    // Try HEAD first
    const head = await fetch(publicPath, { method: "HEAD" });
    if (head.ok) {
      const len = head.headers.get("content-length");
      if (len) return parseInt(len, 10);
    }

    // Fallback: GET and compute bytes
    const res = await fetch(publicPath);
    if (!res.ok) return null;
    const text = await res.text();
    // Use Blob to get accurate byte length
    return new Blob([text]).size;
  } catch (e) {
    return null;
  }
}
