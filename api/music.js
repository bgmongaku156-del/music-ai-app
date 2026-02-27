export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ error: "POST only" });
  }

  try {
    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: "FAL_KEY missing" });
    }

    const body = req.body || {};
    const prompt = (body.prompt || "relaxing ambient music").toString();

    // 10 / 60 / 180 をそのまま扱える（Stable Audio 2.5は seconds_total）
    const seconds_total = Math.max(5, Math.min(Number(body.duration) || 10, 190));

    const modelPath = "fal-ai/stable-audio-25/text-to-audio";
    const submitUrl = `https://queue.fal.run/${modelPath}`;

    const r = await fetch(submitUrl, {
      method: "POST",
      headers: {
        Authorization: `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        seconds_total,
      }),
    });

    const text = await r.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(500).json({ error: "fal submit non-json", raw: text });
    }

    if (!r.ok || !data.request_id) {
      return res.status(500).json({ error: "fal submit failed", data });
    }

    // request_idだけ返す（=すぐ返るのでTimeoutしない）
    return res.status(200).json({
      request_id: data.request_id,
    });
  } catch (e) {
    return res.status(500).json({ error: "server error", message: String(e) });
  }
}
