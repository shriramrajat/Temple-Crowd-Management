# Environment Setup Guide

This guide explains how to configure environment variables for the Next.js Firebase application.

## Quick Start

1. **Copy the example environment file**:
   ```bash
   cp .env.example .env.local
   ```

2. **Get Firebase configuration**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (or create a new one)
   - Go to Project Settings > General > Your apps
   - Copy the Firebase configuration values

3. **Update .env.local** with your Firebase configuration:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

4. **Verify configuration**:
   ```bash
   npm run check-env
   ```

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key | `AIzaSyDFWmXak9hWp5xQJHdJMFBPRGdgaSh8RlQ` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `myproject.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `myproject-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `myproject.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID | `123456789012` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123456789012:web:abcdef123456` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Firebase Analytics measurement ID | `G-XXXXXXXXXX` |

## Security Notes

- **Never commit `.env.local`** to version control
- All variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- Firebase configuration is safe to expose as it's designed for client-side use
- Use different Firebase projects for development, staging, and production

## Troubleshooting

### Common Issues

1. **"Missing required environment variable" error**:
   - Check that `.env.local` exists
   - Verify all required variables are set
   - Run `npm run check-env` to validate

2. **Firebase initialization errors**:
   - Verify Firebase project exists and is active
   - Check that Authentication and Firestore are enabled
   - Ensure API keys are correct and not expired

3. **TypeScript errors about environment variables**:
   - The types are defined in `src/types/env.d.ts`
   - Restart your TypeScript server if needed

### Validation Commands

```bash
# Check environment configuration
npm run check-env

# Build with environment validation
npm run build

# Development with environment validation
npm run dev
```

## Development vs Production

### Development
- Use `.env.local` for local development
- Firebase emulator can be used for testing
- Environment validation runs automatically

### Production
- Set environment variables in your deployment platform
- Use production Firebase project
- Environment validation runs before build

## Getting Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon → Project settings
4. Scroll down to "Your apps" section
5. Click on your web app or create a new one
6. Copy the configuration object values to your `.env.local`

## Multiple Environments

For different environments (dev, staging, prod), create separate Firebase projects:

- `myapp-dev` for development
- `myapp-staging` for staging  
- `myapp-prod` for production

Each environment should have its own set of environment variables.