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

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Hanya admin yang dapat menyematkan thread" } },
        { status: 403 }
      );
    }

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } });
    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Thread tidak ditemukan" } },
        { status: 404 }
      );
    }

    const updated = await prisma.forumThread.update({
      where: { id: params.id },
      data: { isPinned: !thread.isPinned },
    });

    return NextResponse.json({
      success: true,
      data: { isPinned: updated.isPinned },
    });
  } catch (error) {
    console.error("Error toggling pin:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to toggle pin" } },
      { status: 500 }
    );
  }
}
