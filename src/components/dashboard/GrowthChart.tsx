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
import { TrendingUp } from "lucide-react";
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
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorOO" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorFin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={{ stroke: "#E2E8F0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                axisLine={false}
                tickLine={false}
                width={36}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                  fontSize: 12,
                }}
                labelStyle={{ fontWeight: 600, color: "#0F172A", marginBottom: 4 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
              <Area
                type="monotone"
                dataKey="qris"
                name="QRIS"
                stroke="#4F46E5"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorQris)"
              />
              <Area
                type="monotone"
                dataKey="onlineOrder"
                name="Online Order"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorOO)"
              />
              <Area
                type="monotone"
                dataKey="financing"
                name="Financing Loan"
                stroke="#F59E0B"
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
