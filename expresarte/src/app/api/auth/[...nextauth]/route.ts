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
    // 1. Login con Google y envío al backend
    async signIn({ user, account }) {
      try {
        console.log("🟢 signIn → user:", user);
        console.log("🟢 signIn → account:", account);
        console.log("🧠 Google ID (account.id):", account?.id);


        if (account?.provider === 'google' && user.email) {
          const googleId = account.id; // ✅ usamos account.id
          
          console.log("📤 Enviando a Django:", {
            email: user.email,
            nombre: user.name,
            foto_url: user.image,
            google_id: account?.id,
          });

          const res = await fetch(
            `${process.env.BACKEND_URL || "http://localhost:8000"}/api/usuarios/google/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: user.email,
                nombre: user.name,
                foto_url: user.image,
                google_id: googleId, // ✅ enviamos google_id
              }),
            }
          );

          const data = await res.json();
          console.log("📥 Respuesta backend Django:", data);

          if (!res.ok || !data.tokens?.access) {
            console.error("❌ Token no recibido desde backend:", data);
            return false;
          }

          // ✅ Guardar tokens y google_id en el user para jwt
          (user as any).access_token = data.tokens.access;
          (user as any).refresh_token = data.tokens.refresh;
          (user as any).google_id = googleId;
        }

        return true;
      } catch (error) {
        console.error("❌ Error al enviar a Django:", error);
        return false;
      }
    },

    // 2. Guardar datos en el JWT
    async jwt({ token, user }) {
      console.log("🔵 jwt IN:", token, user);

      if (user) {
        token.nombre = (user as any).name ?? (user as any).nombre;
        token.foto_url = (user as any).image ?? (user as any).foto_url;
        token.email = user.email;
        token.access_token = (user as any).access_token;
        token.refresh_token = (user as any).refresh_token;
        token.google_id = (user as any).google_id; // ✅ guardar google_id
      }

      console.log("🔵 jwt OUT:", token);
      return token;
    },

    // 3. Propagar datos a la sesión
    async session({ session, token }) {
      console.log("🟣 session IN:", token);

      session.user.nombre = token.nombre as string;
      session.user.foto_url = token.foto_url as string;
      session.user.email = token.email as string;
      (session.user as any).google_id = token.google_id; // ✅ en sesión
      (session as any).access_token = token.access_token;
      (session as any).refresh_token = token.refresh_token;

      console.log("🟣 session OUT:", session);
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
