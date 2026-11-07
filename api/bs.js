// Vercel serverless proxy for the Robinhood Chain Blockscout API.
// Used only when the browser can't call the explorer directly (CORS / rate limits).
const BASE = "https://robinhoodchain.blockscout.com";

export default async function handler(req, res) {
  const { path, ...rest } = req.query;
  if (typeof path !== "string" || !/^api\/v2\/[A-Za-z0-9_\/\-x]+$/.test(path)) {
    res.status(400).json({ error: "bad path" });
    return;
  }
  const qs = new URLSearchParams(rest).toString();
  try {
    const r = await fetch(`${BASE}/${path}${qs ? "?" + qs : ""}`, { headers: { accept: "application/json" } });
    const body = await r.text();
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "s-maxage=30, stale-while-revalidate=120");
    res.status(r.status).send(body);
  } catch (e) {
    res.status(502).json({ error: "explorer unreachable" });
  }
}
