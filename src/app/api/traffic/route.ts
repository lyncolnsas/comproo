import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET(request: Request) {
  let mk;
  try {
    const { searchParams } = new URL(request.url);
    const interfaceName = searchParams.get('interface');
    
    mk = await getMikrotikClient();
    
    if (!interfaceName) {
      const interfaces = await mk.getInterfaces();
      mk.disconnect();
      const ifaces = (interfaces as { id?: string; name: string; type: string }[]).map((i) => ({ id: i.id, name: i.name, type: i.type }));
      return NextResponse.json({ success: true, type: 'interfaces', data: ifaces });
    } else {
      const traffic = await mk.getTraffic(interfaceName);
      mk.disconnect();
      if (traffic && (traffic as unknown[]).length > 0) {
        const t0 = (traffic as Record<string, unknown>[])[0];
        
        // Handle all possible formats: camelCase (default), dashed-case (raw), and snake_case
        const txVal = t0.txBitsPerSecond !== undefined ? t0.txBitsPerSecond : 
                      (t0['tx-bits-per-second'] !== undefined ? t0['tx-bits-per-second'] : 
                      (t0.tx_bits_per_second !== undefined ? t0.tx_bits_per_second : 0));
                      
        const rxVal = t0.rxBitsPerSecond !== undefined ? t0.rxBitsPerSecond : 
                      (t0['rx-bits-per-second'] !== undefined ? t0['rx-bits-per-second'] : 
                      (t0.rx_bits_per_second !== undefined ? t0.rx_bits_per_second : 0));

        return NextResponse.json({ 
          success: true, 
          type: 'traffic', 
          tx: Math.round(Number(txVal)), 
          rx: Math.round(Number(rxVal)) 
        });
      }
      return NextResponse.json({ success: false, message: 'No traffic data' });
    }
  } catch (error) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error as Error);
  }
}
