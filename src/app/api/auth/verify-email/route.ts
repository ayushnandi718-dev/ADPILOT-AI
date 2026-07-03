import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=missing_token", req.url));
  }

  const user = await prisma.user.findFirst({
    where: { verificationToken: token, emailVerified: false },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/auth/sign-in?error=invalid_token", req.url));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verificationToken: null },
  });

  return NextResponse.redirect(new URL("/dashboard?verified=true", req.url));
}
