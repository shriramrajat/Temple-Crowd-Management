# Admin Authentication Setup Guide

This guide explains how to set up and use the admin authentication system for the Darshan Slot Booking application.

## Prerequisites

- Node.js installed
- PostgreSQL database running (via Prisma Postgres or other)
- Environment variables configured

## Installation

The required packages have already been installed:
- `next-auth@beta` (Auth.js v5)
- `bcryptjs` for password hashing
- `@types/bcryptjs` for TypeScript support

## Configuration

### 1. Environment Variables

Add the following to your `.env` file:

```env
# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**Important:** Generate a secure secret for production using:
```bash
openssl rand -base64 32
```

### 2. Database Setup

The `AdminUser` model is already defined in the Prisma schema:

```prisma
model AdminUser {
  id           String   @id @default(uuid())
  email        String   @unique @db.VarChar(255)
  passwordHash String   @db.VarChar(255)
  role         String   @default("admin") @db.VarChar(20)
  createdAt    DateTime @default(now())
  
  @@map("admin_users")
}
```

### 3. Run Database Migrations

Ensure your database is running, then apply migrations:

```bash
npx prisma migrate dev
```

### 4. Create Initial Admin User

Run the seed script to create the default admin account:

```bash
npm run db:seed
```

**Default Credentials:**
- Email: `admin@temple.com`
- Password: `admin123`

⚠️ **IMPORTANT:** Change these credentials immediately after first login in production!

## Usage

### Admin Login

1. Navigate to `/admin/login`
2. Enter your email and password
3. Click "Sign In"
4. You'll be redirected to the admin dashboard at `/admin`

### Protected Routes

All routes under `/admin/*` (except `/admin/login`) are protected by the middleware. Users must:
- Be authenticated
- Have either `admin` or `staff` role

### Logout

Click the "Logout" button in the admin dashboard header to sign out.

## File Structure

```
TeamDigitalDaredevils/
├── app/
│   ├── admin/
│   │   └── login/
│   │       └── page.tsx          # Login page
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts      # NextAuth API routes
├── components/
│   ├── admin/
│   │   └── logout-button.tsx    # Logout button component
│   └── providers/
│       └── session-provider.tsx # Session provider wrapper
├── lib/
│   └── auth.ts                  # NextAuth configuration
├── middleware.ts                # Route protection middleware
├── prisma/
│   └── seed.ts                  # Database seed script
└── types/
    └── next-auth.d.ts           # NextAuth type definitions
```

## API Routes

### Authentication Endpoints

- `GET /api/auth/signin` - Sign in page
- `POST /api/auth/signin` - Sign in handler
- `GET /api/auth/signout` - Sign out page
- `POST /api/auth/signout` - Sign out handler
- `GET /api/auth/session` - Get current session
- `GET /api/auth/csrf` - Get CSRF token

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Sessions**: Secure JWT-based session management
3. **CSRF Protection**: Built-in CSRF protection via NextAuth
4. **Route Protection**: Middleware prevents unauthorized access
5. **Role-Based Access**: Support for `admin` and `staff` roles

## Adding More Admin Users

To add more admin users, you can either:

1. **Via Database**: Insert directly into the `admin_users` table with a hashed password
2. **Via Seed Script**: Modify `prisma/seed.ts` to add more users
3. **Via Admin Panel**: Create an admin user management page (future enhancement)

### Example: Hash a Password

```typescript
import { hash } from "bcryptjs";

const password = "newpassword123";
const passwordHash = await hash(password, 10);
console.log(passwordHash);
```

## Troubleshooting

### "Invalid email or password" error
- Verify the email and password are correct
- Check that the admin user exists in the database
- Ensure the password hash was generated correctly

### Redirect loop on login
- Verify `NEXTAUTH_URL` matches your application URL
- Clear browser cookies and try again
- Check middleware configuration

### Database connection errors
- Ensure PostgreSQL is running
- Verify `DATABASE_URL` in `.env` is correct
- Run `npx prisma generate` to regenerate the client

## Next Steps

After setting up authentication, you can:
1. Implement task 15: Admin API routes with authentication checks
2. Add password change functionality
3. Implement user management for creating/editing admin users
4. Add two-factor authentication (optional enhancement)

## Requirements Satisfied

This implementation satisfies **Requirement 7.1** from the design document:
- ✅ Admin authentication system
- ✅ Login page at `/app/admin/login/page.tsx`
- ✅ Credentials provider with email/password
- ✅ Middleware to protect `/app/admin/*` routes
- ✅ Admin user seed script
- ✅ Logout functionality
