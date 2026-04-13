import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { budgetSchema } from "@/types";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const transaction = await prisma.budgetTransaction.update({
      where: { id: params.id },
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        attachmentUrl: body.attachmentUrl || null,
      },
    });

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error updating budget transaction:", error);
    if (error instanceof Error && "format" in (error as any)) {
      return NextResponse.json(
        { error: "Invalid data", details: (error as any).format?.() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update budget transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    await prisma.budgetTransaction.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting budget transaction:", error);
    return NextResponse.json(
      { error: "Failed to delete budget transaction" },
      { status: 500 }
    );
  }
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
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

    const transaction = await prisma.budgetTransaction.findUnique({
      where: { id: params.id },
    });

    if (!transaction) {
      return NextResponse.json(
        { error: "Transaction not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ transaction });
  } catch (error) {
    console.error("Error fetching budget transaction:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget transaction" },
      { status: 500 }
    );
  }
}
