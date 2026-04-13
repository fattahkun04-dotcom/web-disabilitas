import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Anda harus login" } },
        { status: 401 }
      );
    }

    const existing = await prisma.forumReaction.findUnique({
      where: { threadId_userId: { threadId: params.id, userId: session.user.id } },
    });

    if (existing) {
      await prisma.forumReaction.delete({ where: { id: existing.id } });
    } else {
      await prisma.forumReaction.create({
        data: {
          threadId: params.id,
          userId: session.user.id,
          type: "like",
        },
      });
    }

    const count = await prisma.forumReaction.count({
      where: { threadId: params.id },
    });

    return NextResponse.json({
      success: true,
      data: { reacted: !existing, count },
    });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to toggle reaction" } },
      { status: 500 }
    );
  }
}
