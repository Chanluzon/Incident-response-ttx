const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'ttx', 'src');
const replacements = [
  { from: /"safeguard"/g, to: '"prepare"' },
  { from: /"vulnerability"/g, to: '"detect"' },
  { from: /"threat agents"/g, to: '"respond"' },
  { from: /"risk"/g, to: '"recover"' },
  { from: /"infosec pillars"/g, to: '"lessons learned"' },
  { from: /'safeguard'/g, to: "'prepare'" },
  { from: /'vulnerability'/g, to: "'detect'" },
  { from: /'threat agents'/g, to: "'respond'" },
  { from: /'risk'/g, to: "'recover'" },
  { from: /'infosec pillars'/g, to: "'lessons learned'" },
  { from: /safeguard:/g, to: 'prepare:' },
  { from: /vulnerability:/g, to: 'detect:' },
  { from: /risk:/g, to: 'recover:' }
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(dir);
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  replacements.forEach(r => {
    if (r.from.test(content)) {
      content = content.replace(r.from, r.to);
      changed = true;
    }
  });
  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
