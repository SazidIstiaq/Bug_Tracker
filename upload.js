const { put } = require("@vercel/blob");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end();
  const pw = process.env.TEAM_PASSWORD;
  if (pw && req.headers["x-team-password"] !== pw)
    return res.status(401).json({ error: "Wrong or missing team password" });
  try {
    const name = String(req.query.name || "file").replace(/[^\w.\-]/g, "_");
    const blob = await put("bugs/" + name, req, {
      access: "public",
      addRandomSuffix: true,
      contentType: req.headers["content-type"],
    });
    res.json({ url: blob.url, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
