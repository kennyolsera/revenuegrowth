"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/SupabaseNotice";
import { ChartPie as PieIcon } from "@/components/icons";
import { useLanguage } from "@/lib/LanguageContext";

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-4)", "var(--chart-3)", "var(--rose)", "var(--text-3)"];

export function PipelineChart({ data }: { data: { name: string; value: number }[] }) {
  const { t } = useLanguage();
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader
        title={t("dash_pipeline_title")}
        description={t("dash_pipeline_desc")}
        icon={PieIcon}
      />
      <CardBody className="flex-1 flex flex-col justify-center">
        {total === 0 ? (
          <EmptyState text={t("no_data")} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={3}
                cornerRadius={4}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
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
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  );
}
