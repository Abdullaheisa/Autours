import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://www.autours.net';

export async function GET() {
  try {
    const response = await fetch(`${BACKEND_URL}/get/locations`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Proxy Locations Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
