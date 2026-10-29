"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/SupabaseNotice";
import { formatRupiah } from "@/lib/utils";
import { TrendUp as TrendingUp } from "@/components/icons";
import { useLanguage } from "@/lib/LanguageContext";

export interface LoanGrowthPoint {
  merchant: string;
  before: number;
  after: number;
}

export function FinancingGrowthChart({ data }: { data: LoanGrowthPoint[] }) {
  const { t, language } = useLanguage();
  return (
    <Card>
      <CardHeader
        title={t("fl_chart_title")}
        description={t("fl_chart_desc")}
        icon={TrendingUp}
      />
      <CardBody>
        {data.length === 0 ? (
          <EmptyState text={t("no_data")} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data} margin={{ top: 12, right: 16, left: 16, bottom: 0 }}>
              <CartesianGrid stroke="var(--divider)" vertical={false} />
              <XAxis dataKey="merchant" tick={{ fontSize: 11, fill: "var(--text-3)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-3)" }}
                axisLine={false}
                tickLine={false}
                width={80}
                tickFormatter={(v) => formatRupiah(v)}
              />
              <Tooltip
                formatter={(value: number) => [formatRupiah(value), ""]}
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow-pop)",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
              <Bar
                dataKey="before"
                name={language === "id" ? "Omzet Sebelum" : "Revenue Before"}
                fill="var(--chart-muted)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="after"
                name={language === "id" ? "Omzet Sesudah" : "Revenue After"}
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
