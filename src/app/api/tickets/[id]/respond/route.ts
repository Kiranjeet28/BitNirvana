// ✅ src/app/api/tickets/[id]/respond/route.ts

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const responseSchema = z.object({
  message: z.string().min(1),
});

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.role) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: ticketId } = context.params;
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
        text: parsed.data.message,
      },
    });

    return NextResponse.json({ message: "Response added", comment }, { status: 201 });
  } catch (err) {
    console.error("Create comment error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
