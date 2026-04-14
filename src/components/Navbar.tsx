"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Inicio", icon: "🏠" },
    { href: "/dashboard/nuevo", label: "Nuevo", icon: "➕" },
    { href: "/dashboard/historial", label: "Historial", icon: "📋" },
  ];

  return (
    <>
      {/* Top bar */}
      <header className="bg-blue-900 text-white px-4 py-3 flex items-center justify-between shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl">🚛</span>
          <span className="font-bold text-base">MovilAyala</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-blue-200">{session?.user?.name ?? session?.user?.dni}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-xs bg-blue-700 hover:bg-blue-600 px-3 py-1.5 rounded-full transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 flex flex-col items-center py-3 text-xs transition-colors ${
                  active
                    ? "text-blue-700 bg-blue-50"
                    : "text-gray-500 hover:text-blue-600"
                }`}
              >
                <span className="text-xl mb-0.5">{link.icon}</span>
                <span className="font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
