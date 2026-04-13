import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 401 }
      );
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // ─── MEMBERS STATS ───────────────────────────────────────────
    const [totalMembers, activeMembers, pendingMembers, newThisMonth, allMembers] =
      await Promise.all([
        prisma.member.count(),
        prisma.member.count({ where: { status: "ACTIVE" } }),
        prisma.member.count({ where: { status: "PENDING" } }),
        prisma.member.count({ where: { joinedAt: { gte: startOfMonth } } }),
        prisma.member.findMany({
          where: { joinedAt: { gte: startOfLastMonth } },
          select: { joinedAt: true },
          orderBy: { joinedAt: "asc" },
        }),
      ]);

    // Calculate growth by month for last 6 months
    const growthByMonth: { month: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = await prisma.member.count({
        where: {
          joinedAt: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      });
      growthByMonth.push({
        month: monthStart.toISOString(),
        count,
      });
    }

    // Previous month count for trend calculation
    const prevMonthCount = await prisma.member.count({
      where: {
        joinedAt: {
          gte: startOfLastMonth,
          lt: startOfMonth,
        },
      },
    });

    // ─── EVENTS STATS ────────────────────────────────────────────
    const [totalEvents, upcomingEvents, completedEvents, totalRsvps] =
      await Promise.all([
        prisma.event.count(),
        prisma.event.count({
          where: {
            status: "PUBLISHED",
            startDate: { gte: now },
          },
        }),
        prisma.event.count({ where: { status: "COMPLETED" } }),
        prisma.eventRsvp.count(),
      ]);

    // ─── BUDGET STATS ────────────────────────────────────────────
    const [incomeSum, expenseSum, byCategoryRaw] = await Promise.all([
      prisma.budgetTransaction.aggregate({
        _sum: { amount: true },
        where: { type: "INCOME", isVerified: true },
      }),
      prisma.budgetTransaction.aggregate({
        _sum: { amount: true },
        where: { type: "EXPENSE", isVerified: true },
      }),
      prisma.budgetTransaction.groupBy({
        by: ["category", "type"],
        _sum: { amount: true },
        where: { isVerified: true },
      }),
    ]);

    const totalIncome = incomeSum._sum.amount
      ? parseFloat(incomeSum._sum.amount.toString())
      : 0;
    const totalExpense = expenseSum._sum.amount
      ? parseFloat(expenseSum._sum.amount.toString())
      : 0;
    const balance = totalIncome - totalExpense;

    const byCategory = byCategoryRaw.map((item) => ({
      category: item.category,
      amount: item._sum.amount ? parseFloat(item._sum.amount.toString()) : 0,
      type: item.type,
    }));

    // ─── FORUM STATS ─────────────────────────────────────────────
    const [totalThreads, totalComments, activeThisMonth] = await Promise.all([
      prisma.forumThread.count(),
      prisma.forumComment.count(),
      prisma.forumThread.count({
        where: {
          createdAt: { gte: startOfMonth },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        members: {
          total: totalMembers,
          active: activeMembers,
          pending: pendingMembers,
          newThisMonth,
          prevMonthCount,
          growthByMonth,
        },
        events: {
          total: totalEvents,
          upcoming: upcomingEvents,
          completed: completedEvents,
          totalRsvps,
        },
        budget: {
          totalIncome,
          totalExpense,
          balance,
          byCategory,
        },
        forum: {
          totalThreads,
          totalComments,
          activeThisMonth,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching admin statistics:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}
