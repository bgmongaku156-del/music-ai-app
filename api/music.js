export default async function handler(req, res) {
  const FAL_KEY = process.env.FAL_KEY;
  if (!FAL_KEY) {
    return res.status(500).json({ error: "Server misconfigured", detail: "FAL_KEY is missing" });
  }

  // GET: request_id の状態取得＆完了なら音声URL返す（クライアントはこれだけ叩けばOK）
  if (req.method === "GET") {
    const requestId = req.query.request_id;
    if (!requestId) return res.status(400).json({ error: "request_id is required" });

    try {
      // status
      const statusRes = await fetch(
        `https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${encodeURIComponent(requestId)}/status`,
        {
          headers: { Authorization: `Key ${FAL_KEY}` },
        }
      );

      const statusText = await statusRes.text();
      let statusJson;
      try {
        statusJson = JSON.parse(statusText);
      } catch {
        return res.status(502).json({ error: "Bad response from fal(status)", raw: statusText });
      }

      // 進行中ならそのまま返す
      if (statusJson.status !== "COMPLETED") {
        return res.status(200).json({ status: statusJson.status, request_id: requestId, queue_position: statusJson.queue_position ?? null });
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

      // Stable Audio 2.5 正式: resultJson.audio.url 3
      // もし別形式が混ざっても拾えるよう保険も入れる
      const url =
        resultJson?.audio?.url ||
        resultJson?.audio_file?.url ||
        resultJson?.url ||
        resultJson?.data?.audio?.url ||
        resultJson?.audios?.[0]?.url ||
        null;

      if (!url) {
        return res.status(500).json({ error: "No audio url in result", result: resultJson });
      }

      return res.status(200).json({ status: "COMPLETED", request_id: requestId, url });
    } catch (e) {
      return res.status(500).json({ error: "Server error(GET)", detail: String(e) });
    }
  }

  // POST: 生成開始（すぐ返す。待たない＝TIMEOUT回避）
  if (req.method === "POST") {
    try {
      const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
      const prompt = (body?.prompt ?? "").toString().trim();
      const duration = Number(body?.duration);

      if (!prompt) return res.status(400).json({ error: "prompt is required" });

      // seconds_total は 1〜190 4
      // UI側は 10 / 60 / 180 を渡す想定。念のためクランプ。
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
          // 品質寄り（範囲は 4〜8）5
          num_inference_steps: 8,
          guidance_scale: 1,
          sync_mode: false,
        }),
      });

      const falText = await falRes.text();
      let falJson;
      try {
        falJson = JSON.parse(falText);
      } catch {
        // "Unexpected token 'A' ..." 対策：HTMLが返ってきてもJSONで返す
        return res.status(502).json({ error: "fal returned non-JSON", raw: falText });
      }

      if (!falRes.ok) {
        return res.status(falRes.status).json({ error: "fal error", detail: falJson });
      }

      // QueueStatus: request_id が返る 6
      if (!falJson.request_id) {
        return res.status(500).json({ error: "No request_id", detail: falJson });
      }

      return res.status(200).json({
        request_id: falJson.request_id,
        status: falJson.status ?? "IN_QUEUE",
      });
    } catch (e) {
      return res.status(500).json({ error: "Server error(POST)", detail: String(e) });
    }
  }

  // その他
  return res.status(405).json({ error: "POST/GET only" });
}
