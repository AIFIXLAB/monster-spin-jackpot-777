// Vercel function: forwards read-only eth_call / eth_chainId to Robinhood Chain (via Blockscout's JSON-RPC).
const RPC = "https://robinhoodchain.blockscout.com/api/eth-rpc";
const ALLOWED = new Set(["eth_call", "eth_chainId", "eth_blockNumber"]);

export default async function handler(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "POST only" }); return; }
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body || !ALLOWED.has(body.method)) { res.status(400).json({ error: "method not allowed" }); return; }
  try {
    const r = await fetch(RPC, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    res.setHeader("content-type", "application/json");
    res.status(r.status).send(await r.text());
  } catch (e) { res.status(502).json({ error: "rpc unreachable" }); }
}
