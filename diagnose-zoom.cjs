const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Extract the second script (app logic)
const secondStart = html.indexOf('<script>', html.indexOf('</script>')) + 8;
const secondEnd = html.indexOf('</script>', secondStart);
const appCode = html.substring(secondStart, secondEnd);

// Find zoom-related code
const lines = appCode.split('\n');
console.log('=== Zoom-related Code ===');
lines.forEach((line, i) => {
  if (line.includes('zoom') || line.includes('scale') || line.includes('transform') || line.includes('wheel')) {
    console.log(`Line ${i+1}: ${line.trim()}`);
  }
});

console.log('\n=== Init & Resize Code ===');
lines.forEach((line, i) => {
  if (line.includes('resize') || line.includes('init') || line.includes('translate') || line.includes('clientWidth')) {
    console.log(`Line ${i+1}: ${line.trim()}`);
  }
});
