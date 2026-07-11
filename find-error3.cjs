const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Find all occurrences
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

console.log('Script starts:', scriptStarts);
console.log('Script ends:', scriptEnds);

// Extract second script block properly
const secondStart = scriptStarts[1] + 8;
const secondEnd = scriptEnds[1];
const secondScript = html.substring(secondStart, secondEnd);
console.log('\nSecond script length:', secondScript.length);
console.log('First 500 chars:', secondScript.substring(0, 500));

// Try to parse
try {
  new Function(secondScript);
  console.log('\n✅ Second script parses OK');
} catch(e) {
  console.log('\n❌ Error:', e.message);
}
