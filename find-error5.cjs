const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Use the same regex as check-cosmic.cjs
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
console.log('Number of scripts found:', scripts.length);

scripts.forEach((m, i) => {
  console.log(`\nScript ${i+1}: ${m[1].length} bytes`);
  console.log(`Index: ${m.index}, length of full match: ${m[0].length}`);
  try {
    new Function(m[1]);
    console.log('✅ Parses OK');
  } catch(e) {
    console.log('❌ Error:', e.message);
  }
});

// Check what's between the scripts
const firstScriptEnd = html.indexOf('</script>') + 9;
const secondScriptStart = html.indexOf('<script>', firstScriptEnd);
console.log('\n--- Between scripts ---');
console.log('Char at first script end:', JSON.stringify(html.substring(firstScriptEnd-5, firstScriptEnd+5)));
console.log('Text between scripts:', JSON.stringify(html.substring(firstScriptEnd, secondScriptStart)));
