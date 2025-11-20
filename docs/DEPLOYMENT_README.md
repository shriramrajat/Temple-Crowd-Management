# Deployment Configuration Documentation

This document explains all the deployment-related files and configurations in the project.

## Overview

The Smart Darshan Slot Booking System is configured for seamless deployment to Vercel with PostgreSQL database support. All necessary configuration files, scripts, and documentation are included.

## File Structure

```
TeamDigitalDaredevils/
├── .env.example                    # Development environment template
├── .env.production.example         # Production environment template
├── vercel.json                     # Vercel deployment configuration
├── DEPLOYMENT.md                   # Comprehensive deployment guide
├── DEPLOYMENT_CHECKLIST.md         # Pre-deployment checklist
├── DEPLOYMENT_SUMMARY.md           # Quick deployment reference
├── VERCEL_SETUP.md                 # Vercel-specific setup guide
├── ENV_VARIABLES.md                # Environment variables documentation
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seed script
└── scripts/
    ├── check-deployment-readiness.js  # Deployment readiness checker
    ├── generate-secrets.js            # Secret generator
    ├── setup-env.js                   # Environment setup helper
    └── test-deployment.js             # Deployment test script
```

## Configuration Files

### 1. `.env.example`

Template for local development environment variables.

**Purpose**: 
- Provides a template for developers to set up their local environment
- Documents all required environment variables
- Safe to commit to version control (no actual secrets)

**Usage**:
```bash
npm run setup:env  # Copies to .env
```

### 2. `.env.production.example`

Template for production environment variables.

**Purpose**:
- Shows production-specific configuration
- Includes security notes and best practices
- Reference for setting up Vercel environment variables

**Usage**:
- Reference when configuring Vercel environment variables
- Not used directly in deployment

### 3. `vercel.json`

Vercel deployment configuration.

**Key Settings**:
```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "framework": "nextjs",
  "regions": ["bom1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

**Configuration Details**:
- **buildCommand**: Generates Prisma client, runs migrations, builds Next.js
- **regions**: Server location (bom1 = Mumbai, India)
- **functions.maxDuration**: API timeout (10 seconds)
- **headers**: Cache control for API routes

### 4. `prisma/schema.prisma`

Database schema definition.

**Models**:
- `Slot`: Time slot configurations
- `Booking`: User bookings
- `AdminUser`: Admin authentication

**Features**:
- Indexes for performance
- Relations between models
- Validation constraints

### 5. `prisma/seed.ts`

Database seeding script.

**What it does**:
- Creates default admin user (admin@temple.com / admin123)
- Creates initial slot configurations for next 7 days
- Hourly slots from 9 AM to 5 PM
- Configurable capacity per slot

**Usage**:
```bash
npm run db:seed
```

## Helper Scripts

### 1. `check-deployment-readiness.js`

Validates that your project is ready for deployment.

**Checks**:
- ✅ Required files exist
- ✅ Environment variables documented
- ✅ Vercel configuration valid
- ✅ Package scripts configured
- ✅ Database schema complete
- ✅ Seed script exists
- ✅ .gitignore configured

**Usage**:
```bash
npm run check:deployment
```

**Output**:
- Lists all checks with pass/fail status
- Provides next steps if all checks pass
- Suggests fixes if checks fail

### 2. `generate-secrets.js`

Generates secure random secrets for production.

**Generates**:
- `NEXTAUTH_SECRET` (base64, 32 bytes)
- `QR_SECRET_KEY` (hex, 32 bytes)
- `CSRF_SECRET` (hex, 32 bytes)

**Usage**:
```bash
npm run generate:secrets
```

**Output**:
- Displays generated secrets
- Provides security notes
- Explains how to add to Vercel

### 3. `setup-env.js`

Sets up local development environment.

**What it does**:
- Copies `.env.example` to `.env`
- Provides setup instructions
- Lists helpful commands

**Usage**:
```bash
npm run setup:env
```

### 4. `test-deployment.js`

Tests deployed application endpoints.

**Tests**:
- Homepage loads
- Darshan booking page loads
- Admin login page loads
- Staff scanner page loads
- API endpoints respond correctly

**Usage**:
```bash
# Test local
npm run test:deployment

# Test production
npm run test:deployment https://your-app.vercel.app
```

## Documentation Files

### 1. `DEPLOYMENT.md`

Comprehensive deployment guide covering:
- Prerequisites
- Database setup (all providers)
- Environment variable configuration
- Step-by-step deployment process
- Post-deployment tasks
- Troubleshooting
- Monitoring and maintenance

**When to use**: First-time deployment or detailed reference

### 2. `DEPLOYMENT_CHECKLIST.md`

Pre-deployment checklist with:
- Environment setup tasks
- Code preparation items
- Testing requirements
- Security checks
- Post-launch monitoring

**When to use**: Before deploying to production

### 3. `DEPLOYMENT_SUMMARY.md`

Quick reference guide with:
- 5-step deployment process
- Essential commands
- Common troubleshooting
- Quick links to detailed docs

**When to use**: Quick deployment or as a reminder

### 4. `VERCEL_SETUP.md`

Vercel-specific guide covering:
- Vercel project setup
- Environment variable management
- Database options
- Deployment workflows
- Monitoring and logs
- Custom domain setup

**When to use**: Vercel-specific questions or issues

### 5. `ENV_VARIABLES.md`

Complete environment variables reference:
- All variables documented
- Format and examples
- How to generate values
- Security best practices
- Troubleshooting

**When to use**: Setting up or debugging environment variables

## Package.json Scripts

### Database Scripts

```bash
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run database migrations
npm run db:seed       # Seed database with initial data
npm run db:studio     # Open Prisma Studio (database GUI)
```

### Deployment Scripts

```bash
npm run check:deployment   # Check if ready for deployment
npm run generate:secrets   # Generate production secrets
npm run setup:env          # Set up local environment
npm run test:deployment    # Test deployed application
```

### Build Scripts

```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run start          # Start production server
npm run lint           # Run ESLint
```

### Vercel Scripts

```bash
npm run vercel-build   # Vercel build command (auto-run)
npm run postinstall    # Auto-generate Prisma client
```

## Deployment Workflow

### Initial Deployment

1. **Prepare**:
   ```bash
   npm run check:deployment
   ```

2. **Generate Secrets**:
   ```bash
   npm run generate:secrets
   ```

3. **Set Up Database**:
   - Choose provider (Vercel Postgres, Supabase, etc.)
   - Get connection string

4. **Configure Vercel**:
   - Import project
   - Add environment variables
   - Deploy

5. **Initialize Database**:
   ```bash
   vercel env pull .env.local
   npm run db:migrate
   npm run db:seed
   ```

6. **Test**:
   ```bash
   npm run test:deployment https://your-app.vercel.app
   ```

### Subsequent Deployments

```bash
git add .
git commit -m "Your changes"
git push origin main
# Vercel auto-deploys
```

## Environment Variables Setup

### Local Development

1. Create `.env`:
   ```bash
   npm run setup:env
   ```

2. Update values in `.env`:
   - Add your database URL
   - Generate secrets
   - Configure email service

3. Test:
   ```bash
   npm run dev
   ```

### Production (Vercel)

1. Generate secrets:
   ```bash
   npm run generate:secrets
   ```

2. Add to Vercel:
   - Dashboard → Settings → Environment Variables
   - Add each variable
   - Select all environments

3. Deploy:
   ```bash
   git push origin main
   ```

## Database Setup

### Supported Providers

1. **Vercel Postgres** (Recommended)
   - Seamless integration
   - Auto-configured
   - Same region as app

2. **Supabase**
   - Free tier available
   - Good for development
   - Built-in auth (optional)

3. **Railway**
   - Simple setup
   - Free tier available
   - Good performance

4. **Neon**
   - Serverless PostgreSQL
   - Free tier available
   - Auto-scaling

### Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require&connection_limit=10
```

**Important Parameters**:
- `sslmode=require`: Secure connection
- `connection_limit=10`: Connection pooling

## Security Considerations

### Secrets Management

- ✅ Use different secrets for each environment
- ✅ Generate strong random secrets
- ✅ Never commit `.env` files
- ✅ Rotate secrets periodically
- ✅ Use Vercel environment variables for production

### Database Security

- ✅ Use SSL connections (`sslmode=require`)
- ✅ Limit connection pool size
- ✅ Restrict database access by IP (if possible)
- ✅ Use strong database passwords

### Application Security

- ✅ Change default admin password immediately
- ✅ Implement rate limiting (if needed)
- ✅ Keep dependencies updated
- ✅ Monitor logs for suspicious activity

## Troubleshooting

### Build Fails

**Check**:
1. All environment variables set
2. Database accessible
3. Prisma schema valid
4. No TypeScript errors

**Fix**:
```bash
npm run check:deployment
vercel env ls
npm run build  # Test locally
```

### Database Connection Issues

**Check**:
1. DATABASE_URL format correct
2. Database server running
3. Network access allowed
4. SSL configured

**Fix**:
```bash
vercel env pull .env.local
npx prisma studio  # Test connection
```

### Deployment Timeout

**Check**:
1. Build command optimized
2. Dependencies not too large
3. No long-running processes in build

**Fix**:
- Optimize build command
- Remove unused dependencies
- Use `.vercelignore`

## Monitoring

### Vercel Dashboard

- **Deployments**: View build logs and status
- **Analytics**: Monitor performance
- **Logs**: View runtime logs
- **Usage**: Track resource usage

### Database Monitoring

```bash
npx prisma studio  # Visual database browser
```

### Application Monitoring

Consider adding:
- Sentry for error tracking
- LogRocket for session replay
- Custom logging for critical operations

## Maintenance

### Regular Tasks

- **Weekly**: Check logs for errors
- **Monthly**: Review database performance
- **Quarterly**: Rotate secrets
- **As needed**: Update dependencies

### Database Maintenance

```bash
# Backup database (provider-specific)
# Monitor connection pool usage
# Optimize slow queries
# Clean up old data (if applicable)
```

### Application Updates

```bash
# Update dependencies
npm update

# Test locally
npm run build
npm start

# Deploy
git push origin main
```

## Support

### Documentation

- [DEPLOYMENT.md](../DEPLOYMENT.md) - Full deployment guide
- [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [DEPLOYMENT_SUMMARY.md](../DEPLOYMENT_SUMMARY.md) - Quick reference
- [VERCEL_SETUP.md](../VERCEL_SETUP.md) - Vercel-specific guide
- [ENV_VARIABLES.md](../ENV_VARIABLES.md) - Environment variables reference

### External Resources

- **Vercel**: https://vercel.com/docs
- **Prisma**: https://www.prisma.io/docs
- **Next.js**: https://nextjs.org/docs
- **Resend**: https://resend.com/docs

### Getting Help

1. Check documentation files
2. Run diagnostic scripts
3. Check Vercel logs
4. Review error messages
5. Consult external documentation

## Best Practices

### Development

- ✅ Use `.env.local` for local development
- ✅ Never commit secrets
- ✅ Test builds locally before deploying
- ✅ Use feature branches for changes
- ✅ Run checks before pushing

### Deployment

- ✅ Use deployment checklist
- ✅ Test in preview environment first
- ✅ Monitor logs after deployment
- ✅ Have rollback plan ready
- ✅ Document any manual steps

### Security

- ✅ Change default passwords
- ✅ Use strong secrets
- ✅ Enable 2FA on accounts
- ✅ Monitor for suspicious activity
- ✅ Keep dependencies updated

---

**Last Updated**: [Date]

For questions or issues, refer to the specific documentation files or consult the external resources listed above.
