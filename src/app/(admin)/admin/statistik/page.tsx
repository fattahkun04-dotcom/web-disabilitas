"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Calendar, Wallet } from "lucide-react";
import { StatCard } from "@/components/admin/StatCard";
import { MemberGrowthChart } from "@/components/admin/MemberGrowthChart";
import { BudgetPieChart } from "@/components/admin/BudgetPieChart";
import { RecentActivityFeed } from "@/components/admin/RecentActivityFeed";
import { Card, CardContent } from "@/components/ui/Card";
import { formatRupiah } from "@/lib/utils";

interface StatsData {
  members: {
    total: number;
    active: number;
    pending: number;
    newThisMonth: number;
    prevMonthCount: number;
    growthByMonth: { month: string; count: number }[];
  };
  events: {
    total: number;
    upcoming: number;
    completed: number;
    totalRsvps: number;
  };
  budget: {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    byCategory: { category: string; amount: number; type: "INCOME" | "EXPENSE" }[];
  };
  forum: {
    totalThreads: number;
    totalComments: number;
    activeThisMonth: number;
  };
}

interface PendingMember {
  id: string;
  user: {
    name: string;
    email: string;
  };
  joinedAt: string;
}

interface RecentTransaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "INCOME" | "EXPENSE";
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="animate-pulse space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, membersRes, transactionsRes] = await Promise.allSettled([
          fetch("/api/admin/statistics"),
          fetch("/api/admin/members?status=PENDING&limit=5"),
          fetch("/api/budget?limit=5&page=1"),
        ]);

        if (statsRes.status === "fulfilled" && statsRes.value.ok) {
          const json = await statsRes.value.json();
          if (json.success) {
            setStats(json.data);
          }
        }

        if (membersRes.status === "fulfilled" && membersRes.value.ok) {
          const json = await membersRes.value.json();
          setPendingMembers(json.members || []);
        }

        if (transactionsRes.status === "fulfilled" && transactionsRes.value.ok) {
          const json = await transactionsRes.value.json();
          setRecentTransactions(json.transactions || []);
        }
      } catch (error) {
        console.error("Error fetching statistics:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-9 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-gray-100 rounded-xl animate-pulse"></div>
          <div className="h-[400px] bg-gray-100 rounded-xl animate-pulse"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">Gagal memuat statistik</p>
        </div>
      </div>
    );
  }

  const memberGrowthTrend =
    stats.members.prevMonthCount > 0
      ? {
          value: Math.round(
            ((stats.members.newThisMonth - stats.members.prevMonthCount) /
              stats.members.prevMonthCount) *
              100
          ),
          label: "dari bulan lalu",
          positive: stats.members.newThisMonth >= stats.members.prevMonthCount,
        }
      : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Statistik & Analitik</h1>
        <p className="text-gray-500 mt-1">Ringkasan data paguyuban Sahabat ABK</p>
      </div>

      {/* Row 1: StatCards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Anggota"
          value={stats.members.total}
          icon={Users}
          trend={memberGrowthTrend}
          colorScheme="blue"
        />
        <StatCard
          title="Pending Verifikasi"
          value={stats.members.pending}
          icon={UserCheck}
          colorScheme="red"
        />
        <StatCard
          title="Event Bulan Ini"
          value={stats.events.upcoming}
          icon={Calendar}
          colorScheme="green"
        />
        <StatCard
          title="Saldo Kas"
          value={formatRupiah(stats.budget.balance)}
          icon={Wallet}
          colorScheme="yellow"
        />
      </div>

      {/* Row 2: Member Growth Chart */}
      <MemberGrowthChart data={stats.members.growthByMonth} />

      {/* Row 3: Budget Pie + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <BudgetPieChart data={stats.budget.byCategory} />
        </div>
        <div>
          <RecentActivityFeed
            pendingMembers={pendingMembers}
            recentTransactions={recentTransactions}
          />
        </div>
      </div>
    </div>
  );
}
