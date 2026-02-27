export default async function handler(req, res) {
  const FAL_KEY = process.env.FAL_KEY;

  if (!FAL_KEY) {
    return res.status(500).json({ error: "Server misconfigured", detail: "FAL_KEY is missing" });
  }

  // 405対策：POSTだけに統一（Vercel側でGETが弾かれても動く）
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
  } catch (e) {
    return res.status(400).json({ error: "Invalid JSON body", detail: String(e) });
  }

  // action === "status" なら進捗/結果取得（GETの代わり）
  const action = (body.action || "").toString();

  try {
    // ---------- STATUS ----------
    if (action === "status") {
      const requestId = (body.request_id || "").toString().trim();
      if (!requestId) return res.status(400).json({ error: "request_id is required" });

      // status
      const statusRes = await fetch(
        `https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${encodeURIComponent(requestId)}/status`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      );

      const statusText = await statusRes.text();
      let statusJson;
      try {
        statusJson = JSON.parse(statusText);
      } catch {
        return res.status(502).json({ error: "Bad response from fal(status)", raw: statusText });
      }

      if (!statusRes.ok) {
        return res.status(statusRes.status).json({ error: "fal status error", detail: statusJson });
      }

      if (statusJson.status !== "COMPLETED") {
        return res.status(200).json({
          status: statusJson.status,
          request_id: requestId,
          queue_position: statusJson.queue_position ?? null,
        });
      }

      // completed -> result
      const resultRes = await fetch(
        `https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${encodeURIComponent(requestId)}`,
        { headers: { Authorization: `Key ${FAL_KEY}` } }
      );

      const resultText = await resultRes.text();
      let resultJson;
      try {
        resultJson = JSON.parse(resultText);
      } catch {
        return res.status(502).json({ error: "Bad response from fal(result)", raw: resultText });
      }

      if (!resultRes.ok) {
        return res.status(resultRes.status).json({ error: "fal result error", detail: resultJson });
      }

      // Stable Audio 2.5 の返り値に合わせてURL抽出（保険多め）
      const url =
        resultJson?.audio_file?.url ||
        resultJson?.audio?.url ||
        resultJson?.url ||
        resultJson?.data?.audio?.url ||
        resultJson?.audios?.[0]?.url ||
        null;

      if (!url) {
        return res.status(500).json({ error: "No audio url in result", result: resultJson });
      }

      return res.status(200).json({ status: "COMPLETED", request_id: requestId, url });
    }

    // ---------- START (GENERATE) ----------
    const prompt = (body.prompt ?? "").toString().trim();
    const duration = Number(body.duration);

    if (!prompt) return res.status(400).json({ error: "prompt is required" });

    // seconds_total: 1〜190に丸め（UIは 10/60/180想定）
    let seconds_total = Math.round(duration);
    if (!Number.isFinite(seconds_total)) seconds_total = 10;
    if (seconds_total < 1) seconds_total = 1;
    if (seconds_total > 190) seconds_total = 190;

    const falRes = await fetch("https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${FAL_KEY}`,
      },
      body: JSON.stringify({
        prompt,
        seconds_total,
        num_inference_steps: 4,
        guidance_scale: 1,
        sync_mode: false,
      }),
    });

    const falText = await falRes.text();
    let falJson;
    try {
      falJson = JSON.parse(falText);
    } catch {
      return res.status(502).json({ error: "fal returned non-JSON", raw: falText });
    }

    if (!falRes.ok) {
      return res.status(falRes.status).json({ error: "fal error", detail: falJson });
    }

    if (!falJson.request_id) {
      return res.status(500).json({ error: "No request_id", detail: falJson });
    }

    return res.status(200).json({
      request_id: falJson.request_id,
      status: falJson.status ?? "IN_QUEUE",
    });
  } catch (e) {
    return res.status(500).json({ error: "Server error", detail: String(e) });
  }
}
