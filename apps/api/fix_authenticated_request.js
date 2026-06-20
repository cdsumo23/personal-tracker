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

const controllersDir = path.join(__dirname, 'src', 'controllers');

walkDir(controllersDir, (filePath) => {
  if (!filePath.endsWith('.ts')) return;

  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace AuthenticatedRequest import
  content = content.replace(/import\s+\{\s*AuthenticatedRequest\s*\}\s+from\s+['"][^'"]+auth\.middleware['"];?/g, '');
  
  // Ensure Request is imported from express
  if (content.includes('AuthenticatedRequest')) {
    if (content.includes('import { Response } from \'express\'')) {
      content = content.replace('import { Response } from \'express\'', 'import { Request, Response } from \'express\'');
    } else if (content.includes('import { Response, NextFunction } from \'express\'')) {
      content = content.replace('import { Response, NextFunction } from \'express\'', 'import { Request, Response, NextFunction } from \'express\'');
    } else if (!content.includes('import { Request')) {
      content = 'import { Request } from \'express\';\n' + content;
    }
    
    // Replace req: AuthenticatedRequest with req: Request
    content = content.replace(/:\s*AuthenticatedRequest\b/g, ': Request');
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Replaced AuthenticatedRequest in: ${path.relative(__dirname, filePath)}`);
  }
});
