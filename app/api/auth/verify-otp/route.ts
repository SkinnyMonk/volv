import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { loginId, otp, referenceToken } = await request.json();

    if (!loginId || !otp || !referenceToken) {
      return NextResponse.json(
        { error: 'Missing required fields: loginId, otp, referenceToken' },
        { status: 400 }
      );
    }

    const response = await fetch('https://zyro.basanonline.com/api/v4/user/login/otp', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Content-Type': 'application/json',
        'Pragma': 'no-cache',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'same-origin',
        'Sec-GPC': '1',
        'x-device-type': 'web',
      },
      body: JSON.stringify({
        reference_token: referenceToken,
        otp: otp,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('OTP verification error:', error);
    return NextResponse.json(
      { error: 'OTP verification failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
