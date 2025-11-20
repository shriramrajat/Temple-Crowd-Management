/**
 * Token API Endpoint
 * 
 * Returns an authentication token for the current session.
 * Used for WebSocket/SSE authentication.
 * 
 * Requirements: 6.3
 */

import { NextResponse } from 'next/server';
import { getAuthToken } from '@/lib/auth/session';

export async function GET() {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      token,
    });
  } catch (error) {
    console.error('Token generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
