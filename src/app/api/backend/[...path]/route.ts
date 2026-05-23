import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "https://www.autours.net";

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

  req.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  if (req.headers.has("authorization")) {
    headers.set("Authorization", req.headers.get("authorization")!);
  }

  const needsCsrf = req.method !== "GET" && req.method !== "HEAD";

  if (needsCsrf) {
    const csrf = await getCsrfToken();
    headers.set("Cookie", csrf.cookie);
    headers.set("X-XSRF-TOKEN", csrf.token);
  }

  const options: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  if (needsCsrf) {
    try {
      const body = await req.text();
      if (body) options.body = body;
    } catch {
      // no body
    }
  }

  try {
    const response = await fetch(url.toString(), options);

    if (response.status === 419) {
      cachedCsrf = null;
      const csrf = await getCsrfToken();
      headers.set("Cookie", csrf.cookie);
      headers.set("X-XSRF-TOKEN", csrf.token);

      const retryOptions: RequestInit = { ...options, headers };
      const retryResponse = await fetch(url.toString(), retryOptions);
      const data = await retryResponse.text();
      return new NextResponse(data, {
        status: retryResponse.status,
        headers: { "Content-Type": retryResponse.headers.get("content-type") || "application/json" },
      });
    }

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
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
