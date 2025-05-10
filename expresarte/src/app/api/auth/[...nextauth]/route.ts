import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { Account, Profile, User } from "next-auth";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }: { user: User; account: Account | null; profile?: Profile }) {
      try {
        if (profile && "sub" in profile && user.email) {
          const res = await fetch(`${process.env.BACKEND_URL || "http://localhost:8000"}/api/usuarios/google/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              nombre: user.name,
              foto_url: user.image,
              google_id: profile.sub,
            }),
          });

          const data = await res.json();
          console.log("🔍 Respuesta backend Django:", data);
          if (!res.ok || !data.tokens?.access) {
            console.error("❌ Token no recibido desde Django:", data);
            return false;
          }

          // Pasar tokens al callback jwt
          (user as any).access_token = data.tokens.access;
          (user as any).refresh_token = data.tokens.refresh;
        }
      } catch (error) {
        console.error("❌ Error enviando datos a Django:", error);
        return false;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.nombre = user.name ?? undefined;
        token.foto_url = user.image ?? undefined;
        token.email = user.email ?? undefined;
        token.access_token = (user as any).access_token;
        token.refresh_token = (user as any).refresh_token;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.nombre = token.nombre;
        session.user.foto_url = token.foto_url;
        session.user.email = token.email;
        (session as any).access_token = token.access_token;
        (session as any).refresh_token = token.refresh_token;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      return "/";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
