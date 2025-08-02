import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const responseSchema = z.object({
  message: z.string().min(1, "Response message is required"),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ticketId } = params;
  const userId = session.user.id;
  const role = session.user.role;

  if (role !== "SUPPORT_AGENT" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = responseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Add comment
    const comment = await prisma.comment.create({
      data: {
        ticketId,
        userId: userId,
        message: parsed.data.message,
      },
    });

    return NextResponse.json({ message: "Response added", comment }, { status: 201 });
  } catch (error) {
    console.error("Error responding to ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
