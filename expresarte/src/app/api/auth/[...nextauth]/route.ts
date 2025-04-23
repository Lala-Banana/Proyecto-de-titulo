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
    // 🔁 Se ejecuta cuando el usuario inicia sesión con Google
    async signIn({
      user,
      account,
      profile,
    }: {
      user: User;
      account: Account | null;
      profile?: Profile;
    }) {
      try {
        if (profile && "sub" in profile) {
          await fetch(`${process.env.BACKEND_URL || "http://localhost:8000"}/api/usuarios/google/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              nombre: user.name,
              foto_url: user.image,
              google_id: profile.sub,
            }),
          });
        }
      } catch (error) {
        console.error("❌ Error enviando datos a Django:", error);
      }
      return true; // continuar con el flujo de login
    },

    // ✅ Redirigir automáticamente al perfil
    async redirect({ url, baseUrl }) {
      return "/perfil";
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
