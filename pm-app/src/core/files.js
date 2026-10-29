/* ---------- real attachments (ADR-015) ----------
   Files live in the private Supabase bucket `pm-attachments`; the shared doc only keeps { path, mime }.
   /api/pm-files hands out a signed upload URL (POST) and redirects to a short-lived signed URL (GET). */
const API = '/api/pm-files';
export const MAX_UPLOAD = 25 * 1024 * 1024;

const EXT = f =>
  (
    String(f?.name || '')
      .split('.')
      .pop() || ''
  ).toLowerCase();
const KIND = {
  img: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'avif'],
  pdf: ['pdf'],
  video: ['mp4', 'webm', 'mov', 'm4v', 'ogv'],
  audio: ['mp3', 'wav', 'm4a', 'ogg', 'aac', 'opus'],
};

/** What the browser can show for this attachment: 'img' | 'pdf' | 'video' | 'audio' | null. */
export function previewKind(f) {
  if (!f?.path) return null;
  const e = EXT(f);
  return Object.keys(KIND).find(k => KIND[k].includes(e)) || null;
}

export function fileUrl(f, download = false) {
  if (!f?.path) return '';
  return `${API}?path=${encodeURIComponent(f.path)}&name=${encodeURIComponent(f.name || 'file')}${download ? '&dl=1' : ''}`;
}

/** Upload one file; resolves to the stored path. onProgress gets 0..100 from real upload events. */
export async function uploadFile(file, onProgress) {
  const res = await fetch(API, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: file.name, size: file.size }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok || !j.url) throw new Error(j.error || 'Could not start upload');
  await new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('PUT', j.url);
    x.setRequestHeader('content-type', file.type || 'application/octet-stream');
    x.setRequestHeader('x-upsert', 'false');
    x.upload.onprogress = e => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    x.onload = () => (x.status >= 200 && x.status < 300 ? resolve() : reject(new Error('Upload failed (' + x.status + ')')));
    x.onerror = () => reject(new Error('Upload failed. Check your connection.'));
    x.send(file);
  });
  return j.path;
}
