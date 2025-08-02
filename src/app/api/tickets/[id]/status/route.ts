import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";
import { TicketStatus } from "@prisma/client";

// Define allowed status transitions
const allowedTransitions: Record<TicketStatus, TicketStatus[]> = {
  OPEN: [TicketStatus.IN_PROGRESS, TicketStatus.CLOSED],
  IN_PROGRESS: [TicketStatus.RESOLVED, TicketStatus.CLOSED],
  RESOLVED: [TicketStatus.CLOSED],
  CLOSED: [],
};

const commentSchema = z.object({
  text: z.string().min(1, "Comment text is required"),
});

const statusSchema = z.object({
  status: z.nativeEnum(TicketStatus),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticketId = params.id;
  const userId = session.user.id;

  const body = await req.json();
  const parsed = commentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
    include: { user: true },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isOwner = ticket.user.id === userId;
  const isAdminOrResolver = currentUser?.role === "ADMIN" || currentUser?.role === "SUPPORT_AGENT";

  if (!isOwner && !isAdminOrResolver) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const comment = await prisma.comment.create({
      data: {
        text: parsed.data.text,
        ticketId,
        userId,
      },
      include: {
        user: { select: { name: true, role: true } },
      },
    });

    return NextResponse.json({ message: "Comment added", comment }, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ticketId = params.id;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const newStatus = parsed.data.status;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (!user || !["SUPPORT_AGENT", "ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const validTransitions = allowedTransitions[ticket.status as TicketStatus];
  if (!validTransitions.includes(newStatus)) {
    return NextResponse.json(
      {
        error: `Invalid status transition from ${ticket.status} to ${newStatus}`,
      },
      { status: 400 }
    );
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: newStatus },
  });

  await prisma.ticketStatusHistory.create({
    data: {
      ticketId,
      oldStatus: ticket.status,
      changedById: userId,
    },
  });

  return NextResponse.json({ message: "Status updated", ticket: updatedTicket });
}
