"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/SupabaseNotice";
import { PieChart as PieIcon } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#64748B", "#EC4899"];

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
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  backgroundColor: "rgba(255, 255, 255, 0.96)",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
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
