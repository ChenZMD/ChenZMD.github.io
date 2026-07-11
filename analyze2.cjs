const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Extract app JS (second script block)
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const appJs = scripts[1][1];

// Extract CSS
const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/);
const css = cssMatch[1];

// Analyze app JS functions
console.log('=== App JS Functions ===');
const funcMatches = appJs.match(/function\s+\w+\([^)]*\)/g) || [];
funcMatches.forEach(f => console.log(f));

// Analyze D3 usage
console.log('\n=== D3 Usage ===');
const d3methods = [...appJs.matchAll(/d3\.(\w+)/g)];
const d3usage = {};
d3methods.forEach(m => { d3usage[m[1]] = (d3usage[m[1]]||0)+1; });
Object.entries(d3usage).sort((a,b)=>b[1]-a[1]).forEach(([k,v]) => console.log(`d3.${k}: ${v}`));

// Analyze event listeners
console.log('\n=== Event Handlers ===');
const events = appJs.match(/on\("[^"]+"/g) || [];
events.forEach(e => console.log(e));

// Analyze UI string building
console.log('\n=== HTML Templates ===');
const htmlBuilds = appJs.match(/h\+=[^;]{0,100}/g) || [];
htmlBuilds.slice(0,15).forEach(h => console.log(h.trim()));

// Size breakdown
console.log('\n=== Size Breakdown ===');
console.log(`CSS: ${(css.length/1024).toFixed(1)} KB`);
console.log(`App JS: ${(appJs.length/1204).toFixed(1)} KB`);
console.log(`Combined (will gzip together): ${((css.length+appJs.length)/1024).toFixed(1)} KB`);

// Identify removable code patterns
console.log('\n=== Potentially Removable ===');
if (appJs.includes('theme')) console.log('- Theme code found');
if (appJs.includes('export') || appJs.includes('download')) console.log('- Export/download code found');
if (appJs.includes('tab') || appJs.includes('Tab')) console.log('- Tab switching code found');
if (appJs.includes('legend')) console.log('- Legend code found');

// Count lines of app code
const lines = appJs.split('\n').length;
console.log(`\nTotal app JS lines: ${lines}`);
