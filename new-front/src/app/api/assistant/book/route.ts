import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/config/api';

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
    const {
      vehicleId,
      dateFrom,
      dateTo,
      timeFrom = '10:00',
      timeTo = '10:00',
      currency = 'AED',
      pickupLoc,
      fullName,
      phone,
      mobileCode = '+971',
      email,
      country = 'United Arab Emirates',
      gender = 'Mr.',
      customerToken = '',
    } = body;

    if (!vehicleId || !fullName || !phone || !email || !dateFrom || !dateTo) {
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
          body: JSON.stringify({ email: email.trim(), password: tempPassword }),
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
              name: `${gender} ${fullName.trim()}`,
              gender,
              phone: phone.trim(),
              mobile_code: mobileCode,
              country,
              email: email.trim(),
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
      id: vehicleId,
      date_from: dateFrom,
      date_to: dateTo,
      time_from: timeFrom,
      time_to: timeTo,
      currency,
      name: `${gender} ${fullName.trim()}`,
      phone: `${mobileCode}${phone.trim()}`,
      email: email.trim(),
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

    const bookingRes = await fetch(`${BACKEND_URL}/api/book/vehicles`, {
      method: 'POST',
      headers,
      body: JSON.stringify(bookingPayload),
    });

    const bookingData = await bookingRes.json().catch(() => ({}));

    if (!bookingRes.ok) {
      return NextResponse.json(
        { success: false, message: bookingData.message || 'فشل في تسجيل الحجز بالسيرفر' },
        { status: bookingRes.status }
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
        customerName: fullName,
        phone: `${mobileCode} ${phone}`,
        email,
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
