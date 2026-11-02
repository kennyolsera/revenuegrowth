"use client";

import { useState } from "react";
import { Trash as Trash2, X } from "@/components/icons";
import { Button } from "@/components/ui/Button";

type Lang = "id" | "en";

const COPY = {
  selected: { id: "{n} dipilih", en: "{n} selected" },
  selectAll: { id: "Pilih semua {n} yang cocok", en: "Select all {n} matching" },
  clear: { id: "Batalkan pilihan", en: "Clear selection" },
  delete: { id: "Hapus {n}", en: "Delete {n}" },
  confirm: { id: "Hapus {n} catatan secara permanen? Ini tidak bisa dibatalkan.", en: "Permanently delete {n} records? This can't be undone." },
  yes: { id: "Ya, hapus {n}", en: "Yes, delete {n}" },
  cancel: { id: "Batal", en: "Cancel" },
};

/** Selection toolbar for super-admin bulk delete (ADR-016). Asks before deleting. */
export function BulkDeleteBar({
  count,
  matching,
  language,
  onSelectAllMatching,
  onClear,
  onDelete,
}: {
  count: number;
  matching: number;
  language: Lang;
  onSelectAllMatching: () => void;
  onClear: () => void;
  onDelete: () => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const c = (k: keyof typeof COPY, n: number) => COPY[k][language].replace("{n}", n.toLocaleString(language === "id" ? "id-ID" : "en-US"));
  if (count === 0) return null;

  return (
    <div
      role="region"
      aria-label={c("selected", count)}
      className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg border border-accent/30 bg-accent/[0.06] px-3 py-2 text-[13px]"
    >
      <span className="font-medium text-text" aria-live="polite">
        {c("selected", count)}
      </span>
      {count < matching && !confirming && (
        <button type="button" onClick={onSelectAllMatching} className="text-[13px] font-medium text-accent hover:underline">
          {c("selectAll", matching)}
        </button>
      )}
      <span className="flex-1" />
      {confirming ? (
        <span className="flex flex-wrap items-center gap-2">
          <span className="text-text-2">{c("confirm", count)}</span>
          <Button
            size="sm"
            variant="danger"
            loading={busy}
            onClick={async () => {
              setBusy(true);
              await onDelete();
              setBusy(false);
              setConfirming(false);
            }}
          >
            {c("yes", count)}
          </Button>
          <Button size="sm" variant="secondary" disabled={busy} onClick={() => setConfirming(false)}>
            {COPY.cancel[language]}
          </Button>
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={onClear}>
            <X className="h-3.5 w-3.5" /> {COPY.clear[language]}
          </Button>
          <Button size="sm" variant="danger" onClick={() => setConfirming(true)}>
            <Trash2 className="h-3.5 w-3.5" /> {c("delete", count)}
          </Button>
        </span>
      )}
    </div>
  );
}
