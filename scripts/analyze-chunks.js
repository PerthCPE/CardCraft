const fs = require('fs');
const path = require('path');

const reportPath = path.join(__dirname, '../frontend/.next/analyze/client.html');
if (!fs.existsSync(reportPath)) {
  console.error('File not found:', reportPath);
  process.exit(1);
}

const html = fs.readFileSync(reportPath, 'utf8');
const match = html.match(/window\.chartData\s*=\s*(\[.*?\]);/s);
if (!match) {
  console.error('chartData not found');
  process.exit(1);
}

const data = JSON.parse(match[1]);

console.log('Total chunks analyzed:', data.length);

const allModules = [];

data.forEach((chunk) => {
  const isShared = chunk.label.includes('shared') || chunk.label.includes('117-') || chunk.label.includes('fd9d1056-') || chunk.label.includes('main') || chunk.label.includes('webpack');
  
  function collect(node, currentPath = '') {
    const cur = currentPath ? `${currentPath}/${node.label}` : node.label;
    if (node.groups && node.groups.length > 0) {
      node.groups.forEach((child) => collect(child, cur));
    } else {
      allModules.push({
        chunk: chunk.label,
        isShared,
        path: cur,
        label: node.label,
        stat: node.statSize || 0,
        parsed: node.parsedSize || 0,
        gzip: node.gzipSize || 0,
      });
    }
  }

  if (chunk.groups) {
    chunk.groups.forEach((g) => collect(g));
  }
});

console.log('\n============================================================');
console.log('10 โมดูลที่ใหญ่ที่สุดใน Shared Chunks (เรียงตาม gzip):');
console.log('============================================================');

const sharedModules = allModules.filter((m) => m.isShared);
sharedModules.sort((a, b) => b.gzip - a.gzip);

sharedModules.slice(0, 15).forEach((m, idx) => {
  console.log(
    `${idx + 1}. [${(m.gzip / 1024).toFixed(2)} KB gzip] [${(m.parsed / 1024).toFixed(2)} KB parsed] (${m.chunk}) ${m.path}`
  );
});

console.log('\n============================================================');
console.log('15 โมดูลที่ใหญ่ที่สุดใน All Chunks (รวม Route Chunks):');
console.log('============================================================');

allModules.sort((a, b) => b.gzip - a.gzip);
allModules.slice(0, 20).forEach((m, idx) => {
  console.log(
    `${idx + 1}. [${(m.gzip / 1024).toFixed(2)} KB gzip] [${(m.parsed / 1024).toFixed(2)} KB parsed] (${m.chunk}) ${m.path}`
  );
});
