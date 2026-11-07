// Vercel function: forwards read-only calls to Robinhood Chain.
const RPCS = ["https://rpc.mainnet.chain.robinhood.com", "https://robinhoodchain.blockscout.com/api/eth-rpc"];
const ALLOWED = new Set(["eth_call", "eth_chainId", "eth_blockNumber"]);

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body || !ALLOWED.has(body.method)) { res.status(400).json({ error: "method not allowed" }); return; }
  for (const url of RPCS) {
    try {
      const r = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      if (!r.ok) continue;
      const text = await r.text();
      res.setHeader("content-type", "application/json");
      res.status(200).send(text);
      return;
    } catch (e) { /* try next */ }
  }
  res.status(502).json({ error: "rpc unreachable" });
}
