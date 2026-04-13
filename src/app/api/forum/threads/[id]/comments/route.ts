import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { commentSchema } from "@/types";

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

    const topComments = await prisma.forumComment.findMany({
      where: { threadId: params.id, parentId: null },
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
    });

    const buildTree = (comments: typeof topComments) => {
      return comments
        .filter((c) => {
          if (c.isDeleted) return c.replies.length > 0;
          return true;
        })
        .map((c) => ({
          id: c.id,
          content: c.content,
          author: c.author,
          createdAt: c.createdAt.toISOString(),
          parentId: c.parentId,
          isDeleted: c.isDeleted,
          replies: c.replies.map((r) => ({
            id: r.id,
            content: r.content,
            author: r.author,
            createdAt: r.createdAt.toISOString(),
            parentId: r.parentId,
            isDeleted: r.isDeleted,
            replies: [],
          })),
        }));
    };

    return NextResponse.json({
      success: true,
      data: buildTree(topComments),
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch comments" } },
      { status: 500 }
    );
  }
}

export async function POST(
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

    const thread = await prisma.forumThread.findUnique({
      where: { id: params.id },
      include: { author: { select: { id: true } } },
    });

    if (!thread) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Thread tidak ditemukan" } },
        { status: 404 }
      );
    }

    if (thread.isClosed) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Thread sudah ditutup" } },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validated = commentSchema.parse(body);

    let parentId = validated.parentId || null;

    if (parentId) {
      const parent = await prisma.forumComment.findUnique({ where: { id: parentId } });
      if (!parent || parent.threadId !== params.id) {
        return NextResponse.json(
          { success: false, error: { code: "INVALID_PARENT", message: "Parent comment tidak valid" } },
          { status: 400 }
        );
      }
      if (parent.parentId) {
        return NextResponse.json(
          { success: false, error: { code: "MAX_DEPTH", message: "Maksimal 2 level balasan" } },
          { status: 400 }
        );
      }
    }

    const comment = await prisma.forumComment.create({
      data: {
        content: validated.content,
        threadId: params.id,
        authorId: session.user.id,
        parentId,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
      },
    });

    // Create notification for thread author if not self
    if (thread.authorId !== session.user.id) {
      const author = await prisma.user.findUnique({ where: { id: thread.authorId } });
      if (author) {
        const commenter = await prisma.user.findUnique({ where: { id: session.user.id } });
        await prisma.notification.create({
          data: {
            userId: thread.authorId,
            type: "NEW_REPLY",
            title: "Balasan Baru",
            message: `${commenter?.name || "Seseorang"} membalas thread "${thread.title}"`,
            linkUrl: `/forum/thread/${params.id}`,
          },
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...comment,
          createdAt: comment.createdAt.toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && "issues" in error) {
      const zodError = error as { issues: { message: string }[] };
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: zodError.issues[0]?.message } },
        { status: 400 }
      );
    }
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create comment" } },
      { status: 500 }
    );
  }
}
