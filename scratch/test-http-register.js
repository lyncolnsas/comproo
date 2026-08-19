const payload = {
  name: "Http Test User",
  username: "httptestuser",
  password: "password123",
  cpf: "11122233344",
  gender: "Homem",
  email: "httptest@example.com",
  birthDate: "1990-01-01",
  customFieldValue: "Http Test"
};

async function testUrl(url) {
  console.log(`\nSending HTTP POST to: ${url}`);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log(`Response Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log(`Response Body Length: ${text.length} characters`);
    console.log(`Response Body Preview:\n${text.substring(0, 500)}`);
  } catch (err) {
    console.error(`Fetch failed for ${url}:`, err.message);
  }
}

async function run() {
  // Test local loopback on port 80
  await testUrl('http://127.0.0.1/api/portal/register');
  
  // Test local IP address on port 80 (Change if your system has a different LAN IP)
  await testUrl('http://192.168.88.254/api/portal/register');
}

run();
