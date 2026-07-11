const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Use RegExp constructor instead
const regex = new RegExp('<script>([\\s\\s]*?)<\\/script>', 'g');
const scripts = [...html.matchAll(regex)];
console.log('Found', scripts.length, 'scripts');

// Also try manual extraction
const firstScriptStart = html.indexOf('<script>') + 8;
const firstScriptEnd = html.indexOf('</script>');
const firstScript = html.substring(firstScriptStart, firstScriptEnd);

const secondScriptStart = html.indexOf('<script>', firstScriptEnd) + 8;
const secondScriptEnd = html.indexOf('</script>', secondScriptStart);
const secondScript = html.substring(secondScriptStart, secondScriptEnd);

console.log('First script:', firstScript.length, 'bytes');
console.log('Second script:', secondScript.length, 'bytes');

try {
  new Function(firstScript);
  console.log('First: OK');
} catch(e) {
  console.log('First error:', e.message);
}

try {
  new Function(secondScript);
  console.log('Second: OK');
} catch(e) {
  console.log('Second error:', e.message);
  // Show last 200 chars
  console.log('Last 200 chars:', secondScript.substring(secondScript.length - 200));
}
