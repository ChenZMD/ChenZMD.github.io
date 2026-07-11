const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

const secondScriptStart = html.indexOf('<script>', html.indexOf('</script>')) + 8;
const secondScriptEnd = html.indexOf('</script>', secondScriptStart);
const secondScript = html.substring(secondScriptStart, secondScriptEnd);

fs.writeFileSync('second-script.js', secondScript);
console.log('Extracted second script to second-script.js');
