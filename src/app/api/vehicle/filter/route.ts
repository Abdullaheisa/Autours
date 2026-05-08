import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let cookieHeader = request.headers.get('cookie') || '';
    let xsrfToken = '';
    let newSetCookie = '';

    // If no session exists, fetch CSRF token from backend
    if (!cookieHeader.includes('XSRF-TOKEN')) {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const csrfRes = await fetch(`${BASE_URL}/sanctum/csrf-cookie`, { method: 'GET' });
    const setCookie = csrfRes.headers.get('set-cookie');
    if (setCookie) {
      newSetCookie = setCookie.replace(/Domain=[^;]+;?/gi, '');
      cookieHeader = setCookie.split(', ').map((c: string) => c.split(';')[0]).join('; ');
      const match = setCookie.match(/XSRF-TOKEN=([^;]+)/);
      if (match) xsrfToken = decodeURIComponent(match[1]);
    }
  } else {
    const match = cookieHeader.match(/XSRF-TOKEN=([^;]+)/);
    if (match) xsrfToken = decodeURIComponent(match[1]);
  }

  console.log('--- FILTER PROXY PAYLOAD ---');
  console.log(JSON.stringify(body, null, 2));

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const backendResponse = await fetch(`${BASE_URL}/filter/vehicles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cookie': cookieHeader,
      'X-XSRF-TOKEN': xsrfToken,
    },
    body: JSON.stringify(body),
  });
    let data;
    const contentType = backendResponse.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      data = await backendResponse.json().catch(() => ({}));
      console.log('--- BACKEND FILTER DATA ---');
      console.log(JSON.stringify(data, null, 2));
    } else {
      data = { message: 'Success', _raw: await backendResponse.text() };
    }

    const response = NextResponse.json(data, {
      status: backendResponse.status,
    });

    if (newSetCookie) {
      response.headers.set('Set-Cookie', newSetCookie);
    } else {
      const backendSetCookie = backendResponse.headers.get('set-cookie');
      if (backendSetCookie) {
        response.headers.set('Set-Cookie', backendSetCookie.replace(/Domain=[^;]+;?/gi, ''));
      }
    }

    return response;
  } catch (error: any) {
    console.error('Proxy Filter Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
