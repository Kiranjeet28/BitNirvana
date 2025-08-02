import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});

const allowedTransitions: Record<string, string[]> = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["RESOLVED"],
  RESOLVED: ["CLOSED"],
  CLOSED: [],
};

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

  if (!user || (user.role !== "QUERY_RESOLVER" && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  const validTransitions = allowedTransitions[ticket.status];
  if (!validTransitions.includes(newStatus)) {
    return NextResponse.json({
      error: `Invalid status transition from ${ticket.status} to ${newStatus}`,
    }, { status: 400 });
  }

  const updatedTicket = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status: newStatus },
  });

  await prisma.ticketStatusHistory.create({
    data: {
      ticketId,
      status: newStatus,
      changedById: userId,
    },
  });

  return NextResponse.json({ message: "Status updated", ticket: updatedTicket });
}
