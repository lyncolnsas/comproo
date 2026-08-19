export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import dgram from 'dgram';

export async function GET(): Promise<NextResponse> {
  return new Promise<NextResponse>((resolve) => {
    let server: dgram.Socket;
    
    try {
      server = dgram.createSocket('udp4');
    } catch (e: any) {
      return resolve(NextResponse.json({ success: false, routers: [], error: e.message }, { status: 500 }));
    }

    const routers = new Map<string, any>();
    
    // Parse MNDP payload
    const parseMNDP = (msg: Buffer, rinfo: dgram.RemoteInfo) => {
      // Header is 4 bytes, Sequence is 2 bytes
      if (msg.length < 6) return;
      
      let offset = 6;
      const info: any = { ipAddress: rinfo.address, macAddress: '', platform: 'MikroTik' };
      
      while (offset < msg.length) {
        const type = msg.readUInt16BE(offset);
        const length = msg.readUInt16BE(offset + 2);
        offset += 4;
        
        if (offset + length > msg.length) break;
        
        const value = msg.slice(offset, offset + length);
        offset += length;
        
        switch (type) {
          case 1: // MAC
            if (length === 6) {
              info.macAddress = Array.from(value).map(b => b.toString(16).padStart(2, '0')).join(':').toUpperCase();
            }
            break;
          case 5: // Identity
            info.identity = value.toString('utf8');
            break;
          case 7: // Version
            info.version = value.toString('utf8');
            break;
          case 8: // Platform
            info.platform = value.toString('utf8');
            break;
          case 12: // Board
            info.board = value.toString('utf8');
            break;
          case 14: // IPv4
            if (length === 4) {
               info.ipAddress = `${value[0]}.${value[1]}.${value[2]}.${value[3]}`;
            }
            break;
          case 17: // Interface Name
             info.interfaceName = value.toString('utf8');
             break;
        }
      }
      
      if (info.macAddress) {
        // Update if already exists to get best info
        routers.set(info.macAddress, info);
      }
    };

    server.on('message', (msg, rinfo) => {
      try {
        parseMNDP(msg, rinfo);
      } catch (e) {
        // ignore
      }
    });
    
    server.on('error', (err) => {
      console.error('MNDP Server error:\n' + err.stack);
      try { server.close(); } catch {}
      resolve(NextResponse.json({ success: false, routers: [], error: err.message }, { status: 500 }));
    });

    try {
      server.bind(() => {
        try {
          server.setBroadcast(true);
          // Send MNDP discovery packet (4 zeros)
          const message = Buffer.from([0x00, 0x00, 0x00, 0x00]);
          server.send(message, 0, message.length, 5678, '255.255.255.255');
        } catch (e) {
          console.error("Failed to set broadcast or send", e);
        }
        
        // Wait 3 seconds for responses
        setTimeout(() => {
          try { server.close(); } catch {}
          resolve(NextResponse.json({ 
            success: true, 
            routers: Array.from(routers.values()) 
          }));
        }, 3000);
      });
    } catch (e: any) {
      resolve(NextResponse.json({ success: false, routers: [], error: e.message }, { status: 500 }));
    }
  });
}
