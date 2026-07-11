const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Extract app JS (second script block)
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const appJs = scripts[1][1];

// Extract CSS
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch[1];

// Save them separately for analysis
fs.writeFileSync('current-app.js', appJs);
fs.writeFileSync('current.css', css);

console.log('Extracted current-app.js and current.css');
console.log(`App JS: ${appJs.length} bytes`);
console.log(`CSS: ${css.length} bytes`);
