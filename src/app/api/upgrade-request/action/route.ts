import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request) {
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

  // Extract id from the URL
  const url = new URL(request.url);
  const id = url.pathname.split("/").pop();

  if (!id) {
    return NextResponse.json({ error: "Missing upgrade request id" }, { status: 400 });
  }

  const upgradeRequest = await prisma.upgradeRequest.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!upgradeRequest || !upgradeRequest.userId) {
    return NextResponse.json({ error: "Upgrade request not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: upgradeRequest.userId },
    data: { role: "QUERY_RESOLVER" as Role },
  });

  await prisma.upgradeRequest.update({
    where: { id },
    data: { status: "APPROVED" },
  });

  return NextResponse.json({ message: "User role upgraded" });
}
