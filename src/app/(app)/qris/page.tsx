"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { ResourceManager } from "@/components/shared/ResourceManager";
import { InlineStatusSelect } from "@/components/shared/InlineStatusSelect";
import { QrisImportDialog } from "@/components/qris/QrisImportDialog";
import { Button } from "@/components/ui/Button";
import { useTableOptions } from "@/lib/hooks/useTableOptions";
import { formatDate } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { useLanguage } from "@/lib/LanguageContext";

export default function QrisPage() {
  const { t, language } = useLanguage();
  const providerOptions = useTableOptions("qris_providers");
  const [reload, setReload] = useState(0);
  const [importOpen, setImportOpen] = useState(false);

  const STATUS_OPTIONS = [
    { value: "diajukan", label: language === "id" ? "Diajukan" : "Submitted" },
    { value: "verifikasi", label: language === "id" ? "Verifikasi Dokumen" : "Doc Verification" },
    { value: "aktivasi", label: language === "id" ? "Aktivasi" : "Activation" },
    { value: "aktif", label: language === "id" ? "Aktif Bertransaksi" : "Active Transacting" },
    { value: "tidak_lanjut", label: language === "id" ? "Tidak Lanjut" : "Dropped" },
  ];

  const columns: ColumnDef<any>[] = [
    { key: "qris_name", label: t("qris_col_qris_name"), render: (r) => r.qris_name ?? "-" },
    { key: "provider", label: t("qris_col_provider"), render: (r) => r.provider?.name ?? "-" },
    { key: "mid", label: t("qris_col_mid"), render: (r) => r.mid ?? "-" },
    { key: "phone", label: t("qris_col_phone"), render: (r) => r.phone ?? "-" },
    {
      key: "status",
      label: t("qris_col_status"),
      render: (r) => (
        <InlineStatusSelect
          table="qris_acquisitions"
          row={r}
          options={STATUS_OPTIONS}
          onChanged={() => setReload((n) => n + 1)}
        />
      ),
    },
    { key: "submitted_at", label: t("qris_col_date"), render: (r) => formatDate(r.submitted_at) },
  ];

  return (
    <>
      <ResourceManager
        table="qris_acquisitions"
        title={t("qris_title")}
        description={t("qris_desc")}
        addLabel={t("qris_add")}
        selectQuery="*, provider:qris_providers(name)"
        searchKeys={["qris_name", "mid", "phone", "email", "bank_name", "bank_account_holder", "notes"]}
        filters={[
          { key: "status", label: t("qris_col_status"), options: STATUS_OPTIONS },
          { key: "provider_id", label: t("qris_col_provider"), options: providerOptions },
        ]}
        defaultValues={{ status: "diajukan", submitted_at: new Date().toISOString().slice(0, 10) }}
        reloadSignal={reload}
        columns={columns}
        extraHeaderAction={
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <FileUp className="h-4 w-4" /> {t("qris_import_btn")}
          </Button>
        }
        formFields={[
          { key: "qris_name", label: t("qris_col_qris_name"), required: true, colSpan: 2 },
          { key: "phone", label: t("qris_col_phone") },
          { key: "mid", label: t("qris_col_mid") },
          { key: "email", label: t("qris_col_email"), type: "text" },
          { key: "provider_id", label: t("qris_col_provider"), type: "select", options: providerOptions },
          { key: "bank_name", label: t("qris_col_bank_name") },
          { key: "bank_account_number", label: t("qris_col_bank_acc_no") },
          { key: "bank_account_holder", label: t("qris_col_bank_holder") },
          { key: "submitted_at", label: t("qris_col_date"), type: "date" },
          { key: "status", label: t("qris_col_status"), type: "select", required: true, options: STATUS_OPTIONS },
          { key: "address", label: t("qris_col_address"), type: "textarea", colSpan: 2 },
          { key: "notes", label: language === "id" ? "Catatan" : "Notes", type: "textarea", colSpan: 2 },
        ]}
      />

      <QrisImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setReload((n) => n + 1)}
      />
    </>
  );
}
