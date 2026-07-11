const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const app = scripts[1][1];

// Try to find the error location
try {
  new Function(app);
} catch(e) {
  console.log('Error:', e.message);
  // Try to find line number from stack
  const match = e.message.match(/(\d+):(\d+)/);
  if (match) {
    const line = parseInt(match[1]);
    const lines = app.split('\n');
    console.log(`Near line ${line}:`);
    for (let i = Math.max(0, line-3); i < Math.min(lines.length, line+3); i++) {
      console.log(`${i+1}: ${lines[i]}`);
    }
  }
}
