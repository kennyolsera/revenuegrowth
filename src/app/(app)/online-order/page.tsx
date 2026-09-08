"use client";

import { useState } from "react";
import { FileUp } from "lucide-react";
import { ResourceManager } from "@/components/shared/ResourceManager";
import { OnlineOrderImportDialog } from "@/components/online-order/OnlineOrderImportDialog";
import { Button } from "@/components/ui/Button";
import { formatDate, formatRupiah } from "@/lib/utils";
import type { ColumnDef } from "@/components/shared/DataTable";
import { OO_FIELDS } from "@/lib/onlineOrderFields";
import { useLanguage } from "@/lib/LanguageContext";
import type { FormFieldDef } from "@/components/shared/ResourceManager";

const KIND_TO_TYPE: Record<string, FormFieldDef["type"]> = {
  text: "text",
  date: "date",
  count: "number",
  amount: "currency",
};

export default function OnlineOrderPage() {
  const { t, language } = useLanguage();
  const [reload, setReload] = useState(0);
  const [importOpen, setImportOpen] = useState(false);

  const columns: ColumnDef<any>[] = [
    {
      key: "store",
      label: "Store",
      render: (r) => (
        <span className="block max-w-[220px] truncate font-medium" title={r.store ?? ""}>
          {r.store ?? "-"}
        </span>
      ),
    },
    { key: "last_trans_date", label: "Last Trans", render: (r) => formatDate(r.last_trans_date) },
    { key: "total_online_order", label: "Online Order", align: "right", render: (r) => formatRupiah(r.total_online_order) },
    { key: "total_delivery", label: "Delivery", align: "right", render: (r) => formatRupiah(r.total_delivery) },
    { key: "total_takeaway", label: "Takeaway", align: "right", render: (r) => formatRupiah(r.total_takeaway) },
    { key: "total_dinein", label: "Dine-in", align: "right", render: (r) => formatRupiah(r.total_dinein) },
    { key: "total_reservation", label: "Reservation", align: "right", render: (r) => formatRupiah(r.total_reservation) },
    { key: "total_fee", label: "Total Fee", align: "right", render: (r) => formatRupiah(r.total_fee) },
  ];

  const formFields: FormFieldDef[] = OO_FIELDS.map((f) => ({
    key: f.key,
    label: f.label,
    type: KIND_TO_TYPE[f.kind],
    required: f.key === "store",
    colSpan: f.key === "store" || f.key === "url" ? 2 : 1,
  }));

  return (
    <>
      <ResourceManager
        table="online_order_reports"
        title={t("oo_title")}
        description={t("oo_desc")}
        addLabel={t("oo_add")}
        searchKeys={["store", "url"]}
        searchPlaceholder={language === "id" ? "Cari store / URL..." : "Search store / URL..."}
        orderBy="created_at"
        ascending={false}
        reloadSignal={reload}
        columns={columns}
        formFields={formFields}
        enableExport
        exportKeys={OO_FIELDS.map((f) => f.key)}
        exportFileName="online-order"
        extraHeaderAction={
          <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
            <FileUp className="h-4 w-4" /> {t("oo_import_btn")}
          </Button>
        }
      />

      <OnlineOrderImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImported={() => setReload((n) => n + 1)}
      />
    </>
  );
}
