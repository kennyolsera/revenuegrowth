"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/SupabaseNotice";
import { TrendUp as TrendingUp } from "@phosphor-icons/react";
import { useLanguage } from "@/lib/LanguageContext";

export interface GrowthPoint {
  period: string;
  qris: number;
  onlineOrder: number;
  financing: number;
}

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  const { t } = useLanguage();
  const hasData = data.some((d) => d.qris || d.onlineOrder || d.financing);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title={t("dash_growth_title")}
        description={t("dash_growth_desc")}
        icon={TrendingUp}
      />
      <CardBody className="flex-1 flex flex-col justify-center">
        {!hasData ? (
          <EmptyState text={t("no_data")} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ top: 12, right: 12, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorQris" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--divider)" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "var(--text-3)" }}
                axisLine={{ stroke: "var(--border)" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-3)" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--surface)",
                  color: "var(--text)",
                  boxShadow: "var(--shadow-pop)",
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 600, color: "var(--text)", marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Area
                type="monotone"
                dataKey="qris"
                name="QRIS"
                stroke="var(--chart-1)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorQris)"
              />
              <Area
                type="monotone"
                dataKey="onlineOrder"
                name="Online Order"
                stroke="var(--chart-2)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOO)"
              />
              <Area
                type="monotone"
                dataKey="financing"
                name="Financing Loan"
                stroke="var(--chart-3)"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorFin)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
