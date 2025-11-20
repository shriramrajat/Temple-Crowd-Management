/**
 * Form Error Display Components
 * Reusable components for displaying form errors
 * Requirement 10.3 - Field-specific validation error display in forms
 */

import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Field error props
 */
interface FieldErrorProps {
  error?: string;
  id?: string;
}

/**
 * Display error message for a specific field
 */
export function FieldError({ error, id }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      id={id}
      className="text-sm text-red-600 mt-1"
      role="alert"
      aria-live="polite"
    >
      {error}
    </p>
  );
}

/**
 * General error props
 */
interface GeneralErrorProps {
  error?: string | null;
  className?: string;
}

/**
 * Display general error message
 */
export function GeneralError({ error, className }: GeneralErrorProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}

/**
 * Form errors summary props
 */
interface FormErrorsSummaryProps {
  fieldErrors: Record<string, string>;
  generalError?: string | null;
  className?: string;
}

/**
 * Display summary of all form errors
 */
export function FormErrorsSummary({
  fieldErrors,
  generalError,
  className,
}: FormErrorsSummaryProps) {
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;
  const hasErrors = hasFieldErrors || generalError;

  if (!hasErrors) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>
        {generalError && <p className="font-medium mb-2">{generalError}</p>}
        {hasFieldErrors && (
          <ul className="list-disc list-inside space-y-1">
            {Object.entries(fieldErrors).map(([field, error]) => {
              const fieldName = field.split('.').pop() || field;
              const capitalizedField = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
              return (
                <li key={field}>
                  <span className="font-medium">{capitalizedField}:</span> {error}
                </li>
              );
            })}
          </ul>
        )}
      </AlertDescription>
    </Alert>
  );
}
