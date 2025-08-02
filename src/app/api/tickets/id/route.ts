import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const ticketId = body.ticketId;

  if (!ticketId) {
    return NextResponse.json({ error: "Missing ticketId" }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { id: true, name: true, role: true } },
        comments: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        statusLog: {
          include: {
            changedBy: { select: { name: true, role: true } },
          },
          orderBy: { timestamp: "asc" },
        },
        category: { select: { name: true } },
        upvotes: true,
        downvotes: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isOwner = ticket.user.id === userId;

    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isPrivileged =
      viewer?.role === "ADMIN" || viewer?.role === "SUPPORT_AGENT";

    if (!isOwner && !isPrivileged) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
