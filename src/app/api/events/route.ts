import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { eventSchema } from "@/types";
import { slugify } from "@/lib/utils";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: Record<string, unknown> = {};

    if (status === "upcoming") {
      where.status = "PUBLISHED";
      where.startDate = { gte: new Date() };
    } else if (status === "completed") {
      where.status = "COMPLETED";
    } else if (status && status !== "all") {
      where.status = status;
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDate: "asc" },
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        coverImageUrl: true,
        location: true,
        locationUrl: true,
        startDate: true,
        endDate: true,
        status: true,
        category: true,
        maxParticipants: true,
      },
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
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
    const validatedData = eventSchema.parse(body);

    const slug = slugify(validatedData.title);

    const event = await prisma.event.create({
      data: {
        ...validatedData,
        slug,
        startDate: new Date(validatedData.startDate),
        endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
        locationUrl: validatedData.locationUrl || null,
        createdBy: session.user.id,
        maxParticipants: validatedData.maxParticipants || null,
      },
    });

    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    if (error instanceof Error && "format" in (error as any)) {
      return NextResponse.json(
        { error: "Invalid data", details: (error as any).format?.() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
