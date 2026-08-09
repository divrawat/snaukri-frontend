const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, '..', '.next', 'server', 'pages');

function deleteLoadableManifests(dir) {
  if (!fs.existsSync(dir)) return;

  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      deleteLoadableManifests(filePath);
    } else if (file === 'react-loadable-manifest.js') {
      try {
        fs.unlinkSync(filePath);
        console.log(`Deleted loadable manifest route: ${filePath}`);
      } catch (err) {
        console.error(`Failed to delete ${filePath}:`, err.message);
      }
    }
  }
}

console.log('Cleaning Next.js loadable manifest files from pages directory...');
deleteLoadableManifests(targetDir);
console.log('Clean completed!');
