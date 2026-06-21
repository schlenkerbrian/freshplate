import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

const KROGER_BASE = 'https://api.kroger.com/v1';
let _token = null;
let _expiresAt = 0;
let _authFailed = false;

async function getKrogerToken(clientId, clientSecret) {
  if (_authFailed) throw new Error('Kroger auth previously failed — not retrying');
  if (_token && Date.now() < _expiresAt) return _token;
  const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${encoded}`,
    },
    body: 'grant_type=client_credentials&scope=product.compact',
  });
  if (!res.ok) { _authFailed = true; throw new Error(`Kroger auth ${res.status}: ${await res.text()}`); }
  const d = await res.json();
  _token = d.access_token;
  _expiresAt = Date.now() + (d.expires_in - 60) * 1000;
  return _token;
}

function krogerDevProxy(clientId, clientSecret) {
  return {
    name: 'kroger-dev-proxy',
    configureServer(server) {
      console.log('[kroger-proxy] clientId =', clientId || '(empty!)');
      console.log('[kroger-proxy] secret  =', clientSecret ? clientSecret.slice(0, 6) + '…' : '(empty!)');
      server.middlewares.use('/api/kroger', async (req, res) => {
        try {
          const token = await getKrogerToken(clientId, clientSecret);
          const krogerUrl = `${KROGER_BASE}${req.url}`;
          console.log('[kroger-proxy]', krogerUrl);
          const krogerRes = await fetch(krogerUrl, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const text = await krogerRes.text();
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = krogerRes.status;
          res.end(text);
        } catch (err) {
          console.error('[kroger-proxy] error:', err.message);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      krogerDevProxy(env.KROGER_CLIENT_ID, env.KROGER_CLIENT_SECRET),
    ],
  };
})
