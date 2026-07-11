const http = require('http');

function measure() {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    const req = http.get('http://127.0.0.1:8082/chart.html', { headers: { 'Accept-Encoding': 'gzip' } }, (res) => {
      let size = 0;
      res.on('data', (chunk) => { size += chunk.length; });
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const ms = Number(end - start) / 1e6;
        console.log(`Status: ${res.statusCode}`);
        console.log(`Content-Encoding: ${res.headers['content-encoding'] || 'none'}`);
        console.log(`Transfer Size: ${size} bytes`);
        console.log(`Time: ${ms.toFixed(2)} ms`);
        resolve(ms);
      });
    });
    req.on('error', (e) => { console.error('Error:', e.message); resolve(-1); });
  });
}

async function main() {
  // Warm up
  await measure();
  // Test 3 times
  const times = [];
  for (let i = 0; i < 3; i++) {
    times.push(await measure());
  }
  console.log(`\nAverage: ${(times.reduce((a,b) => a+b, 0) / times.length).toFixed(2)} ms`);
}

main();
