# Next.js Authentication System

A secure authentication system built with Next.js, NextAuth.js, Prisma ORM, and PostgreSQL.

## Features

- User authentication with NextAuth.js
- PostgreSQL database integration with Prisma ORM
- Role-based authorization (Admin and User roles)
- Registration and login pages
- Protected routes with middleware
- Modern UI with shadcn/ui components

## Project Setup

1. Next.js project with Pages Router
2. PostgreSQL database connection (Neon DB)
3. Prisma ORM integration
4. NextAuth authentication system
5. Role-based authorization
6. shadcn/ui components for UI

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables in `.env` file
4. Run the development server:
   ```bash
   npm run dev
   ```

## Default Admin User

The system is seeded with a default admin user:
- Email: admin@example.com
- Password: admin123

## Project Structure

- `/pages` - Next.js pages
- `/pages/api` - API routes
- `/pages/auth` - Authentication pages
- `/pages/dashboard` - Protected dashboard
- `/components` - UI components
- `/lib` - Utility functions
- `/prisma` - Prisma configuration

## Key URLs

- http://localhost:3000 - Homepage
- http://localhost:3000/auth/login - Login page
- http://localhost:3000/auth/register - Registration page
- http://localhost:3000/dashboard - User dashboard (protected)

## Security Implementation

1. **Secure Authentication**:
   - Password hashing with bcrypt
   - JWT-based authentication with NextAuth.js
   - CSRF protection built into NextAuth.js
   - HTTP-only cookies for session management

2. **Role-Based Access Control**:
   - Distinct user roles (ADMIN, USER)
   - Role verification in middleware
   - Protected routes that check for authentication status
   - Admin-only sections in dashboard

3. **Server-Side Security**:
   - Password never stored in plain text
   - Input validation for registration
   - Protected API routes
   - Environment variables for secure configuration

4. **Dashboard Access Control**:
   - All authenticated users can access the base dashboard
   - Admin-specific features are conditionally rendered
   - Admin-only routes are protected by middleware
   - Role checks in both client and server components

## Implementation Details

- **NextAuth Integration**: Custom credential provider with database adapter
- **Prisma Schema**: User model with role enum and relations for sessions
- **Middleware**: Route protection based on authentication and roles
- **Pages**: SSR-compatible authentication flow
- **API Routes**: Secure endpoints for user registration and authentication
- **Database**: PostgreSQL with Neon DB for cloud hosting
- **UI**: Modern interface with shadcn/ui components and Tailwind CSS

## Technologies Used

- Next.js
- NextAuth.js
- Prisma ORM
- PostgreSQL (Neon DB)
- shadcn/ui
- Tailwind CSS

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn-pages-router) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/pages/building-your-application/deploying) for more details.
