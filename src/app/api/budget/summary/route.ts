import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");
    const year = searchParams.get("year");

    const where: Record<string, unknown> = {};

    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    } else if (year) {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    const [totalIncome, totalExpense] = await Promise.all([
      prisma.budgetTransaction.aggregate({
        where: { ...where, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.budgetTransaction.aggregate({
        where: { ...where, type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);

    const income = totalIncome._sum.amount?.toNumber() || 0;
    const expense = totalExpense._sum.amount?.toNumber() || 0;

    return NextResponse.json({
      totalIncome: income,
      totalExpense: expense,
      balance: income - expense,
    });
  } catch (error) {
    console.error("Error fetching budget summary:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget summary" },
      { status: 500 }
    );
  }
}
