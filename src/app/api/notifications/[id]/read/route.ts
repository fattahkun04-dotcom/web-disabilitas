import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
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

    const notification = await prisma.notification.findUnique({ where: { id: params.id } });
    if (!notification) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Notifikasi tidak ditemukan" } },
        { status: 404 }
      );
    }

    if (notification.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses" } },
        { status: 403 }
      );
    }

    await prisma.notification.update({
      where: { id: params.id },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true, data: { id: params.id, isRead: true } });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to mark notification as read" } },
      { status: 500 }
    );
  }
}
