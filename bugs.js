const { Redis } = require("@upstash/redis");
const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const all = (await redis.hgetall("bugs")) || {};
      return res.json(Object.values(all).sort((a, b) => b.createdAt - a.createdAt));
    }
    const pw = process.env.TEAM_PASSWORD;
    if (pw && req.headers["x-team-password"] !== pw)
      return res.status(401).json({ error: "Wrong or missing team password" });

    if (req.method === "POST") {
      const b = req.body || {};
      if (!b.title) return res.status(400).json({ error: "Title is required" });
      const id = "BUG-" + Date.now().toString(36).toUpperCase();
      const bug = {
        id, status: "Open", createdAt: Date.now(),
        title: b.title, severity: b.severity, priority: b.priority,
        module: b.module, env: b.env, pre: b.pre, steps: b.steps,
        exp: b.exp, act: b.act, reporter: b.reporter,
        attachments: Array.isArray(b.attachments) ? b.attachments : [],
      };
      await redis.hset("bugs", { [id]: bug });
      return res.status(201).json(bug);
    }
    if (req.method === "PATCH") {
      const { id, status } = req.body || {};
      const bug = await redis.hget("bugs", id);
      if (!bug) return res.status(404).json({ error: "Not found" });
      bug.status = status;
      await redis.hset("bugs", { [id]: bug });
      return res.json(bug);
    }
    res.status(405).end();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
