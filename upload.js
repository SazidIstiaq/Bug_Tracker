const { put } = require("@vercel/blob");

async function readBody(req) {
  const b = req.body; // Vercel may already have buffered it
  if (Buffer.isBuffer(b)) return b;
  if (typeof b === "string") return Buffer.from(b);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return Buffer.concat(chunks);
}

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
    const pw = process.env.TEAM_PASSWORD;
    if (pw && req.headers["x-team-password"] !== pw)
      return res.status(401).json({ error: "Wrong or missing team password" });
    if (!process.env.BLOB_READ_WRITE_TOKEN)
      return res.status(500).json({ error: "Blob store not connected (BLOB_READ_WRITE_TOKEN missing). Connect it in Storage, then redeploy." });

    const name = String(req.query.name || "file").replace(/[^\w.\-]/g, "_");
    const buf = await readBody(req);
    if (!buf.length) return res.status(400).json({ error: "Empty file" });

    const blob = await put("bugs/" + name, buf, {
      access: "public",
      addRandomSuffix: true,
      contentType: req.headers["content-type"] || "application/octet-stream",
    });
    res.json({ url: blob.url, name });
  } catch (e) {
    res.status(500).json({ error: "Upload failed: " + e.message });
  }
};
