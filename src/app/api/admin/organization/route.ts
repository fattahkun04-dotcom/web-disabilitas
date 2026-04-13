import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { orgProfileSchema } from "@/types";

export async function GET() {
  try {
    const profile = await prisma.organizationProfile.findFirst();
    if (!profile) {
      return NextResponse.json({ success: true, data: null });
    }
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Akses ditolak." } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const validated = orgProfileSchema.parse(body);

    const existing = await prisma.organizationProfile.findFirst();

    let profile;
    if (existing) {
      profile = await prisma.organizationProfile.update({
        where: { id: existing.id },
        data: validated,
      });
    } else {
      profile = await prisma.organizationProfile.create({
        data: validated,
      });
    }

    return NextResponse.json({ success: true, data: profile });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: { code: "VALIDATION_ERROR", message: error.errors[0]?.message } },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Terjadi kesalahan server." } },
      { status: 500 }
    );
  }
}
