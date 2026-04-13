import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/types";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "@/lib/resend";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, phone, childName, specialNeedType } = registerSchema.parse(body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: "EMAIL_EXISTS", message: "Email sudah terdaftar." } },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash,
        role: "MEMBER",
        member: {
          create: {
            phone,
            childName,
            specialNeedType,
            status: "PENDING",
          },
        },
      },
      include: { member: true },
    });

    await sendVerificationEmail(email, name);

    return NextResponse.json(
      { success: true, data: { id: user.id, email: user.email }, message: "Pendaftaran berhasil. Akun Anda sedang diverifikasi." },
      { status: 201 }
    );
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
