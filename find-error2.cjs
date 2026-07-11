const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const app = scripts[1][1];

// Find the problematic line by checking each function
const lines = app.split('\n');
for (let i = 0; i < lines.length; i++) {
  // Look for lines with suspicious patterns
  if (lines[i].includes("';+") || lines[i].includes(");+")) {
    console.log(`Line ${i+1}: ${lines[i]}`);
  }
}

// Also try parsing smaller chunks
console.log('\n--- Trying to find error by binary search ---');
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
console.log(`Error near line ${low}:`);
for (let i = Math.max(0, low-5); i < Math.min(lines.length, low+2); i++) {
  console.log(`${i+1}: ${lines[i]}`);
}
