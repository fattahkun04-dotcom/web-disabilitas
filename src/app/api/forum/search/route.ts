import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const q = searchParams.get("q");

    if (!q || q.length < 3) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "Minimal 3 karakter untuk pencarian" } },
        { status: 400 }
      );
    }

    const threads = await prisma.forumThread.findMany({
      where: {
        OR: [
          { title: { contains: q } },
          { content: { contains: q } },
        ],
      },
      take: 20,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    });

    const stripHtml = (html: string): string => {
      return html.replace(/<[^>]*>/g, "");
    };

    const results = threads.map((t) => {
      const plainContent = stripHtml(t.content);
      const snippet =
        plainContent.length > 200
          ? plainContent.slice(0, 200) + "..."
          : plainContent;

      return {
        id: t.id,
        title: t.title,
        category: (t as any).category?.name || "",
        author: (t as any).author?.name || null,
        createdAt: t.createdAt.toISOString(),
        contentSnippet: snippet,
      };
    });

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching threads:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to search threads" } },
      { status: 500 }
    );
  }
}
