import { NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/types";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message: "Jika email terdaftar, Anda akan menerima link reset password.",
      });
    }

    // TODO: Implement actual password reset token generation and email sending
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: "Jika email terdaftar, Anda akan menerima link reset password.",
    });
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
