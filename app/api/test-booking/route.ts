import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: "API is working" });
}

export async function POST() {
  try {
    return NextResponse.json({ 
      success: true,
      message: "POST endpoint is working" 
    });
  } catch (error) {
    return NextResponse.json({ 
      error: String(error) 
    }, { status: 500 });
  }
}
