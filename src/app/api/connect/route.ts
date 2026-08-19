import { NextResponse } from 'next/server';
import { MikrotikAPI } from '@/lib/routeros';
import { encryptData } from '@/lib/jwt';

export async function POST(request: Request) {
  try {
    const { ip, user, pass } = await request.json();

    const mk = new MikrotikAPI();
    const connected = await mk.connect(ip, user, pass);

    if (connected) {
      const identity = await mk.getIdentity();
      mk.disconnect();

      const jweToken = await encryptData({ ip, user, pass });
      
      const response = NextResponse.json({ success: true, identity });
      
      response.cookies.set({
        name: 'mikro_session',
        value: jweToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 8 * 60 * 60, // 8 hours
        path: '/',
      });

      return response;
    }

    return NextResponse.json({ success: false, message: 'Invalid credentials or host unreachable' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
