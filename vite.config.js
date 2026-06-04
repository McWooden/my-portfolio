import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const saveNetworkDataPlugin = () => ({
  name: 'save-network-data',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      if (req.url === '/api/save-network-data' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const { networkPeople, centerNode } = JSON.parse(body);
            const filePath = path.resolve('src/data/networkData.js');

            // Format as ES module code
            const fileContent = `export const networkPeople = ${JSON.stringify(networkPeople, null, 2)};\n\nexport const centerNode = ${JSON.stringify(centerNode, null, 2)};\n`;

            fs.writeFileSync(filePath, fileContent, 'utf-8');

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      } else {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    saveNetworkDataPlugin(),
  ],
  server: {
    port: 3000,
  },
})
