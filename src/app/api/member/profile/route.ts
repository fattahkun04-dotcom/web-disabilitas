import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateMemberSchema } from "@/types";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const member = await prisma.member.findUnique({
      where: { userId: session.user.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error fetching member profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch member profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateMemberSchema.parse(body);

    const member = await prisma.member.update({
      where: { userId: session.user.id },
      data: validatedData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ member });
  } catch (error) {
    console.error("Error updating member profile:", error);
    if (error instanceof Error && "format" in (error as any)) {
      return NextResponse.json(
        { error: "Invalid data", details: (error as any).format?.() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update member profile" },
      { status: 500 }
    );
  }
}
