import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
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
    const order = body.get("order") ? parseInt(body.get("order") as string) : undefined;
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

    const updateData: any = { name, position, period };
    if (order !== undefined) updateData.order = order;
    if (photoUrl) updateData.photoUrl = photoUrl;

    const boardMember = await prisma.boardMember.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: boardMember });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 401 }
      );
    }

    await prisma.boardMember.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Berhasil dihapus." });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}
