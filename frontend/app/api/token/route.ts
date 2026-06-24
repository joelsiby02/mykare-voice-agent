import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const room = searchParams.get('room');
  const identity = searchParams.get('identity');

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8082';
  const url = `${backendUrl}/api/token?room=${room}&identity=${identity}`;

  const response = await fetch(url);
  const data = await response.json();

  return NextResponse.json(data, { status: response.status });
}