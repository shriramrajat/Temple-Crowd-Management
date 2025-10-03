'use client';

import React from 'react';
import { ErrorHandlingExample } from '@/components/examples/ErrorHandlingExample';

export default function TestErrorHandlingPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Error Handling Test Page</h1>
        <ErrorHandlingExample />
      </div>
    </div>
  );
}