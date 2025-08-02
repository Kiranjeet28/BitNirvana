import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for creating a new ticket
const ticketSchema = z.object({
  subject: z.string().min(5),
  description: z.string().min(10),
  category: z.string().min(2),
  attachment: z.string().url().optional(),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "createdAt";
  const order = searchParams.get("order") === "asc" ? "asc" : "desc";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const where: any = {};

  // Only allow type=ALL for public access
  if (type === "MINE") {
    // Require login for personal tickets
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    where.userId = session.user.id;
  }

  // Filters
  if (status) where.status = status;
  if (category) where.category = { name: category };
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const tickets = await prisma.ticket.findMany({
    where,
    orderBy: { [sort]: order },
    skip: (page - 1) * limit,
    take: limit,
    include: {
      user: { select: { name: true } }, // Limited public info
      category: true,
      comments: false,
    },
  });

  const totalCount = await prisma.ticket.count({ where });

  return NextResponse.json({
    tickets,
    meta: {
      total: totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
    },
  });
}


// ===================== POST Create Ticket =====================
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const body = await req.json();
  const parsed = ticketSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { subject, description, category, attachment } = parsed.data;

  try {
    // Find the category by name to get its id
    const categoryRecord = await prisma.category.findUnique({
      where: { name: category },
      select: { id: true },
    });

    if (!categoryRecord) {
      return NextResponse.json({ error: "Category not found" }, { status: 400 });
    }

    const ticket = await prisma.ticket.create({
      data: {
        title: subject,
        description,
        attachments: attachment ? [attachment] : [],
        status: "OPEN",
        userId,
        categoryId: categoryRecord.id,
      },
    });

    await prisma.ticketStatusHistory.create({
      data: {
        ticketId: ticket.id,
        oldStatus: "OPEN",
        changedById: userId,
      },
    });

    return NextResponse.json({ message: "Ticket created", ticket }, { status: 201 });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return NextResponse.json({ error: "Failed to create ticket" }, { status: 500 });
  }
}
