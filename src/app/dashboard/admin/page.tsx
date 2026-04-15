import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminUsuarios from "./AdminUsuarios";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "admin") redirect("/dashboard");

  const usuarios = await prisma.users.findMany({
    select: { id: true, dni: true, name: true, role: true, created_at: true },
    orderBy: { created_at: "desc" },
  });

  return <AdminUsuarios usuariosIniciales={usuarios} />;
}
