"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Calendar,
  CheckCircle,
  MessageSquare,
  Wallet,
  ArrowRight,
  DollarSign,
  Users,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDateShort, formatRupiah, EVENT_STATUS_LABELS } from "@/lib/utils";
import { timeAgo } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverImageUrl: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  status: string;
  category: string | null;
}

interface ForumThread {
  id: string;
  title: string;
  author: { name: string };
  category: { name: string };
  createdAt: string;
  _count: { comments: number; reactions: number };
}

interface BudgetSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [forumAvailable, setForumAvailable] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, threadsRes, budgetRes] = await Promise.allSettled([
          fetch("/api/events?status=upcoming&limit=3"),
          fetch("/api/forum/threads?limit=3"),
          fetch("/api/budget/summary"),
        ]);

        if (eventsRes.status === "fulfilled" && eventsRes.value.ok) {
          const data = await eventsRes.value.json();
          setUpcomingEvents(data.events || []);
        }

        if (threadsRes.status === "fulfilled" && threadsRes.value.ok) {
          const data = await threadsRes.value.json();
          setForumThreads(data.threads || []);
          setForumAvailable(true);
        } else {
          setForumAvailable(false);
        }

        if (budgetRes.status === "fulfilled" && budgetRes.value.ok) {
          const data = await budgetRes.value.json();
          setBudgetSummary(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const firstName = session?.user?.name?.split(" ")[0] || "Member";

  const stats = [
    {
      label: "Event Mendatang",
      value: upcomingEvents.length,
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Event Selesai",
      value: "0",
      icon: CheckCircle,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      label: "Thread Forum",
      value: forumAvailable ? forumThreads.length : "-",
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "Saldo Kas",
      value: budgetSummary ? formatRupiah(budgetSummary.balance) : "-",
      icon: Wallet,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const quickLinks = [
    {
      href: "/keuangan",
      title: "Keuangan",
      description: "Lihat transparansi keuangan paguyuban",
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      href: "/forum",
      title: "Forum Diskusi",
      description: "Bergabung dalam diskusi sesama orang tua",
      icon: MessageSquare,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      href: "/event",
      title: "Kegiatan",
      description: "Lihat jadwal event dan kegiatan paguyuban",
      icon: Calendar,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      href: "/profil",
      title: "Profil Saya",
      description: "Kelola data diri dan informasi anak",
      icon: Users,
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
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Selamat Datang, {firstName}!
        </h1>
        <p className="text-gray-500 mt-1">
          Berikut ringkasan aktivitas paguyuban SahabatABK
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Event Mendatang</CardTitle>
              <Link href="/event">
                <Button variant="ghost" size="sm">
                  Lihat Semua
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Belum ada event mendatang
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 flex-shrink-0">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/event/${event.slug}`}>
                        <p className="font-medium text-gray-900 hover:text-primary-600 truncate">
                          {event.title}
                        </p>
                      </Link>
                      <p className="text-sm text-gray-500">
                        {formatDateShort(event.startDate)}
                        {event.location && ` • ${event.location}`}
                      </p>
                    </div>
                    <Badge
                      variant="default"
                      className="flex-shrink-0"
                    >
                      {EVENT_STATUS_LABELS[event.status] || event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Forum Activity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Aktivitas Forum Terbaru</CardTitle>
              {forumAvailable && (
                <Link href="/forum">
                  <Button variant="ghost" size="sm">
                    Lihat Semua
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!forumAvailable ? (
              <div className="py-8 text-center">
                <MessageSquare className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Forum akan segera hadir</p>
              </div>
            ) : forumThreads.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                Belum ada thread forum
              </p>
            ) : (
              <div className="space-y-4">
                {forumThreads.map((thread) => (
                  <div
                    key={thread.id}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 flex-shrink-0">
                      <MessageSquare className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/forum/${thread.id}`}>
                        <p className="font-medium text-gray-900 hover:text-primary-600 truncate">
                          {thread.title}
                        </p>
                      </Link>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{thread.author.name}</span>
                        <span>•</span>
                        <span>{timeAgo(thread.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 flex-shrink-0">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {thread._count.comments}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
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
    </div>
  );
}
