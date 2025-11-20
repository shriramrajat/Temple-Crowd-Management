# Quick Start: Admin Authentication

Get the admin authentication system up and running in 5 minutes.

## Step 1: Install Dependencies (Already Done)
```bash
npm install --legacy-peer-deps
```

## Step 2: Configure Environment
Ensure these variables are in your `.env` file:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

## Step 3: Setup Database
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Create admin user
npm run db:seed
```

## Step 4: Start Development Server
```bash
npm run dev
```

## Step 5: Test Login
1. Open browser to `http://localhost:3000/admin/login`
2. Login with:
   - **Email:** admin@temple.com
   - **Password:** admin123
3. You should be redirected to `/admin` dashboard

## Default Credentials
⚠️ **Change these in production!**
- Email: `admin@temple.com`
- Password: `admin123`

## Troubleshooting

### "Cannot fetch data from service"
- Ensure database is running
- Check DATABASE_URL in .env
- Run `npx prisma generate`

### "Invalid email or password"
- Verify seed script ran successfully
- Check database for admin_users table
- Verify email and password are correct

### Redirect loop
- Clear browser cookies
- Verify NEXTAUTH_URL matches your app URL
- Check middleware.ts configuration

## Using Auth in API Routes

```typescript
import { withAuth } from "@/lib/auth-helpers";

export async function GET() {
  const authResult = await withAuth();
  
  if (authResult instanceof NextResponse) {
    return authResult; // Unauthorized
  }
  
  const session = authResult;
  // Your protected logic here
}
```

## Next Steps
- Proceed to Task 15: Implement admin API routes
- Use `withAuth()` helper to protect API endpoints
- Admin pages are already protected by middleware

## Need Help?
- Check `docs/ADMIN_AUTH_SETUP.md` for detailed guide
- Review `docs/TASK_14_IMPLEMENTATION_SUMMARY.md` for implementation details
- Use `docs/VERIFICATION_CHECKLIST.md` to verify setup
