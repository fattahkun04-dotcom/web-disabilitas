"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatRupiah, TRANSACTION_CATEGORY_LABELS } from "@/lib/utils";

const CATEGORY_COLORS: Record<string, string> = {
  MEMBERSHIP_FEE: "#3b82f6",
  DONATION: "#10b981",
  EVENT_INCOME: "#f59e0b",
  EVENT_EXPENSE: "#ef4444",
  OPERATIONAL: "#8b5cf6",
  SOCIAL_PROGRAM: "#ec4899",
  OTHER: "#6b7280",
};

interface BudgetPieChartProps {
  data: { category: string; amount: number; type: "INCOME" | "EXPENSE" }[];
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number; payload: { category: string; type: string } }[];
}

function CustomTooltip({ active, payload }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    const { category, type } = payload[0].payload;
    const label = TRANSACTION_CATEGORY_LABELS[category] || category;
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 capitalize">{type === "INCOME" ? "Pemasukan" : "Pengeluaran"}</p>
        <p className="text-sm font-semibold text-gray-900">{formatRupiah(payload[0].value)}</p>
      </div>
    );
  }
  return null;
}

function renderCustomizedLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  if (!percent || percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export function BudgetPieChart({ data }: BudgetPieChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Distribusi Keuangan per Kategori</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Belum ada data keuangan
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map((item) => ({
    name: TRANSACTION_CATEGORY_LABELS[item.category] || item.category,
    category: item.category,
    type: item.type,
    value: typeof item.amount === "string" ? parseFloat(item.amount) : item.amount,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Distribusi Keuangan per Kategori</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={110}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[entry.category] || "#6b7280"}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value: string, entry: any) =>
                  TRANSACTION_CATEGORY_LABELS[entry.payload.category] || value
                }
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
