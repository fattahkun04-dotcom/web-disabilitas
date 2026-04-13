"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const MONTH_LABELS_ID: Record<number, string> = {
  0: "Jan",
  1: "Feb",
  2: "Mar",
  3: "Apr",
  4: "Mei",
  5: "Jun",
  6: "Jul",
  7: "Agu",
  8: "Sep",
  9: "Okt",
  10: "Nov",
  11: "Des",
};

interface MemberGrowthChartProps {
  data: { month: string; count: number }[];
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-sm text-blue-600">{payload[0].value} anggota baru</p>
      </div>
    );
  }
  return null;
}

export function MemberGrowthChart({ data }: MemberGrowthChartProps) {
  const chartData = data.map((item) => {
    const date = new Date(item.month);
    const monthLabel = MONTH_LABELS_ID[date.getMonth()] || item.month;
    return {
      ...item,
      displayMonth: `${monthLabel} ${date.getFullYear()}`,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Pertumbuhan Anggota (6 Bulan Terakhir)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            Belum ada data pertumbuhan anggota
          </div>
        ) : (
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="displayMonth"
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Anggota Baru"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
