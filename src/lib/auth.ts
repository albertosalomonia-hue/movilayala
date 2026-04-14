import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        dni: { label: "DNI", type: "text" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.dni || !credentials?.password) return null;

        const user = await prisma.users.findUnique({
          where: { dni: credentials.dni },
        });

        if (!user) return null;

        if (credentials.password !== user.password) return null;

        return {
          id: String(user.id),
          dni: user.dni,
          name: user.name ?? user.dni,
          role: user.role ?? "user",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.dni = (user as unknown as { dni: string }).dni;
        token.role = (user as unknown as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.dni = token.dni as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
};
