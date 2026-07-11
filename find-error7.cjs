const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

const secondScriptStart = html.indexOf('<script>', html.indexOf('</script>')) + 8;
const secondScriptEnd = html.indexOf('</script>', secondScriptStart);
const secondScript = html.substring(secondScriptStart, secondScriptEnd);

const lines = secondScript.split('\n');

// Binary search for the error
let low = 0, high = lines.length;
while (low < high) {
  const mid = Math.floor((low + high) / 2);
  const chunk = lines.slice(0, mid).join('\n');
  try {
    new Function(chunk);
    low = mid + 1;
  } catch(e) {
    high = mid;
  }
}

console.log(`Error near line ${low} of ${lines.length}`);
console.log('\nContext:');
for (let i = Math.max(0, low-5); i < Math.min(lines.length, low+3); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
