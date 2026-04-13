import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/types";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};

    if (type && type !== "ALL") {
      where.type = type;
    }

    if (category) {
      where.category = category;
    }

    if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
      where.date = dateFilter;
    }

    const [transactions, total] = await Promise.all([
      prisma.budgetTransaction.findMany({
        where,
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.budgetTransaction.count({ where }),
    ]);

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching budget transactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget transactions" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validatedData = budgetSchema.parse(body);

    const transaction = await prisma.budgetTransaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        attachmentUrl: body.attachmentUrl || null,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error("Error creating budget transaction:", error);
    if (error instanceof Error && "format" in (error as any)) {
      return NextResponse.json(
        { error: "Invalid data", details: (error as any).format?.() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create budget transaction" },
      { status: 500 }
    );
  }
}
