import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { threadSchema } from "@/types";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Anda harus login" } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categorySlug");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const sort = searchParams.get("sort") || "latest";

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (categorySlug) {
      const category = await prisma.forumCategory.findUnique({ where: { slug: categorySlug } });
      if (category) {
        where.categoryId = category.id;
      }
    }

    let orderBy: Record<string, unknown>;
    if (sort === "popular") {
      orderBy = { viewCount: "desc" };
    } else if (sort === "unanswered") {
      orderBy = { createdAt: "desc" };
    } else {
      orderBy = { createdAt: "desc" };
    }

    const threads = await prisma.forumThread.findMany({
      where,
      orderBy: [
        { isPinned: "desc" },
        orderBy,
      ],
      skip,
      take: limit,
      include: {
        author: {
          select: { id: true, name: true, avatarUrl: true },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    });

    const total = await prisma.forumThread.count({ where });
    const totalPages = Math.ceil(total / limit);

    const formattedThreads = threads.map((t) => ({
      id: t.id,
      title: t.title,
      author: t.author,
      category: t.category,
      commentCount: t._count.comments,
      reactionCount: t._count.reactions,
      viewCount: t.viewCount,
      isPinned: t.isPinned,
      isClosed: t.isClosed,
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedThreads,
      meta: { page, limit, total, totalPages },
    });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch threads" } },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Anda harus login" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = threadSchema.parse(body);

    const thread = await prisma.forumThread.create({
      data: {
        title: validated.title,
        content: validated.content,
        categoryId: validated.categoryId,
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          ...thread,
          createdAt: thread.createdAt.toISOString(),
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
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create thread" } },
      { status: 500 }
    );
  }
}
