import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://www.autours.net';

async function getCsrf() {
  const res = await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, { method: 'GET' });
  const setCookie = res.headers.get('set-cookie') || '';
  const tokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
  const sessionMatch = setCookie.match(/autours_session=([^;]+)/);
  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
  const parts: string[] = [];
  if (tokenMatch) parts.push(`XSRF-TOKEN=${tokenMatch[1]}`);
  if (sessionMatch) parts.push(`autours_session=${sessionMatch[1]}`);
  return { cookie: parts.join('; '), token };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const csrf = await getCsrf();

    const backendResponse = await fetch(`${BACKEND_URL}/filter/vehicles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cookie': csrf.cookie,
        'X-XSRF-TOKEN': csrf.token,
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json().catch(() => ({}));
    return NextResponse.json(data, { status: backendResponse.status });
  } catch (error: any) {
    console.error('Proxy Filter Error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
