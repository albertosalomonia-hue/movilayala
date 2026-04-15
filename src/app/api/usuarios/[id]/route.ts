import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const { name, role, password } = await req.json();

  const data: Record<string, string> = {};
  if (name !== undefined) data.name = name;
  if (role === "admin" || role === "user") data.role = role;
  if (password) data.password = password;

  const usuario = await prisma.users.update({
    where: { id: parseInt(id) },
    data,
    select: { id: true, dni: true, name: true, role: true, created_at: true },
  });

  return NextResponse.json(usuario);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { id } = await params;

  if (String(session.user.id) === id) {
    return NextResponse.json(
      { error: "No puedes eliminar tu propia cuenta" },
      { status: 400 }
    );
  }

  await prisma.users.delete({ where: { id: parseInt(id) } });

  return NextResponse.json({ ok: true });
}
