import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { loginId, pin, twoFAToken, questionId } = await request.json();

    if (!loginId || !pin || !twoFAToken || questionId === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: loginId, pin, twoFAToken, questionId' },
        { status: 400 }
      );
    }

    const response = await fetch('https://zyro.basanonline.com/api/v4/user/twofa', {
      method: 'POST',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-GB,en-US;q=0.9,en;q=0.8',
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
        login_id: loginId,
        twofa: [
          {
            question_id: questionId,
            answer: pin,
          },
        ],
        twofa_token: twoFAToken,
        type: 'PIN',
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { error: '2FA verification failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
