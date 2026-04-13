import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const thread = await prisma.forumThread.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                author: { select: { id: true, name: true, avatarUrl: true } },
              },
            },
          },
        },
        _count: { select: { comments: true, reactions: true } },
        reactions: { where: { userId: session.user.id }, select: { id: true } },
      },
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Thread tidak ditemukan" } },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.forumThread.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    });

    const buildCommentTree = (comments: typeof thread.comments) => {
      return comments.map((c) => ({
        id: c.id,
        content: c.content,
        author: c.author,
        createdAt: c.createdAt.toISOString(),
        parentId: c.parentId,
        isDeleted: c.isDeleted,
        replies: (c as typeof c & { replies: typeof c.replies }).replies
          ? (c as typeof c & { replies: typeof c.replies }).replies.map((r) => ({
              id: r.id,
              content: r.content,
              author: r.author,
              createdAt: r.createdAt.toISOString(),
              parentId: r.parentId,
              isDeleted: r.isDeleted,
              replies: [],
            }))
          : [],
      }));
    };

    const formattedComments = buildCommentTree(thread.comments);

    return NextResponse.json({
      success: true,
      data: {
        id: thread.id,
        title: thread.title,
        content: thread.content,
        author: thread.author,
        category: thread.category,
        viewCount: thread.viewCount + 1,
        isPinned: thread.isPinned,
        isClosed: thread.isClosed,
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
        comments: formattedComments,
        reactionCount: thread._count.reactions,
        userReaction: thread.reactions.length > 0,
        commentCount: thread._count.comments,
      },
    });
  } catch (error) {
    console.error("Error fetching thread:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch thread" } },
      { status: 500 }
    );
  }
}

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

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } });
    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Thread tidak ditemukan" } },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const isAuthor = thread.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    const updated = await prisma.forumThread.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
      },
    });

    return NextResponse.json({
      success: true,
      data: { ...updated, createdAt: updated.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("Error updating thread:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to update thread" } },
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

    const thread = await prisma.forumThread.findUnique({ where: { id: params.id } });
    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Thread tidak ditemukan" } },
        { status: 404 }
      );
    }

    const isAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    const isAuthor = thread.authorId === session.user.id;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Anda tidak memiliki akses" } },
        { status: 403 }
      );
    }

    await prisma.forumThread.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true, data: { id: params.id } });
  } catch (error) {
    console.error("Error deleting thread:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to delete thread" } },
      { status: 500 }
    );
  }
}
