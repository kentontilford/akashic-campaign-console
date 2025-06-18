const fs = require('fs');
const path = require('path');

console.log('=== Verifying module imports ===');
console.log('Current directory:', process.cwd());
console.log('__dirname:', __dirname);

// Check if files exist
const filesToCheck = [
  'src/components/onboarding/index.ts',
  'src/lib/version-control.ts',
  'src/components/layout/PageLayout.tsx',
  'src/components/mapping/MapControls.tsx',
  'src/components/mapping/MapContainer.tsx'
];

filesToCheck.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  const exists = fs.existsSync(fullPath);
  console.log(`${file}: ${exists ? '✓ EXISTS' : '✗ MISSING'}`);
  if (exists) {
    const stats = fs.statSync(fullPath);
    console.log(`  Size: ${stats.size} bytes`);
  }
});

// Check tsconfig
const tsconfigPath = path.join(process.cwd(), 'tsconfig.json');
if (fs.existsSync(tsconfigPath)) {
  console.log('\ntsconfig.json: ✓ EXISTS');
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
  console.log('Paths config:', JSON.stringify(tsconfig.compilerOptions.paths, null, 2));
} else {
  console.log('\ntsconfig.json: ✗ MISSING');
}

// Check directory structure
console.log('\n=== Directory structure ===');
const srcDir = path.join(process.cwd(), 'src');
if (fs.existsSync(srcDir)) {
  console.log('src/: ✓ EXISTS');
  const componentsDir = path.join(srcDir, 'components');
  if (fs.existsSync(componentsDir)) {
    console.log('src/components/: ✓ EXISTS');
    const subdirs = fs.readdirSync(componentsDir).filter(f => fs.statSync(path.join(componentsDir, f)).isDirectory());
    console.log('Subdirectories:', subdirs.join(', '));
  }
}