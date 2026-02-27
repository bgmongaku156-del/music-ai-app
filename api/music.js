export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ error: "POSTのみ" });
  }

  try {
    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: "FAL_KEY missing" });
    }

    const { prompt = "relaxing ambient music", duration = 10 } = req.body || {};
    const seconds = Math.max(5, Math.min(Number(duration) || 10, 30)); // まずは5〜30秒で安定確認

    // ★ここを切り替えて試せるようにする
    const modelsToTry = ["fal-ai/musicgen-large", "fal-ai/musicgen-medium"];

    let lastErr = null;

    for (const modelId of modelsToTry) {
      const url = `https://fal.run/${modelId}`;

      const resp = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Key ${process.env.FAL_KEY}`, // fal公式
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          // モデルによってキー名が揺れることがあるので両方送る（無視されてもOK）
          duration_seconds: seconds,
          duration: seconds,
        }),
      });

      const text = await resp.text();

      let json;
      try {
        json = JSON.parse(text);
      } catch {
        lastErr = { modelId, status: resp.status, raw: text };
        continue;
      }

      // いろんな返り方に対応して audio url を拾う
      const audioUrl =
        json?.audio?.url ||
        json?.data?.audio?.url ||
        (Array.isArray(json?.audios) ? json.audios?.[0]?.url : null) ||
        null;

      if (resp.ok && audioUrl) {
        return res.status(200).json({ url: audioUrl, model: modelId, seconds });
      }

      lastErr = { modelId, status: resp.status, json };
    }

    return res.status(500).json({
      error: "fal failed",
      lastErr,
      hint: "modelIdが違う/入力schemaが違う可能性。lastErrを見て修正します。",
    });
  } catch (e) {
    return res.status(500).json({ error: "server error", message: String(e) });
  }
}
