const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

scripts.forEach((m, i) => {
  try {
    new Function(m[1]);
    console.log(`Script ${i+1}: OK (${(m[1].length/1024).toFixed(1)} KB)`);
  } catch(e) {
    console.log(`Script ${i+1}: ERROR - ${e.message}`);
  }
});
console.log(`Total: ${(html.length/1024).toFixed(1)} KB`);
