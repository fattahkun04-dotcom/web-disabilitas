import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const boardMembers = await prisma.boardMember.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json({ success: true, data: boardMembers });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 401 }
      );
    }

    const body = await req.formData();
    const name = body.get("name") as string;
    const position = body.get("position") as string;
    const period = body.get("period") as string;
    const order = parseInt(body.get("order") as string) || 0;
    const photo = body.get("photo") as File | null;

    let photoUrl: string | undefined;
    if (photo) {
      const uploadRes = await fetch(`${process.env.NEXTAUTH_URL}/api/upload`, {
        method: "POST",
        body: (() => {
          const fd = new FormData();
          fd.append("file", photo);
          fd.append("folder", "avatars");
          return fd;
        })(),
      });
      const uploadData = await uploadRes.json();
      if (uploadData.success) photoUrl = uploadData.data.url;
    }

    const boardMember = await prisma.boardMember.create({
      data: { name, position, period, photoUrl, order },
    });

    return NextResponse.json({ success: true, data: boardMember }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}
