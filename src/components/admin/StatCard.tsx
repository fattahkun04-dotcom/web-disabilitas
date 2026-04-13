"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, LucideIcon } from "lucide-react";

const COLOR_SCHEMES = {
  blue: {
    bg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    trendBg: "bg-blue-50",
  },
  green: {
    bg: "bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    trendBg: "bg-green-50",
  },
  red: {
    bg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    trendBg: "bg-red-50",
  },
  yellow: {
    bg: "bg-yellow-50",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    trendBg: "bg-yellow-50",
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  colorScheme: "blue" | "green" | "red" | "yellow";
}

export function StatCard({ title, value, icon: Icon, trend, colorScheme }: StatCardProps) {
  const colors = COLOR_SCHEMES[colorScheme];

  return (
    <Card className={cn("hover:shadow-md transition-shadow", colors.bg)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-1">
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && (
              <div className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", colors.trendBg)}>
                {trend.positive ? (
                  <ArrowUp className="h-3 w-3 text-green-600" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-600" />
                )}
                <span className={trend.positive ? "text-green-700" : "text-red-700"}>
                  {trend.value}%
                </span>
                <span className="text-gray-500 ml-1">{trend.label}</span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-xl", colors.iconBg)}>
            <Icon className={cn("h-6 w-6", colors.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
