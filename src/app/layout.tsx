import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MovilAyala",
  description: "Control de Flota Vehicular",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MovilAyala",
    startupImage: "/icons/apple-touch-icon.png",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
    icon: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e3a5f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full">
      <body className={`${geist.className} h-full bg-gray-50`}>
        <ServiceWorkerRegister />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
