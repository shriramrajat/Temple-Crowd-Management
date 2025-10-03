# Deployment Guide

This guide covers how to deploy the Next.js Firebase application to various platforms.

## Environment Variables Setup

Before deploying, ensure you have the following environment variables configured:

### Required Variables
- `NEXT_PUBLIC_FIREBASE_API_KEY` - Your Firebase API key
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` - Your Firebase auth domain
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID` - Your Firebase project ID
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` - Your Firebase storage bucket
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Your Firebase messaging sender ID
- `NEXT_PUBLIC_FIREBASE_APP_ID` - Your Firebase app ID

### Optional Variables
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` - Firebase Analytics measurement ID

## Vercel Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   cd web
   vercel
   ```

4. **Set Environment Variables** in Vercel dashboard:
   - Go to your project settings in Vercel dashboard
   - Navigate to "Environment Variables" section
   - Add all required Firebase configuration variables
   - Ensure they are available for all environments (Production, Preview, Development)

## Netlify Deployment

1. **Build Command**: `npm run build`
2. **Publish Directory**: `.next`
3. **Environment Variables**: Add all Firebase configuration variables in Netlify dashboard

## Firebase Hosting Deployment

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase Hosting**:
   ```bash
   firebase init hosting
   ```

4. **Build and Deploy**:
   ```bash
   npm run build
   firebase deploy
   ```

## Environment Variable Security

- Never commit `.env.local` or any environment files with actual values to version control
- Use the provided `.env.example` as a template
- Ensure all Firebase configuration variables are properly set in your deployment platform
- Consider using different Firebase projects for development, staging, and production

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**:
   - Check that all required variables are set in your deployment platform
   - Verify variable names match exactly (case-sensitive)

2. **Firebase Configuration Errors**:
   - Ensure Firebase project is properly configured
   - Verify that Authentication and Firestore are enabled in Firebase console

3. **Build Failures**:
   - Check that all dependencies are properly installed
   - Verify TypeScript compilation passes locally

### Verification Steps

After deployment:
1. Check that the application loads without console errors
2. Verify Firebase authentication works
3. Test Firestore database operations
4. Confirm responsive design works across devices