import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
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

    const comment = await prisma.forumComment.findUnique({ where: { id: params.id } });
    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Komentar tidak ditemukan" } },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const isAuthor = comment.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || content.trim().length < 1) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Komentar tidak boleh kosong" } },
        { status: 400 }
      );
    }

    const updated = await prisma.forumComment.update({
      where: { id: params.id },
      data: { content },
    });

    return NextResponse.json({
      success: true,
      data: { ...updated, createdAt: updated.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("Error updating comment:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update comment" } },
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
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Anda harus login" } },
        { status: 401 }
      );
    }

    const comment = await prisma.forumComment.findUnique({ where: { id: params.id } });
    if (!comment) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Komentar tidak ditemukan" } },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const isAuthor = comment.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses" } },
        { status: 403 }
      );
    }

    // Check if comment has replies - if so, soft delete instead
    const replyCount = await prisma.forumComment.count({
      where: { parentId: params.id },
    });

    if (replyCount > 0) {
      await prisma.forumComment.update({
        where: { id: params.id },
        data: { isDeleted: true },
      });
    } else {
      await prisma.forumComment.delete({ where: { id: params.id } });
    }

    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete comment" } },
      { status: 500 }
    );
  }
}
