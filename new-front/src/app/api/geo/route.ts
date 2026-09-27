import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Regex validation for IPv4 and IPv6 to avoid SSRF or injection
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/i;

function isPrivateIp(ip: string): boolean {
  if (!ip) return true;
  if (ip === '127.0.0.1' || ip === '::1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (ip.startsWith('169.254.')) return true; // Link-local
  if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(ip)) return true;
  if (ip.startsWith('fc00:') || ip.startsWith('fe80:')) return true;
  return false;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Cloudflare IP Country Header (instant, 0ms)
    const cfCountry = request.headers.get('cf-ipcountry');
    if (cfCountry && cfCountry.length === 2 && /^[A-Za-z]{2}$/.test(cfCountry) && cfCountry !== 'XX' && cfCountry !== 'T1') {
      return NextResponse.json({
        countryCode: cfCountry.toUpperCase(),
        source: 'cloudflare',
      });
    }

    // 2. Custom header if set by upstream Nginx / GeoIP
    const xCountry = request.headers.get('x-country-code');
    if (xCountry && xCountry.length === 2 && /^[A-Za-z]{2}$/.test(xCountry)) {
      return NextResponse.json({
        countryCode: xCountry.toUpperCase(),
        source: 'header',
      });
    }

    // 3. Extract Client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    let clientIp = (forwardedFor ? forwardedFor.split(',')[0].trim() : realIp) || '';

    // Validate IP format
    if (clientIp && !isPrivateIp(clientIp) && (IPV4_REGEX.test(clientIp) || IPV6_REGEX.test(clientIp))) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1200);

      try {
        const res = await fetch(`https://api.country.is/${clientIp}`, {
          signal: controller.signal,
          headers: { Accept: 'application/json' },
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data?.country && typeof data.country === 'string' && /^[A-Za-z]{2}$/.test(data.country)) {
            return NextResponse.json({
              countryCode: data.country.toUpperCase(),
              source: 'country.is',
            });
          }
        }
      } catch {
        clearTimeout(timeoutId);
      }
    }

    return NextResponse.json({ countryCode: null });
  } catch (error) {
    // Return gracefully without exposing server internals
    return NextResponse.json({ countryCode: null }, { status: 200 });
  }
}
