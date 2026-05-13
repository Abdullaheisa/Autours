import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function HEAD(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

async function handleProxy(req: NextRequest, pathArray: string[]) {
  const path = pathArray.join("/");
  const url = new URL(`https://www.autours.net/api/external/${path}`);
  
  // Forward query parameters
  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  // Copy all safe headers
  req.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();
    // Block Origin, Referer, Host so Sanctum treats this as a stateless API request
    if (!['host', 'origin', 'referer', 'cookie'].includes(lowerKey)) {
      headers.set(key, value);
    }
  });
  
  // If we have Authorization header, pass it explicitly
  if (req.headers.has('authorization')) {
    headers.set('authorization', req.headers.get('authorization') as string);
  }

  const options: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const body = await req.text();
    options.body = body;
  }

  try {
    const response = await fetch(url.toString(), options);
    
    // We get the response back and forward it to the client
    const data = await response.text();
    
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new NextResponse(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return NextResponse.json({ error: "Proxy server error", details: error.message }, { status: 500 });
  }
}
