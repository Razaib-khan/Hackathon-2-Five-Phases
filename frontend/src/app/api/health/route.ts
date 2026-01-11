import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Simple health check - just return healthy status
    return NextResponse.json({
      status: 'healthy',
      service: 'frontend-app',
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      service: 'frontend-app',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}