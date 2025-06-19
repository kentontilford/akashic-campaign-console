import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { authenticateUser } from '@/lib/auth-simple'

export const authOptions: NextAuthOptions = {
  // Remove Prisma adapter to avoid pooler issues
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[NextAuth] Missing credentials')
          return null
        }

        console.log('[NextAuth] Authenticating:', credentials.email)
        const user = await authenticateUser(credentials.email, credentials.password)
        
        if (user) {
          console.log('[NextAuth] Authentication successful')
        } else {
          console.log('[NextAuth] Authentication failed')
        }
        
        return user
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          role: user.role,
        }
      }
      return token
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          role: token.role,
        }
      }
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  }
}