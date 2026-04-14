import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { mileage_end, fuel_end, photo_end, time_end } = body;

  const registro = await prisma.daily_logs.findUnique({
    where: { id: parseInt(id) },
  });

  if (!registro) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  if (registro.user_dni !== session.user.dni && session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  if (registro.status === "ended") {
    return NextResponse.json({ error: "El registro ya fue cerrado" }, { status: 400 });
  }

  const kmInicial = parseFloat(registro.mileage_start ?? "0");
  const kmFinal = parseFloat(mileage_end);
  const distance = kmFinal - kmInicial;

  const updated = await prisma.daily_logs.update({
    where: { id: parseInt(id) },
    data: {
      mileage_end: String(mileage_end),
      fuel_end: String(fuel_end),
      photo_end: photo_end ?? null,
      time_end: time_end ?? new Date().toLocaleTimeString("es-MX"),
      distance: String(distance >= 0 ? distance : 0),
      status: "ended",
    },
  });

  return NextResponse.json(updated);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  const registro = await prisma.daily_logs.findUnique({
    where: { id: parseInt(id) },
    include: { users: { select: { name: true, dni: true } } },
  });

  if (!registro) {
    return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
  }

  if (registro.user_dni !== session.user.dni && session.user.role !== "admin") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  return NextResponse.json(registro);
}
