const fs = require('fs');
const html = fs.readFileSync('chart.html', 'utf8');
const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
const app = scripts[1][1];

// Find order of key declarations
const lines = app.split('\n');
console.log('=== Execution Order (first 20 lines) ===');
lines.slice(0, 20).forEach((line, i) => {
  console.log(`${i+1}: ${line.trim().substring(0, 100)}`);
});

// Check: let particles should come before rc() call
const particlesDecl = app.indexOf('let particles');
const rcCall = app.indexOf('rc();');
const filterFlowsDecl = app.indexOf('function filterFlows');
const initParticlesDecl = app.indexOf('function initParticles');

console.log('\n=== Key Positions ===');
console.log(`let particles: ${particlesDecl}`);
console.log(`rc() call: ${rcCall}`);
console.log(`function filterFlows: ${filterFlowsDecl}`);
console.log(`function initParticles: ${initParticlesDecl}`);

if (particlesDecl < rcCall) {
  console.log('\n✅ FIXED: particles declared before rc() call');
} else {
  console.log('\n❌ STILL BROKEN: particles declared after rc() call');
}
