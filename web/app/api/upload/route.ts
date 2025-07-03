import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    
    // Validate file
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }
    
    // Validate file type
    const allowedTypes = ['.pdf', '.docx', '.txt', '.md'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      return NextResponse.json(
        { 
          error: `Unsupported file type: ${fileExtension}. Allowed types: ${allowedTypes.join(', ')}` 
        },
        { status: 400 }
      );
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }
    
    // Forward to backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    const response = await fetch(`${BACKEND_URL}/api/upload`, {
      method: 'POST',
      body: backendFormData,
      headers: {
        // Forward authorization headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
      },
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || 'Backend upload failed' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Upload API error:', error);
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