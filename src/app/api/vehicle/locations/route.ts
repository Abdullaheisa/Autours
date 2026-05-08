import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const backendResponse = await fetch(`${BASE_URL}/get/locations`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Proxy Locations Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
