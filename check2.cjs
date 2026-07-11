const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Extract all script content (between <script> and </script>)
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];

scripts.forEach((m, i) => {
  const code = m[1];
  try {
    new Function(code);
    console.log(`Script ${i+1}: OK (${(code.length/1024).toFixed(1)} KB)`);
  } catch(e) {
    console.log(`Script ${i+1}: SYNTAX ERROR - ${e.message}`);
    // Find line
    const match = e.message.match(/<eval>:(\d+):(\d+)/);
    if (match) {
      const lines = code.split('\n');
      const line = parseInt(match[1]);
      console.log(`  Near line ${line}: ${lines[line-1]?.substring(0,100)}`);
    }
  }
});

console.log(`\nTotal HTML: ${(html.length/1024).toFixed(1)} KB`);
