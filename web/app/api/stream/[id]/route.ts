import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    
    if (!conversationId) {
      return NextResponse.json(
        { error: 'Conversation ID is required' },
        { status: 400 }
      );
    }
    
    // Create a readable stream that forwards SSE from backend
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Connect to backend SSE endpoint
          const response = await fetch(`${BACKEND_URL}/api/stream/${conversationId}`, {
            headers: {
              'Accept': 'text/event-stream',
              'Cache-Control': 'no-cache',
              // Forward authorization headers if present
              ...(request.headers.get('authorization') && {
                'Authorization': request.headers.get('authorization')!
              }),
            },
          });
          
          if (!response.ok) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: 'Failed to connect to backend'
              })}\n\n`)
            );
            controller.close();
            return;
          }
          
          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({
                type: 'error',
                message: 'No response body'
              })}\n\n`)
            );
            controller.close();
            return;
          }
          
          // Forward chunks from backend
          while (true) {
            const { done, value } = await reader.read();
            
            if (done) {
              break;
            }
            
            controller.enqueue(value);
          }
          
          controller.close();
          
        } catch (error) {
          console.error('SSE stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              message: 'Stream connection failed'
            })}\n\n`)
          );
          controller.close();
        }
      },
      
      cancel() {
        // Clean up when client disconnects
        console.log('SSE stream cancelled');
      }
    });
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });
    
  } catch (error) {
    console.error('Stream API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}