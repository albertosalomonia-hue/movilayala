import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "10");
  const skip = (page - 1) * limit;

  const where =
    session.user.role === "admin" ? {} : { user_dni: session.user.dni };

  const [registros, total] = await Promise.all([
    prisma.daily_logs.findMany({
      where,
      include: { users: { select: { name: true, dni: true } } },
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
    }),
    prisma.daily_logs.count({ where }),
  ]);

  return NextResponse.json({ registros, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await req.json();
  const {
    mileage_start,
    fuel_start,
    photo_start,
    date,
    time_start,
  } = body;

  if (!mileage_start || !fuel_start) {
    return NextResponse.json(
      { error: "Kilometraje y combustible inicial son requeridos" },
      { status: 400 }
    );
  }

  const registro = await prisma.daily_logs.create({
    data: {
      user_dni: session.user.dni,
      date: date ?? new Date().toLocaleDateString("es-MX"),
      mileage_start: String(mileage_start),
      fuel_start: String(fuel_start),
      photo_start: photo_start ?? null,
      time_start: time_start ?? new Date().toLocaleTimeString("es-MX"),
      status: "started",
    },
  });

  return NextResponse.json(registro, { status: 201 });
}
