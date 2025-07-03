import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }
    
    // Forward request to backend
    const response = await fetch(`${BACKEND_URL}/api/write`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Backend request failed' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Write API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}