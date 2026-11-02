import { createClient } from "@/lib/supabase/client";

const CHUNK = 150; // keeps the id=in.(...) URL well under proxy limits

/**
 * Delete rows by id, in chunks. Returns how many rows the database actually removed, so a
 * row-level-security refusal (0 removed, no error) is never reported as success.
 */
export async function bulkDelete(table: string, ids: string[]): Promise<{ deleted: number; error: string | null }> {
  const supabase = createClient();
  let deleted = 0;
  for (let i = 0; i < ids.length; i += CHUNK) {
    const part = ids.slice(i, i + CHUNK);
    const { error, count } = await supabase.from(table).delete({ count: "exact" }).in("id", part);
    if (error) return { deleted, error: error.message };
    deleted += count ?? 0;
  }
  return { deleted, error: null };
}
