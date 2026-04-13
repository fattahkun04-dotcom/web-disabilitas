import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MONTH_LABELS_ID: Record<number, string> = {
  0: "Januari",
  1: "Februari",
  2: "Maret",
  3: "April",
  4: "Mei",
  5: "Juni",
  6: "Juli",
  7: "Agustus",
  8: "September",
  9: "Oktober",
  10: "November",
  11: "Desember",
};

export async function GET(
  _request: Request,
  { params }: { params: { year: string; month: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const year = parseInt(params.year);
    const month = parseInt(params.month);

    if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json(
        { error: "Invalid year or month" },
        { status: 400 }
      );
    }

    // Define date ranges
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 1);
    const periodLabel = `${MONTH_LABELS_ID[month - 1]} ${year}`;

    // Opening balance = sum of all verified transactions BEFORE this month
    const openingBalanceResult = await prisma.budgetTransaction.aggregate({
      _sum: { amount: true },
      where: {
        isVerified: true,
        date: { lt: monthStart },
      },
    });
    const openingBalance = openingBalanceResult._sum.amount
      ? parseFloat(openingBalanceResult._sum.amount.toString())
      : 0;

    // Transactions for this month
    const [transactions, incomeSum, expenseSum] = await Promise.all([
      prisma.budgetTransaction.findMany({
        where: {
          date: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
        orderBy: { date: "asc" },
      }),
      prisma.budgetTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "INCOME",
          isVerified: true,
          date: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      }),
      prisma.budgetTransaction.aggregate({
        _sum: { amount: true },
        where: {
          type: "EXPENSE",
          isVerified: true,
          date: {
            gte: monthStart,
            lt: monthEnd,
          },
        },
      }),
    ]);

    const totalIncome = incomeSum._sum.amount
      ? parseFloat(incomeSum._sum.amount.toString())
      : 0;
    const totalExpense = expenseSum._sum.amount
      ? parseFloat(expenseSum._sum.amount.toString())
      : 0;

    // By category
    const byCategoryRaw = await prisma.budgetTransaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        isVerified: true,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    });

    // Calculate income and expense per category
    const incomeByCategory = await prisma.budgetTransaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        type: "INCOME",
        isVerified: true,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    });

    const expenseByCategory = await prisma.budgetTransaction.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        type: "EXPENSE",
        isVerified: true,
        date: {
          gte: monthStart,
          lt: monthEnd,
        },
      },
    });

    const incomeMap = new Map<string, number>();
    for (const item of incomeByCategory) {
      incomeMap.set(
        item.category,
        item._sum.amount ? parseFloat(item._sum.amount.toString()) : 0
      );
    }

    const expenseMap = new Map<string, number>();
    for (const item of expenseByCategory) {
      expenseMap.set(
        item.category,
        item._sum.amount ? parseFloat(item._sum.amount.toString()) : 0
      );
    }

    const byCategory = byCategoryRaw.map((item) => ({
      category: item.category,
      totalIncome: incomeMap.get(item.category) || 0,
      totalExpense: expenseMap.get(item.category) || 0,
    }));

    const balance = openingBalance + totalIncome - totalExpense;

    return NextResponse.json({
      success: true,
      data: {
        period: {
          year,
          month,
          label: periodLabel,
        },
        summary: {
          totalIncome,
          totalExpense,
          balance,
          openingBalance,
        },
        transactions: transactions.map((tx) => ({
          id: tx.id,
          date: tx.date.toISOString(),
          type: tx.type,
          category: tx.category,
          description: tx.description,
          amount: parseFloat(tx.amount.toString()),
          isVerified: tx.isVerified,
        })),
        byCategory,
      },
    });
  } catch (error) {
    console.error("Error fetching budget report:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}
