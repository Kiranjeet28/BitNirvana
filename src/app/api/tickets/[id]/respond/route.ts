// ✅ app/api/tickets/[id]/respond/route.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for validation
const responseSchema = z.object({
  message: z.string().min(1, "Response is required"),
});

// ✅ Correct route handler signature
export async function POST(
  req: Request,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ticketId = context.params.id;
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
    const comment = await prisma.comment.create({
      data: {
        ticketId,
        userId: session.user.id,
        message: parsed.data.message,
        text: parsed.data.message, // Add this line to satisfy the required 'text' property
      },
    });

    return NextResponse.json({ message: "Response added", comment }, { status: 201 });
  } catch (error) {
    console.error("Error responding to ticket:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
