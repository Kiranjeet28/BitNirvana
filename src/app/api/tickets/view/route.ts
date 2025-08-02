import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const ticketId = searchParams.get("id");

  if (!ticketId) {
    return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
  }

  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        user: { select: { name: true, email: true } },
        category: true,
        comments: {
          include: {
            user: { select: { name: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (err) {
    console.error("Error fetching ticket:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
