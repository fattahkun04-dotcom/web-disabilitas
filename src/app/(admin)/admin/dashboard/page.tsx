"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  Wallet,
  ArrowRight,
  FileText,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateShort, formatRupiah, MEMBER_STATUS_LABELS } from "@/lib/utils";

interface Member {
  id: string;
  status: string;
  joinedAt: string;
  city: string | null;
  user: {
    name: string;
    email: string;
  };
}

interface BudgetTransaction {
  id: string;
  date: string;
  type: "INCOME" | "EXPENSE";
  category: string;
  description: string;
  amount: number;
}

interface DashboardStats {
  totalMembers: number;
  pendingMembers: number;
  totalEvents: number;
  balance: number;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    pendingMembers: 0,
    totalEvents: 0,
    balance: 0,
  });
  const [pendingMembers, setPendingMembers] = useState<Member[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<BudgetTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [membersRes, eventsRes, budgetRes] = await Promise.allSettled([
          fetch("/api/admin/members?status=ALL&limit=100"),
          fetch("/api/events?status=all&limit=100"),
          fetch("/api/budget/summary"),
        ]);

        if (membersRes.status === "fulfilled" && membersRes.value.ok) {
          const data = await membersRes.value.json();
          const allMembers = data.members || [];
          const pending = allMembers.filter(
            (m: Member) => m.status === "PENDING"
          );
          setStats((prev) => ({
            ...prev,
            totalMembers: allMembers.length,
            pendingMembers: pending.length,
          }));
          setPendingMembers(pending.slice(0, 5));
        }

        if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
          const data = await eventsRes.value.json();
          setStats((prev) => ({
            ...prev,
            totalEvents: (data.events || []).length,
          }));
        }

        if (budgetRes.status === "fulfilled" && budgetRes.value.ok) {
          const data = await budgetRes.value.json();
          setStats((prev) => ({
            ...prev,
            balance: data.balance || 0,
          }));
        }

        const transactionsRes = await fetch("/api/budget?limit=5&page=1");
        if (transactionsRes.ok) {
          const data = await transactionsRes.json();
          setRecentTransactions(data.transactions || []);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "Admin";

  const statCards = [
    {
      label: "Total Anggota",
      value: stats.totalMembers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/anggota",
    },
    {
      label: "Anggota Pending",
      value: stats.pendingMembers,
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/anggota",
    },
    {
      label: "Total Event",
      value: stats.totalEvents,
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/event",
    },
    {
      label: "Saldo Kas",
      value: formatRupiah(stats.balance),
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
      href: "/admin/keuangan",
    },
  ];

  const quickLinks = [
    {
      href: "/admin/anggota",
      title: "Manajemen Anggota",
      description: "Verifikasi dan kelola data anggota paguyuban",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      href: "/admin/event",
      title: "Manajemen Event",
      description: "Buat dan kelola kegiatan paguyuban",
      icon: Calendar,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      href: "/admin/keuangan",
      title: "Manajemen Keuangan",
      description: "Catat dan pantau pemasukan serta pengeluaran",
      icon: Wallet,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      href: "/admin/statistik",
      title: "Statistik",
      description: "Lihat statistik dan laporan paguyuban",
      icon: FileText,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="text-gray-500 mt-1">
          Halo, {firstName}. Berikut ringkasan aktivitas paguyuban.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                <CardContent className="p-5">
                  <div className={`p-3 rounded-lg ${link.bg} w-fit mb-3`}>
                    <link.icon className={`h-6 w-6 ${link.color}`} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{link.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{link.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Pending Registrations */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                Pendaftaran Pending
              </CardTitle>
              <Link href="/admin/anggota">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingMembers.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Tidak ada pendaftaran pending
              </p>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {member.user.name}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {member.user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <Badge variant="warning">
                        {MEMBER_STATUS_LABELS[member.status] || member.status}
                      </Badge>
                      <Link href="/admin/anggota">
                        <Button variant="outline" size="sm">
                          Verifikasi
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Wallet className="h-5 w-5 text-purple-500" />
                Transaksi Terbaru
              </CardTitle>
              <Link href="/admin/keuangan">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Belum ada transaksi
              </p>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 truncate">
                        {tx.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateShort(tx.date)}
                      </p>
                    </div>
                    <div className="ml-3 text-right flex-shrink-0">
                      <p
                        className={`font-semibold ${
                          tx.type === "INCOME"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {tx.type === "INCOME" ? "+" : "-"}
                        {formatRupiah(tx.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
