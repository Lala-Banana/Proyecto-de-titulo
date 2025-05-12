import NextAuth, { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    // 1. Lógica de inicio de sesión con Google y backend personalizado
    async signIn({ user, account, profile }) {
      try {
        console.log("🟢 signIn → user (original):", user);
        console.log("🟢 signIn → profile:", profile);
        console.log("🟢 signIn → account:", account);

        if (profile && "sub" in profile && user.email) {
          const res = await fetch(
            `${process.env.BACKEND_URL || "http://localhost:8000"}/api/usuarios/google/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                nombre: user.name,
                foto_url: user.image,
                google_id: profile.sub,
              }),
            }
          );

          const data = await res.json();
          console.log("🔍 Respuesta backend Django:", data);

          if (!res.ok || !data.tokens?.access) {
            console.error("❌ Token no recibido desde Django:", data);
            return false;
          }

          // ✅ Guarda los tokens temporalmente en el `user`
          (user as any).access_token = data.tokens.access;
          (user as any).refresh_token = data.tokens.refresh;

          console.log("🟢 signIn → user (con tokens):", user);
        }

        return true;
      } catch (error) {
        console.error("❌ Error enviando datos a Django:", error);
        return false;
      }
    },

    // 2. Guardamos los tokens y datos del usuario en el token JWT
    async jwt({ token, user }) {
      console.log("🔵 jwt → token IN:", token);
      console.log("🔵 jwt → user IN:", user);

      if (user) {
        token.nombre = (user as any).name ?? (user as any).nombre;
        token.foto_url = (user as any).image ?? (user as any).foto_url;
        token.email = user.email;
        token.access_token = (user as any).access_token;
        token.refresh_token = (user as any).refresh_token;
      }

      console.log("🔵 jwt → token OUT:", token);
      return token;
    },

    // 3. Propagamos datos desde el token hacia la sesión
    async session({ session, token }) {
      console.log("🟣 session → token IN:", token);

      session.user.nombre = token.nombre as string;
      session.user.foto_url = token.foto_url as string;
      session.user.email = token.email as string;
      (session as any).access_token = token.access_token;
      (session as any).refresh_token = token.refresh_token;

      console.log("🟣 session → session OUT:", session);
      return session;
    },

    redirect() {
      return "/";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
