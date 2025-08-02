import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Role, RequestStatus } from "@prisma/client";

// 🚀 POST - Used by user to request role upgrade
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const existing = await prisma.upgradeRequest.findFirst({
    where: { userId, status: "PENDING" },
  });

  if (existing) {
    return NextResponse.json({ error: "Request already pending" }, { status: 400 });
  }

  const request = await prisma.upgradeRequest.create({
    data: {
      userId,
      status: "PENDING",
    },
  });

  return NextResponse.json({ message: "Upgrade request sent", request });
}
// export async function PATCH(req: Request) {
  // const session = await getServerSession(authOptions);
  // if (!session?.user?.id) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // }

  // const admin = await prisma.user.findUnique({
  //   where: { id: session.user.id },
  //   select: { role: true },
  // });

  // if (admin?.role !== "ADMIN") {
  //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // }

  // Get the ID from request body
  // const body = await req.json();
  // const { id } = body;

  // if (!id) {
  //   return NextResponse.json({ error: "Missing request ID" }, { status: 400 });
  // }

  // const request = await prisma.upgradeRequest.findUnique({
  //   where: { id },
  //   include: { user: true },
  // });

  // if (!request || request.status !== "PENDING") {
  //   return NextResponse