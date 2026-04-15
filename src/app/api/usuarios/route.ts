import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const usuarios = await prisma.users.findMany({
    select: { id: true, dni: true, name: true, role: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return NextResponse.json(usuarios);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const { dni, password, name, role } = await req.json();

  if (!dni || !password) {
    return NextResponse.json(
      { error: "DNI y contraseña son requeridos" },
      { status: 400 }
    );
  }

  const existe = await prisma.users.findUnique({ where: { dni } });
  if (existe) {
    return NextResponse.json({ error: "El DNI ya existe" }, { status: 409 });
  }

  const usuario = await prisma.users.create({
    data: {
      dni,
      password,
      name: name || null,
      role: role === "admin" ? "admin" : "user",
    },
    select: { id: true, dni: true, name: true, role: true, created_at: true },
  });

  return NextResponse.json(usuario, { status: 201 });
}
