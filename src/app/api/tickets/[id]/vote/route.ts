import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

const voteSchema = z.object({
  type: z.enum(["UP", "DOWN"]),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const ticketId = params.id;
  const body = await req.json();
  const parsed = voteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const voteType = parsed.data.type;

  // Remove existing vote first
  await prisma.upvote.deleteMany({
    where: { ticketId, userId },
  });

  await prisma.downvote.deleteMany({
    where: { ticketId, userId },
  });

  if (voteType === "UP") {
    await prisma.upvote.create({ data: { ticketId, userId } });
  } else {
    await prisma.downvote.create({ data: { ticketId, userId } });
  }

  return NextResponse.json({ message: `Vote ${voteType === "UP" ? "upvoted" : "downvoted"}` });
}
