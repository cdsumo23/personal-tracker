const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const srcDir = path.join(__dirname, 'src');

walkDir(srcDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Restore process.env
  content = content.replace(/\bprocess\.config\b/g, 'process.env');

  // Fix config/database.ts and config/logger.ts wrong import paths
  if (filePath.endsWith('database.ts') || filePath.endsWith('logger.ts')) {
    content = content.replace(/from\s+['"]\.\/config['"]/g, 'from \'./env\'');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed process.env/import in: ${path.relative(__dirname, filePath)}`);
  }
});
