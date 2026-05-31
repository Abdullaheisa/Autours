import { NextRequest, NextResponse } from "next/server";

import { BACKEND_URL } from "@/config/api";

let cachedCsrf: { cookie: string; token: string; expiry: number } | null = null;

async function getCsrfToken(): Promise<{ cookie: string; token: string }> {
  if (cachedCsrf && Date.now() < cachedCsrf.expiry) {
    return { cookie: cachedCsrf.cookie, token: cachedCsrf.token };
  }

  const res = await fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, { method: "GET" });
  const setCookie = res.headers.get("set-cookie") || "";

  const tokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
  const sessionMatch = setCookie.match(/autours_session=([^;]+)/);

  const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : "";
  const cookieParts: string[] = [];
  if (tokenMatch) cookieParts.push(`XSRF-TOKEN=${tokenMatch[1]}`);
  if (sessionMatch) cookieParts.push(`autours_session=${sessionMatch[1]}`);

  const cookieStr = cookieParts.join("; ");

  cachedCsrf = { cookie: cookieStr, token, expiry: Date.now() + 7200_000 };
  return { cookie: cookieStr, token };
}

async function handleProxy(req: NextRequest, pathArray: string[]) {
  const path = pathArray.join("/");
  const url = new URL(`${BACKEND_URL}/${path}`);
  const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(req.method);
  const contentType = req.headers.get("content-type");

  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  
  // Forward all incoming client headers to the backend (except the Host header to prevent loops)
  req.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  // Ensure Accept is application/json
  headers.set('Accept', 'application/json');

  // Fallback for Content-Type if missing
  if (!headers.has('content-type')) {
    headers.set('Content-Type', 'application/json');
  }

  // 1. Get browser's incoming cookies
  const clientCookie = req.headers.get("Cookie") || "";
  console.log(`[Proxy Request] ${req.method} ${path}`);
  console.log(`Incoming Client Cookie:`, clientCookie);

  if (needsCsrf) {
    if (clientCookie) {
      headers.set("Cookie", clientCookie);
      const clientXsrf = clientCookie.match(/XSRF-TOKEN=([^;]+)/);
      if (clientXsrf) {
        headers.set("X-XSRF-TOKEN", decodeURIComponent(clientXsrf[1]));
        console.log(`Using client-provided CSRF & Session`);
      } else {
        const csrf = await getCsrfToken();
        headers.set("X-XSRF-TOKEN", csrf.token);
        console.log(`Client had cookies but no XSRF-TOKEN. Fetched guest token.`);
      }
    } else {
      const csrf = await getCsrfToken();
      headers.set("Cookie", csrf.cookie);
      headers.set("X-XSRF-TOKEN", csrf.token);
      console.log(`First-time visitor. Fetching and using guest CSRF`);
    }
  } else {
    if (clientCookie) {
      headers.set("Cookie", clientCookie);
    }
  }

  const options: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
    duplex: "half",
  } as any;

  if (needsCsrf) {
    try {
      // If it's multipart/form-data, pass the raw stream to preserve boundaries and files
      if (contentType && contentType.includes("multipart/form-data")) {
         options.body = req.body;
         // We must keep the original Content-Type header because it contains the boundary!
      } else {
         const body = await req.text();
         if (body) options.body = body;
      }
    } catch {
      // no body
    }
  }

  try {
    let response = await fetch(url.toString(), options);
    console.log(`[Proxy Response] Backend returned status ${response.status} for ${path}`);

    if (response.status === 419) {
      cachedCsrf = null;
      console.log(`CSRF token expired. Fetching new one...`);
      const csrf = await getCsrfToken();
      const mergedCookies = [csrf.cookie];
      if (clientCookie) mergedCookies.push(clientCookie);
      headers.set("Cookie", mergedCookies.join("; "));
      headers.set("X-XSRF-TOKEN", csrf.token);

      const retryOptions: RequestInit = { ...options, headers };
      response = await fetch(url.toString(), retryOptions);
      console.log(`[Proxy Response Retry] Backend returned status ${response.status} for ${path}`);
    }

    const resHeaders = new Headers();
    response.headers.forEach((value, key) => {
      if (!['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'].includes(key.toLowerCase())) {
        resHeaders.set(key, value);
      }
    });

    // Forward Set-Cookie header(s) from the backend response back to the client browser
    if (response.headers.has("set-cookie")) {
      const setCookies = (response.headers as any).getSetCookie 
        ? (response.headers as any).getSetCookie() 
        : response.headers.get("set-cookie");
      
      console.log(`Backend returned Set-Cookie:`, setCookies);

      const cleanCookie = (cookieStr: string): string => {
        // Strip domain attribute so the browser saves it as a host-only cookie for the current domain
        let cleaned = cookieStr.replace(/domain=[^;]+;?\s*/i, "");
        // Strip secure flag if not running on HTTPS so local dev browsers accept it
        cleaned = cleaned.replace(/secure;?\s*/i, "");
        return cleaned;
      };

      if (Array.isArray(setCookies)) {
        setCookies.forEach((cookieStr) => {
          resHeaders.append("Set-Cookie", cleanCookie(cookieStr));
        });
      } else if (setCookies) {
        resHeaders.set("Set-Cookie", cleanCookie(setCookies));
      }
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: resHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Backend proxy error:", message);
    return NextResponse.json({ error: "Backend proxy error", details: message }, { status: 502 });
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  return handleProxy(req, path);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
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
