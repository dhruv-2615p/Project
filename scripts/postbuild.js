// Runs after `npm run build` to add Express server files to the build folder
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');

const serverJs = `const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
`;

const packageJson = JSON.stringify({
  name: 'ai-support-frontend',
  version: '1.0.0',
  engines: { node: '20.x' },
  scripts: { start: 'node server.js' },
  dependencies: { express: '^4.18.2' }
}, null, 2);

fs.writeFileSync(path.join(buildDir, 'server.js'), serverJs);
fs.writeFileSync(path.join(buildDir, 'package.json'), packageJson);

console.log('postbuild: server.js and package.json written to build/');
