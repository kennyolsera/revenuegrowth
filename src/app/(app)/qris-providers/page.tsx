"use client";

import { useEffect, useState } from "react";
import { Power, Lock } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { PageHeader } from "@/components/shared/PageHeader";
import { EmptyState } from "@/components/shared/SupabaseNotice";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ResourceManager } from "@/components/shared/ResourceManager";
import type { ColumnDef } from "@/components/shared/DataTable";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/LanguageContext";
import { useToast } from "@/lib/ToastContext";

export default function QrisProvidersPage() {
  const { t, language } = useLanguage();
  const toast = useToast();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      if (!isSupabaseConfigured) {
        setAllowed(true);
        return;
      }
      const supabase = createClient();
      const { data: userRes } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userRes.user?.id ?? "")
        .single();
      setAllowed(profile?.role === "super_admin");
    }
    check();
  }, []);

  async function toggleActive(row: any, refresh: () => void) {
    const supabase = createClient();
    const { error } = await supabase
      .from("qris_providers")
      .update({ is_active: !row.is_active })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(t("toast_status_updated"));
    refresh();
  }

  const columns: ColumnDef<any>[] = [
    { key: "name", label: t("qpv_col_name") },
    {
      key: "is_active",
      label: t("qpv_col_status"),
      render: (r) => (
        <Badge tone={r.is_active ? "success" : "neutral"} showDot>
          {r.is_active ? t("users_active") : t("users_inactive")}
        </Badge>
      ),
    },
    { key: "created_at", label: t("qpv_col_created"), render: (r) => formatDate(r.created_at) },
  ];

  if (allowed === null) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("qpv_title")} description={t("qpv_desc")} />
        <Card>
          <CardBody className="py-16">
            <EmptyState text={t("loading")} />
          </CardBody>
        </Card>
      </div>
    );
  }

  if (allowed === false) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("qpv_title")} description={t("qpv_desc")} />
        <Card>
          <CardBody className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
              <Lock className="h-6 w-6" />
            </div>
            <p className="max-w-sm text-sm font-medium text-ink-body">{t("qpv_restricted")}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <ResourceManager
      table="qris_providers"
      title={t("qpv_title")}
      description={t("qpv_desc")}
      addLabel={t("qpv_add")}
      searchKeys={["name"]}
      orderBy="name"
      ascending
      defaultValues={{ is_active: true }}
      columns={columns}
      formFields={[
        {
          key: "name",
          label: t("qpv_col_name"),
          required: true,
          placeholder: language === "id" ? "mis. Netzme, BCA" : "e.g. Netzme, BCA",
        },
      ]}
      extraRowActions={(row, refresh) => (
        <button
          type="button"
          onClick={() => toggleActive(row, refresh)}
          title={
            row.is_active
              ? language === "id" ? "Nonaktifkan" : "Deactivate"
              : language === "id" ? "Aktifkan" : "Activate"
          }
          aria-label={row.is_active ? "Deactivate provider" : "Activate provider"}
          className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-surface-muted hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
        >
          <Power className="h-3.5 w-3.5" />
        </button>
      )}
    />
  );
}
