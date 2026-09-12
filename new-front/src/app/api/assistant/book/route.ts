import { NextResponse } from 'next/server';
import { BACKEND_URL, CANDIDATE_BACKEND_URLS } from '@/config/api';

async function getCsrf() {
  const candidateUrls = Array.from(new Set([
    `${BACKEND_URL}/sanctum/csrf-cookie`,
    'https://www.autours.net/sanctum/csrf-cookie',
    'https://autours.net/sanctum/csrf-cookie',
    ...CANDIDATE_BACKEND_URLS.map((b) => `${b}/sanctum/csrf-cookie`),
    'http://127.0.0.1:8000/sanctum/csrf-cookie',
    'http://localhost:8000/sanctum/csrf-cookie',
  ]));

  for (const url of candidateUrls) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const setCookie = res.headers.get('set-cookie') || '';
        const tokenMatch = setCookie.match(/XSRF-TOKEN=([^;]+)/);
        const sessionMatch = setCookie.match(/autours_session=([^;]+)/);
        const token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : '';
        const parts: string[] = [];
        if (tokenMatch) parts.push(`XSRF-TOKEN=${tokenMatch[1]}`);
        if (sessionMatch) parts.push(`autours_session=${sessionMatch[1]}`);
        return { cookie: parts.join('; '), token };
      }
    } catch {
      // try next
    }
  }

  return { cookie: '', token: '' };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      vehicleId,
      dateFrom,
      dateTo,
      timeFrom = '10:00',
      timeTo = '10:00',
      currency = 'AED',
      pickupLoc = 'Dubai',
      fullName = '',
      phone = '',
      mobileCode = '+971',
      email = '',
      country = 'United Arab Emirates',
      gender = 'Mr.',
      customerToken = '',
    } = body;

    const cleanName = (fullName || '').replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u200E\u200F]/g, '').trim();
    const cleanPhone = (phone || '').replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u200E\u200F]/g, '').trim();
    const cleanEmail = (email || '').replace(/[\u200B-\u200D\uFEFF\u202A-\u202E\u200E\u200F]/g, '').trim();

    if (!vehicleId || !cleanName || !cleanPhone || !cleanEmail || !dateFrom || !dateTo) {
      return NextResponse.json(
        { message: 'يرجى إكمال جميع بيانات الحجز المطلوبة' },
        { status: 400 }
      );
    }

    const csrf = await getCsrf();
    let token = customerToken;
    const tempPassword = 'AutoursUser2026!';

    // If no existing customer token provided, attempt login or register
    if (!token) {
      try {
        const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Cookie: csrf.cookie,
            'X-XSRF-TOKEN': csrf.token,
          },
          body: JSON.stringify({ email: cleanEmail, password: tempPassword }),
        });

        if (loginRes.ok) {
          const loginData = await loginRes.json();
          token = loginData.token || '';
        } else {
          // Register new customer account
          const regRes = await fetch(`${BACKEND_URL}/post/user/data`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Cookie: csrf.cookie,
              'X-XSRF-TOKEN': csrf.token,
            },
            body: JSON.stringify({
              name: `${gender} ${cleanName}`,
              gender,
              phone: cleanPhone,
              mobile_code: mobileCode,
              country,
              email: cleanEmail,
              password: tempPassword,
              user_type: 'customer',
              supplier: 0,
            }),
          });

          if (regRes.ok) {
            const regData = await regRes.json();
            token = regData.token || '';
          }
        }
      } catch (authErr) {
        console.warn('Auth attempt error:', authErr);
      }
    }

    // Submit booking to backend
    const bookingPayload = {
      id: Number(vehicleId),
      pickupLoc: pickupLoc || 'Dubai',
      date_from: dateFrom,
      date_to: dateTo,
      time_from: timeFrom,
      time_to: timeTo,
      currency,
      name: `${gender} ${cleanName}`,
      phone: `${mobileCode}${cleanPhone}`,
      email: cleanEmail,
      country,
      driver_age: 28,
      residence_country: country,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Cookie: csrf.cookie,
      'X-XSRF-TOKEN': csrf.token,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    let bookingRes: any = null;
    let bookingData: any = {};

    const bookingUrls = Array.from(new Set([
      `${BACKEND_URL}/api/book/vehicles`,
      `${BACKEND_URL}/book/vehicles`,
      'https://www.autours.net/api/book/vehicles',
      'https://www.autours.net/api/backend/book/vehicles',
      'http://127.0.0.1:8000/api/book/vehicles',
      'http://localhost:8000/api/book/vehicles',
    ]));

    for (const bUrl of bookingUrls) {
      try {
        const res = await fetch(bUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(bookingPayload),
        });
        if (res.ok) {
          bookingRes = res;
          bookingData = await res.json().catch(() => ({}));
          break;
        } else {
          bookingRes = res;
          bookingData = await res.json().catch(() => ({}));
        }
      } catch {
        // try next
      }
    }

    if (!bookingRes || !bookingRes.ok) {
      return NextResponse.json(
        { success: false, message: bookingData?.message || 'فشل في تسجيل الحجز بالسيرفر' },
        { status: bookingRes?.status || 500 }
      );
    }

    // Generate or extract order number
    const orderNumber =
      bookingData.order_number ||
      bookingData.data?.order_number ||
      `ATR-${Math.floor(100000 + Math.random() * 900000)}`;

    return NextResponse.json({
      success: true,
      orderNumber,
      token,
      message: 'تم تأكيد حجزك بنجاح!',
      booking: {
        orderNumber,
        dateFrom,
        dateTo,
        timeFrom,
        timeTo,
        pickupLoc,
        customerName: cleanName,
        phone: `${mobileCode} ${cleanPhone}`,
        email: cleanEmail,
        currency,
      },
    });
  } catch (error: any) {
    console.error('In-chat booking error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'فشل في إتمام الحجز' },
      { status: 500 }
    );
  }
}
