const { POST } = require('../src/app/api/portal/register/route.ts');

async function main() {
  console.log("=== RUNNING POST ROUTE HANDLER ===");
  
  const payload = {
    name: "User Teste",
    username: "userteste",
    password: "password123",
    customFieldValue: "Engenharia"
  };

  // Mock Request class
  const mockReq = {
    json: async () => payload,
    headers: new Map(),
    method: 'POST'
  };

  try {
    const response = await POST(mockReq);
    console.log("Response status:", response.status);
    const body = await response.json();
    console.log("Response body:", body);
  } catch (err) {
    console.error("CRITICAL EXCEPTION IN POST HANDLER:", err);
  }
}

main().catch(console.error);
