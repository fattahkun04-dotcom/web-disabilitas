import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.forumCategory.findMany({
      orderBy: { order: "asc" },
    });

    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const threadCount = await prisma.forumThread.count({
          where: { categoryId: cat.id },
        });
        return {
          ...cat,
          threadCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: categoriesWithCount,
    });
  } catch (error) {
    console.error("Error fetching forum categories:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch categories" } },
      { status: 500 }
    );
  }
}
