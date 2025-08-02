import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for request validation
const responseSchema = z.object({
  ticketId: z.string(),
  message: z.string().min(1, "Message is required"),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = session.user.role;
  if (role !== "SUPPORT_AGENT" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = responseSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { ticketId, message } = parsed.data;

  try {
    const comment = await prisma.comment.create({
      data: {
        ticketId,
        userId: session.user.id,
        message,
        text: message, // Add this line to satisfy the required 'text' property
      },
    });

    return NextResponse.json({ message: "Response added", comment }, { status: 201 });
  } catch (err) {
    console.error("Respond Error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
