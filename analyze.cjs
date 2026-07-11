const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');

// Extract sections
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)];

console.log(`Total size: ${(html.length/1024).toFixed(1)} KB`);
console.log(`Script blocks: ${scripts.length}`);
console.log(`Style blocks: ${styles.length}`);

// Analyze script content
scripts.forEach((m, i) => {
  const len = m[1].length;
  console.log(`\nScript ${i+1}: ${(len/1024).toFixed(1)} KB`);
  // Find key function definitions
  const funcs = m[1].match(/function\s+\w+/g) || [];
  console.log(`  Functions: ${funcs.slice(0,15).join(', ')}${funcs.length>15?'...':''}`);
});

// Analyze features in code
const features = {
  'Map (D3 geo)': /geoPath|geoNaturalEarth/.test(html),
  'Zoom/Pan': /zoom|on\("zoom"/.test(html),
  'Particle Animation': /particles|requestAnimationFrame/.test(html),
  'Tooltip': /tooltip|showTooltip/.test(html),
  'Legend': /.legend|Legend/.test(html),
  'Search/Filter': /search|filter|autocomplete/.test(html),
  'Time Slider': /slider|timeline|year.*slider/i.test(html),
  'Statistics Panel': /stat|stats|统计/.test(html),
  'Bond Market Tab': /bond|债券/.test(html),
  'Stock Market Tab': /.stock|股票/.test(html),
  'Commodities Tab': /.commod|商品/.test(html),
  'Service Worker': /serviceWorker|navigator\.service/.test(html),
  'Country Details': /.detail|详情/.test(html),
  'Export/Download': /export|download|a\.download/i.test(html),
  'Theme Toggle': /theme|dark|light.*mode/i.test(html),
};

console.log('\n=== Feature Analysis ===');
for (const [name, exists] of Object.entries(features)) {
  console.log(`${exists ? '✓' : '✗'} ${name}`);
}

// Count UI elements
const uiElements = {
  'Buttons': (html.match(/<button/g) || []).length,
  'Inputs': (html.match(/<input/g) || []).length,
  'Selects': (html.match(/<select/g) || []).length,
  'Divs': (html.match(/<div/g) || []).length,
  'SVGs': (html.match(/<svg/g) || []).length,
  'Canvas': (html.match(/<canvas/g) || []).length,
};

console.log('\n=== UI Elements ===');
for (const [name, count] of Object.entries(uiElements)) {
  console.log(`${name}: ${count}`);
}
