import { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/db'
import { verifyPassword } from '@/lib/password-validation'
import { verifyUserCredentials } from '@/lib/auth-pooler-fix'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  pages: {
    signIn: '/login',
    signOut: '/',
    error: '/auth/error',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Use the pooler-safe auth function
          const user = await verifyUserCredentials(credentials.email, credentials.password)
          return user
        } catch (error) {
          console.error('Auth error:', error)
          // Fallback to direct Prisma if raw SQL fails
          try {
            const user = await prisma.user.findUnique({
              where: {
                email: credentials.email
              }
            })

            if (!user || !user.password) {
              return null
            }

            const isPasswordValid = await verifyPassword(credentials.password, user.password)

            if (!isPasswordValid) {
              return null
            }

            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role,
            }
          } catch (fallbackError) {
            console.error('Fallback auth error:', fallbackError)
            return null
          }
        }
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