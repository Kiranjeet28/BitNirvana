import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ticketId = params.id;

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        createdBy: true,
        comments: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        statusChanges: {
          include: {
            changedBy: { select: { name: true, role: true } },
          },
          orderBy: { changedAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isOwner = ticket.createdBy.id === userId;
    const viewer = await prisma.user.findUnique({ where: { id: userId } });

    if (!isOwner && viewer?.role !== "ADMIN" && viewer?.role !== "QUERY_RESOLVER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ ticket });
  } catch (error) {
    console.error("Error fetching ticket:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
