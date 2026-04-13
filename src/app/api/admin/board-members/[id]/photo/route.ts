import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { photoUrl } = body;

    if (!photoUrl) {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: "URL foto diperlukan." } },
        { status: 400 }
      );
    }

    const boardMember = await prisma.boardMember.update({
      where: { id: params.id },
      data: { photoUrl },
    });

    return NextResponse.json({ success: true, data: boardMember });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}
