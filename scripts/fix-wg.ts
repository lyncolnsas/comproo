import { MikrotikAPI } from '../src/lib/routeros';
const mk = new MikrotikAPI();

async function main() {
  try {
    const activeRouterHost = '192.168.88.1';
    await mk.connect(activeRouterHost, 'admin', '22101844');
    
    // Add to Walled Garden IP List
    console.log("Adding to Walled Garden IP...");
    await mk.addWalledGardenIp('accept', '192.168.88.254', 'API Bypass');
    console.log("Done adding to IP list!");

    mk.disconnect();
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
