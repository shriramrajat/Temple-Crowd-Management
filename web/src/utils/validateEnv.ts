/**
 * Environment Validation Utility
 * 
 * This utility helps validate environment configuration during development
 * and provides helpful debugging information.
 */

import { env } from '@/config/env';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates the current environment configuration
 */
export function validateEnvironment(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check Firebase configuration
  try {
    // This will throw if any required variables are missing
    const firebaseConfig = env.firebase;
    
    // Additional validation checks
    if (!firebaseConfig.apiKey.startsWith('AIza')) {
      warnings.push('Firebase API key format appears invalid');
    }
    
    if (!firebaseConfig.authDomain.includes('.firebaseapp.com')) {
      warnings.push('Firebase auth domain format appears invalid');
    }
    
    if (!firebaseConfig.storageBucket.includes('.appspot.com') && 
        !firebaseConfig.storageBucket.includes('.firebasestorage.app')) {
      warnings.push('Firebase storage bucket format appears invalid');
    }
    
  } catch (error) {
    if (error instanceof Error) {
      errors.push(error.message);
    }
  }

  // Check Node environment
  if (!['development', 'production', 'test'].includes(env.app.nodeEnv)) {
    warnings.push(`Unexpected NODE_ENV value: ${env.app.nodeEnv}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Logs environment validation results to console
 */
export function logEnvironmentStatus(): void {
  const result = validateEnvironment();
  
  if (result.isValid) {
    console.log('✅ Environment configuration is valid');
    
    if (result.warnings.length > 0) {
      console.warn('⚠️ Environment warnings:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  } else {
    console.error('❌ Environment configuration errors:');
    result.errors.forEach(error => console.error(`  - ${error}`));
    
    if (result.warnings.length > 0) {
      console.warn('⚠️ Additional warnings:');
      result.warnings.forEach(warning => console.warn(`  - ${warning}`));
    }
  }
}

/**
 * Development helper to check environment in browser console
 */
export function debugEnvironment(): void {
  if (env.app.isDevelopment) {
    console.group('🔧 Environment Debug Info');
    console.log('Node Environment:', env.app.nodeEnv);
    console.log('Firebase Project ID:', env.firebase.projectId);
    console.log('Firebase Auth Domain:', env.firebase.authDomain);
    console.log('All required variables present:', validateEnvironment().isValid);
    console.groupEnd();
  }
}