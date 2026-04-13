import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documents = await prisma.eventDocument.findMany({
      where: { eventId: params.id },
      orderBy: { uploadedAt: "asc" },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching event documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch event documents" },
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin =
      session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { type, url, caption } = body;

    if (!type || !url) {
      return NextResponse.json(
        { error: "Type and URL are required" },
        { status: 400 }
      );
    }

    const document = await prisma.eventDocument.create({
      data: {
        eventId: params.id,
        type,
        url,
        caption: caption || null,
      },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error("Error creating event document:", error);
    return NextResponse.json(
      { error: "Failed to create event document" },
      { status: 500 }
    );
  }
}
