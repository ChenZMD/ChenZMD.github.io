const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g);
if(scripts && scripts.length >= 2) {
  const appCode = scripts[scripts.length - 1].replace(/^<script>/, '').replace(/<\/script>$/, '');
  console.log('App code length:', (appCode.length/1024).toFixed(1), 'KB');
  try {
    new Function(appCode);
    console.log('Syntax: OK');
  } catch(e) {
    console.log('Syntax ERROR:', e.message);
  }
} else {
  console.log('Found', scripts ? scripts.length : 0, 'script blocks');
}
