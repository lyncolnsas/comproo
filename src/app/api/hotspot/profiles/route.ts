import { NextResponse } from 'next/server';
import { getMikrotikClient } from '@/lib/session';
import { routerErrorResponse } from '@/lib/api-error';

export async function GET() {
  let mk;
  try {
    mk = await getMikrotikClient();
    
    const profiles = await mk.getHotspotProfiles();
    const servers = await mk.getHotspotServers();
    const pools = await mk.getIpPools();
    const queues = await mk.getSimpleQueues();

    mk.disconnect();

    return NextResponse.json({
      success: true,
      data: {
        profiles: profiles.map((p: any) => ({
          name: p.name,
          id: p.id,
          'shared-users': p['shared-users'],
          'rate-limit': p['rate-limit'],
          'address-pool': p['address-pool']
        })),
        servers: servers.map((s: any) => ({ name: s.name, id: s.id })),
        pools: pools.map((p: any) => p.name),
        queues: queues.map((q: any) => q.name)
      }
    });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return routerErrorResponse(error);
  }
}

export async function POST(request: Request) {
  let mk;
  try {
    const data = await request.json();
    const {
      name,
      sharedUsers,
      rateLimit,
      expmode,
      validity,
      graceperiod,
      price,
      sprice,
      lockunlock,
      ppool,
      parent
    } = data;

    if (!name) {
      return NextResponse.json({ success: false, message: 'O nome do plano é obrigatório.' }, { status: 400 });
    }

    const profileName = name.replace(/\s+/g, '-');
    const numPrice = parseFloat(price) || 0;
    const numSPrice = parseFloat(sprice) || 0;
    const isLock = lockunlock === 'Enable';
    const lockScript = isLock ? '; [:local mac $"mac-address"; /ip hotspot user set mac-address=$mac [find where name=$user]]' : '';

    // Record sales directly on MikroTik scripts (Mikhmon format)
    let recordScript = '';
    if (expmode === 'remc' || expmode === 'ntfc') {
      recordScript = `; :local mac $"mac-address"; :local time [/system clock get time ]; /system script add name="$date-|-$time-|-$user-|-` + numPrice + `-|-$address-|-$mac-|-` + validity + `-|-` + profileName + `-|-$comment" owner="$month$year" source="$date" comment="mikhmon"`;
    }

    // Compile dynamic on-login script
    let onLoginScript = '';
    let modeCmd = 'remove';

    if (expmode && expmode !== '0') {
      onLoginScript = `:put (",` + expmode + `,` + numPrice + `,` + validity + `,` + numSPrice + `,,` + lockunlock + `,"); {:local comment [ /ip hotspot user get [/ip hotspot user find where name="$user"] comment]; :local ucode [:pic $comment 0 2]; :if ($ucode = "vc" or $ucode = "up" or $comment = "") do={ :local date [ /system clock get date ];:local year [ :pick $date 7 11 ];:local month [ :pick $date 0 3 ]; /sys sch add name="$user" disable=no start-date=$date interval="` + validity + `"; :delay 5s; :local exp [ /sys sch get [ /sys sch find where name="$user" ] next-run]; :local getxp [len $exp]; :if ($getxp = 15) do={ :local d [:pic $exp 0 6]; :local t [:pic $exp 7 16]; :local s ("/"); :local exp ("$d$s$year $t"); /ip hotspot user set comment="$exp" [find where name="$user"];}; :if ($getxp = 8) do={ /ip hotspot user set comment="$date $exp" [find where name="$user"];}; :if ($getxp > 15) do={ /ip hotspot user set comment="$exp" [find where name="$user"];};:delay 5s; /sys sch remove [find where name="$user"]`;
      
      onLoginScript += recordScript + lockScript + '}}';
      
      if (expmode === 'ntf' || expmode === 'ntfc') {
        modeCmd = 'set limit-uptime=1s';
      }
    } else if (numPrice > 0) {
      onLoginScript = `:put (",,` + numPrice + `,,,noexp,` + lockunlock + `,")` + lockScript;
    } else if (isLock) {
      onLoginScript = lockScript.substring(2); // remove leading '; '
    }

    mk = await getMikrotikClient();

    // Check if profile already exists (upsert logic)
    const existingProfiles = await mk.getHotspotProfiles();
    const foundProfile = existingProfiles.find((p: any) => p.name === profileName);

    const profileParams: any = {
      name: profileName,
      'shared-users': sharedUsers || '1',
      'rate-limit': rateLimit || '',
      'address-pool': ppool === 'none' ? 'none' : ppool,
      'parent-queue': parent === 'none' ? 'none' : parent,
      'on-login': onLoginScript,
      'status-autorefresh': '1m'
    };

    if (foundProfile) {
      await mk.updateHotspotProfile(profileParams, foundProfile.id);
    } else {
      await mk.addHotspotProfile(profileParams);
    }

    // Configure Background Expiry Scheduler
    const randStart = `0${Math.floor(Math.random() * 5) + 1}:${Math.floor(Math.random() * 50) + 10}:${Math.floor(Math.random() * 50) + 10}`;
    const randInterval = `00:02:${Math.floor(Math.random() * 50) + 10}`;
    const bgServiceScript = `:local dateint do={:local montharray ( "jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec" );:local days [ :pick $d 4 6 ];:local month [ :pick $d 0 3 ];:local year [ :pick $d 7 11 ];:local monthint ([ :find $montharray $month]);:local month ($monthint + 1);:if ( [len $month] = 1) do={:local zero ("0");:return [:tonum ("$year$zero$month$days")];} else={:return [:tonum ("$year$month$days")];}}; :local timeint do={ :local hours [ :pick $t 0 2 ]; :local minutes [ :pick $t 3 5 ]; :return ($hours * 60 + $minutes) ; }; :local date [ /system clock get date ]; :local time [ /system clock get time ]; :local today [$dateint d=$date] ; :local curtime [$timeint t=$time] ; :foreach i in [ /ip hotspot user find where profile="` + profileName + `" ] do={ :local comment [ /ip hotspot user get $i comment]; :local name [ /ip hotspot user get $i name]; :local gettime [:pic $comment 12 20]; :if ([:pic $comment 3] = "/" and [:pic $comment 6] = "/") do={:local expd [$dateint d=$comment] ; :local expt [$timeint t=$gettime] ; :if (($expd < $today and $expt < $curtime) or ($expd < $today and $expt > $curtime) or ($expd = $today and $expt < $curtime)) do={ [ /ip hotspot user ` + modeCmd + ` $i ]; [ /ip hotspot active remove [find where user=$name] ];}}}`;

    const schedulers = await mk.getSchedulers();
    const existingSched = schedulers.find((s: any) => s.name === profileName);

    if (expmode && expmode !== '0') {
      if (existingSched) {
        await mk.setScheduler({
          name: profileName,
          'start-time': randStart,
          interval: randInterval,
          'on-event': bgServiceScript,
          disabled: 'no',
          comment: `Monitor Profile ${profileName}`
        }, existingSched.id);
      } else {
        await mk.addScheduler({
          name: profileName,
          'start-time': randStart,
          interval: randInterval,
          'on-event': bgServiceScript,
          disabled: 'no',
          comment: `Monitor Profile ${profileName}`
        });
      }
    } else {
      // Expiration Mode is None -> remove scheduler if it exists
      if (existingSched) {
        await mk.removeScheduler(existingSched.id);
      }
    }

    mk.disconnect();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (mk) mk.disconnect();
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
