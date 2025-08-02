import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const responseSchema = z.object({
  message: z.string().min(1, "Response message is required"),
});

export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const role = session.user.role;

  if (role !== "SUPPORT_AGENT" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = responseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: z.treeifyError(parsed.error) }, { status: 400 });
  }

  try {
    // Check if ticket exists
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Add comment
    const comment = await prisma.comment.create({
      data: {
        ticketId: id,
        userId: userId,
        message: parsed.data.message,
        text: parsed.data.message, // Add 'text' property as required by the type
      },
    });

    return NextResponse.json({ message: "Response added", comment }, { status: 201 });
  } catch (error) {
    console.error("Error responding to ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
