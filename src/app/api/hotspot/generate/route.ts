import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { prisma } from '@/lib/prisma';

function generateRandomString(length: number, charset: string) {
  let result = '';
  const charactersLength = charset.length;
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export async function POST(request: Request) {
  let mk;
  try {
    const { qty, server, mode, userLen, prefix, charset, profile, comment, price } = await request.json();
    
    const quantity = parseInt(qty);
    const length = parseInt(userLen);
    const numPrice = parseFloat(price) || 0;

    if (isNaN(quantity) || isNaN(length) || quantity <= 0) {
      return NextResponse.json({ success: false, message: 'Invalid quantity or length' }, { status: 400 });
    }

    let charSetString = 'abcdefghijklmnopqrstuvwxyz0123456789';
    if (charset === 'num') charSetString = '0123456789';
    else if (charset === 'upp') charSetString = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    else if (charset === 'low') charSetString = 'abcdefghijklmnopqrstuvwxyz';
    else if (charset === 'mix') charSetString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    mk = await getMikrotikClient();

    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const formattedDate = `${mm}.${dd}.${yy}`;
    const rand3 = Math.floor(Math.random() * 900) + 100;
    
    // Format: [mode]-[random3]-[MM.DD.YY]-[customComment]
    const cleanComment = (comment || '').replace(/\s+/g, '_');
    const batchComment = `${mode}-${rand3}-${formattedDate}-${cleanComment}`;

    const createdUsers = [];

    for (let i = 0; i < quantity; i++) {
      const uName = (prefix || '') + generateRandomString(length, charSetString);
      let uPass = uName; // mode vc (Voucher) = user and pass equal

      if (mode === 'up') { // mode up (User/Pass) = user and pass different
        uPass = generateRandomString(length, charSetString);
      }

      const userData: any = {
        name: uName,
        password: uPass,
        profile: profile,
        comment: batchComment
      };

      if (server !== 'all') {
        userData.server = server;
      }

      try {
        await mk.addHotspotUser(userData);
        createdUsers.push({ name: uName, pass: uPass });
      } catch (err: any) {
        console.error('Error adding user:', err.message);
      }
    }

    mk.disconnect();

    // Store vouchers in Prisma database
    if (createdUsers.length > 0) {
      try {
        await prisma.voucher.createMany({
          data: createdUsers.map(u => ({
            code: u.name,
            profile: profile,
            price: numPrice > 0 ? numPrice : null
          }))
        });
      } catch (dbError) {
        console.error('Failed to save vouchers to local DB:', dbError);
      }
    }

    return NextResponse.json({ success: true, count: createdUsers.length, users: createdUsers });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
