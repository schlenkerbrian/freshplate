const CLIENT_ID     = process.env.KROGER_CLIENT_ID;
const CLIENT_SECRET = process.env.KROGER_CLIENT_SECRET;
const KROGER_BASE   = "https://api.kroger.com/v1";

let _token     = null;
let _expiresAt = 0;

async function getToken() {
  if (_token && Date.now() < _expiresAt) return _token;

  console.log(`[auth] clientId=${CLIENT_ID} secretLen=${CLIENT_SECRET?.length} secretStart=${CLIENT_SECRET?.slice(0,6)}`);
  const encoded = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${KROGER_BASE}/connect/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${encoded}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kroger auth ${res.status}: ${text}`);
  }

  const d = await res.json();
  _token     = d.access_token;
  _expiresAt = Date.now() + (d.expires_in - 60) * 1000;
  return _token;
}

export const handler = async (event) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  try {
    const token = await getToken();

    // Strip the function prefix to get the Kroger API path
    const fnPrefix = "/.netlify/functions/kroger";
    const krogerPath = event.path.startsWith(fnPrefix)
      ? event.path.slice(fnPrefix.length) || "/"
      : "/";

    const qs = event.rawQuery ? `?${event.rawQuery}` : "";
    const url = `${KROGER_BASE}${krogerPath}${qs}`;

    const krogerRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await krogerRes.json();
    const count = data?.data?.length ?? "n/a";
    const sample = data?.data?.[0];
    console.log(`[kroger] ${url} → ${krogerRes.status}, items=${count}, first=${sample?.description ?? "none"}, price=${sample?.items?.[0]?.price?.regular ?? "no-price"}`);
    return { statusCode: krogerRes.status, headers, body: JSON.stringify(data) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
