import { getServerSession } from 'next-auth';
import { authOptions } from './auth';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function isAuthenticated() {
  const session = await getSession();
  return !!session?.user;
}

export async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === 'ADMIN';
} 