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

  // 1. Prisma & Logger Imports
  content = content.replace(/import\s+\{\s*prisma\s*\}\s+from\s+['"]([^'"]+)['"]/g, 'import prisma from \'$1\'');
  content = content.replace(/import\s+\{\s*logger\s*\}\s+from\s+['"]([^'"]+)['"]/g, 'import logger from \'$1\'');

  // 2. Env Config Imports
  content = content.replace(/import\s+\{\s*env\s*\}\s+from\s+['"]([^'"]+env)['"]/g, 'import { config } from \'$1\'');
  content = content.replace(/import\s+env\s+from\s+['"]([^'"]+env)['"]/g, 'import { config } from \'$1\'');

  // 3. Env usages
  content = content.replace(/\benv\b/g, 'config');

  // 4. Specific service errors
  if (filePath.endsWith('transaction.service.ts') && !content.includes('import logger')) {
    content = 'import logger from \'../config/logger\';\n' + content;
  }

  if (filePath.endsWith('export.service.ts')) {
    content = content.replace(/writeBuffer\(\)\s+as\s+Promise<Buffer>/g, 'writeBuffer() as unknown as Promise<Buffer>');
  }

  // 5. Repository Return Types
  if (filePath.includes('repositories')) {
    content = content.replace(/:\s*Promise<Budget\[\]>/g, ': Promise<any[]>');
    content = content.replace(/:\s*Promise<Budget\s*\|\s*null>/g, ': Promise<any | null>');
    content = content.replace(/:\s*Promise<Budget>/g, ': Promise<any>');

    content = content.replace(/:\s*Promise<SavingsGoal\[\]>/g, ': Promise<any[]>');
    content = content.replace(/:\s*Promise<SavingsGoal\s*\|\s*null>/g, ': Promise<any | null>');
    content = content.replace(/:\s*Promise<SavingsGoal>/g, ': Promise<any>');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Refactored: ${path.relative(__dirname, filePath)}`);
  }
});
