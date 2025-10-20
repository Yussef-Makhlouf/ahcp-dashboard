import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// GET /api/holding-codes - Get all holding codes with filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const village = searchParams.get('village');
    const active = searchParams.get('active');
    
    // Build query parameters
    const params = new URLSearchParams();
    if (village) params.append('village', village);
    if (active) params.append('active', active);
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/api/holding-codes?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Holding codes GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error fetching holding codes',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/holding-codes - Create new holding code
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    
    const response = await fetch(`${BACKEND_URL}/api/holding-codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { 'Authorization': authHeader }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Holding codes POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error creating holding code',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
