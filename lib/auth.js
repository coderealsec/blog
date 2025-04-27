import bcrypt from 'bcryptjs';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from './prisma';

// We expose password hashing utilities that will be used by the seed script
// and the authentication logic
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

// Custom credentials provider for NextAuth
export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        // Şifreyi kontrol et
        const isPasswordValid = await comparePassword(credentials.password, user.password);
        
        if (!isPasswordValid) {
          console.log(`Geçersiz şifre - kullanıcı: ${user.email}`);
          return null;
        }
        
        // Pasif kullanıcılar (emailVerified = null) giriş yapamaz
        if (user.emailVerified === null) {
          console.log(`Pasif kullanıcı girişi engellendi: ${user.email}`);
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
          emailVerified: user.emailVerified
        };
      }
    }
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
}; 