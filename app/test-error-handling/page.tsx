'use client';

/**
 * Error Handling Test Page
 * Demonstrates the new error handling system
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFormError } from '@/hooks/use-form-error';
import { FieldError, GeneralError, FormErrorsSummary } from '@/components/ui/form-error';
import { fetchWithRetry, handleErrorWithRetry, showSuccess } from '@/lib/utils/client-error-handler';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

export default function TestErrorHandlingPage() {
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const {
    fieldErrors,
    generalError,
    handleAPIError,
    getFieldError,
    clearFieldError,
    clearAllErrors,
  } = useFormError();

  // Test 1: Validation Error
  const testValidationError = async () => {
    setLoading(true);
    clearAllErrors();
    setTestResult('');
    
    try {
      await fetchWithRetry('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'invalid-email',
          password: '123', // Too short
        }),
      });
    } catch (error) {
      handleAPIError(error);
      setTestResult('✅ Validation error caught and displayed');
    } finally {
      setLoading(false);
    }
  };

  // Test 2: Authentication Error
  const testAuthError = async () => {
    setLoading(true);
    clearAllErrors();
    setTestResult('');
    
    try {
      await fetchWithRetry('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'wrongpassword',
          userType: 'pilgrim',
        }),
      });
    } catch (error) {
      handleAPIError(error);
      setTestResult('✅ Authentication error caught and displayed');
    } finally {
      setLoading(false);
    }
  };

  // Test 3: Missing Required Field
  const testMissingField = async () => {
    setLoading(true);
    clearAllErrors();
    setTestResult('');
    
    try {
      await fetchWithRetry('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          // Missing password and userType
        }),
      });
    } catch (error) {
      handleAPIError(error);
      setTestResult('✅ Missing field error caught and displayed');
    } finally {
      setLoading(false);
    }
  };

  // Test 4: Network Error with Retry
  const testNetworkError = async () => {
    setLoading(true);
    clearAllErrors();
    setTestResult('');
    
    try {
      await fetchWithRetry('/api/nonexistent-endpoint', {
        method: 'GET',
      });
    } catch (error) {
      handleErrorWithRetry(
        error,
        () => testNetworkError(),
        'Failed to fetch data'
      );
      setTestResult('✅ Network error with retry button displayed');
    } finally {
      setLoading(false);
    }
  };

  // Test 5: Success Message
  const testSuccessMessage = () => {
    clearAllErrors();
    setTestResult('');
    showSuccess('Operation completed successfully!', 'This is a success message');
    setTestResult('✅ Success message displayed');
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Error Handling Test Page</h1>
        <p className="text-muted-foreground">
          Test the new comprehensive error handling system
        </p>
      </div>

      {/* Error Display Area */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Error Display</CardTitle>
          <CardDescription>
            Errors from tests will appear here
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <GeneralError error={generalError} />
          <FormErrorsSummary
            fieldErrors={fieldErrors}
            generalError={generalError}
          />
          {testResult && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800">{testResult}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test 1: Validation Error</CardTitle>
            <CardDescription>
              Tests field-specific validation errors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testValidationError}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Validation Error'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test 2: Auth Error</CardTitle>
            <CardDescription>
              Tests authentication error handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testAuthError}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Auth Error'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test 3: Missing Field</CardTitle>
            <CardDescription>
              Tests missing required field error
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testMissingField}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Missing Field'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test 4: Network Error</CardTitle>
            <CardDescription>
              Tests network error with retry option
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testNetworkError}
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                'Test Network Error'
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test 5: Success Message</CardTitle>
            <CardDescription>
              Tests success notification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testSuccessMessage}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              Test Success Message
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Form Example */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Form with Field Errors</CardTitle>
          <CardDescription>
            Example form showing field-specific error display
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <div>
              <Label htmlFor="test-email">Email</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="test@example.com"
                onChange={() => clearFieldError('email')}
              />
              <FieldError error={getFieldError('email')} />
            </div>

            <div>
              <Label htmlFor="test-password">Password</Label>
              <Input
                id="test-password"
                type="password"
                placeholder="Enter password"
                onChange={() => clearFieldError('password')}
              />
              <FieldError error={getFieldError('password')} />
            </div>

            <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">How it works:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Click any test button above</li>
                  <li>Field-specific errors appear below each field</li>
                  <li>General errors appear at the top</li>
                  <li>Errors clear when you type in the field</li>
                </ul>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="mt-8 bg-muted">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium mb-2">Documentation</p>
              <p className="text-sm text-muted-foreground mb-2">
                For more information about the error handling system, see:
              </p>
              <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                <li>docs/ERROR_HANDLING_GUIDE.md</li>
                <li>docs/ERROR_HANDLING_QUICK_REFERENCE.md</li>
                <li>docs/TASK_10_IMPLEMENTATION_SUMMARY.md</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
