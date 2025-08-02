import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (admin?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const request = await prisma.upgradeRequest.findUnique({
    where: { id: params.id },
    include: { user: true },
  });

  if (!request || !request.userId) {
    return NextResponse.json({ error: "Upgrade request not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: request.userId },
    data: { role: "QUERY_RESOLVER" as Role },
  });

  await prisma.upgradeRequest.update({
    where: { id: params.id },
    data: { status: "APPROVED" },
  });

  return NextResponse.json({ message: "User role upgraded" });
}
