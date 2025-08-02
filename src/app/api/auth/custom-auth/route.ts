import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { signIn } from "next-auth/react";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = formSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    const isValid = await bcrypt.compare(password, existingUser.password);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Login user via next-auth
    return NextResponse.json({ message: "Login success", user: existingUser }, { status: 200 });
  }

  // Register new user
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      email,
      name: name || email.split("@")[0],
      password: hashedPassword,
      role: "USER", // or let user select role if required
    },
  });

  return NextResponse.json({ message: "User registered", user: newUser }, { status: 201 });
}
