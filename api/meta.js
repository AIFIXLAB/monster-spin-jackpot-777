// Vercel function: fetches an NFT metadata JSON (for gateways that block browsers).
export default async function handler(req, res) {
  const url = req.query.url;
  if (typeof url !== "string" || !/^https:\/\//.test(url)) { res.status(400).json({ error: "https url required" }); return; }
  try {
    const r = await fetch(url, { headers: { accept: "application/json" } });
    const text = await r.text();
    if (text.length > 2_000_000) { res.status(413).json({ error: "too large" }); return; }
    res.setHeader("content-type", "application/json");
    res.setHeader("cache-control", "s-maxage=300, stale-while-revalidate=3600");
    res.status(r.status).send(text);
  } catch (e) { res.status(502).json({ error: "metadata unreachable" }); }
}
