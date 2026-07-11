const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

function indexOfAll(str, search) {
  const indices = [];
  let idx = str.indexOf(search);
  while (idx !== -1) {
    indices.push(idx);
    idx = str.indexOf(search, idx + 1);
  }
  return indices;
}

const scriptStarts = indexOfAll(html, '<script>');
const scriptEnds = indexOfAll(html, '</script>');

// Extract first script block
const firstStart = scriptStarts[0] + 8;
const firstEnd = scriptEnds[0];
const firstScript = html.substring(firstStart, firstEnd);
console.log('First script length:', firstScript.length);

try {
  new Function(firstScript);
  console.log('✅ First script parses OK');
} catch(e) {
  console.log('❌ Error:', e.message);
  // Find line
  const lines = firstScript.split('\n');
  // Try binary search
  let low = 0, high = lines.length;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    const chunk = lines.slice(0, mid).join('\n');
    try {
      new Function(chunk);
      low = mid + 1;
    } catch(e2) {
      high = mid;
    }
  }
  console.log(`Error near line ${low}:`);
  for (let i = Math.max(0, low-5); i < Math.min(lines.length, low+2); i++) {
    console.log(`${i+1}: ${lines[i]?.substring(0, 150)}`);
  }
}
