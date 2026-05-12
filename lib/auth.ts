import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token }) {
      return token
    },
    async session({ session, token }) {
      session.user.steamId = token.steamId ?? (token.sub as string)
      session.user.name = token.name
      session.user.image = token.picture as string | null
      return session
    },
  },
  pages: {
    signIn: "/",
  },
}
