const http = require('http');

http.get('http://localhost/api/portal/preview?template=Window-orange-login&screen=login', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log("STATUS:", res.statusCode);
    console.log("HTML LENGTH:", data.length);
    // Find form / container content
    const containerIdx = data.indexOf('<div class="container"');
    const formIdx = data.indexOf('<form');
    if (containerIdx !== -1) {
      console.log("CONTAINER HTML:\n", data.substring(containerIdx, containerIdx + 1500));
    } else if (formIdx !== -1) {
      console.log("FORM HTML:\n", data.substring(formIdx, formIdx + 1500));
    } else {
      console.log("FIRST 1000 CHARS:\n", data.substring(0, 1000));
    }
  });
});
