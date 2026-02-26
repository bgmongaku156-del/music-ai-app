export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});

    const prompt = body.prompt || "relaxing sleep music calm ambient no vocals";
    // Stable Audio 2.5 は長尺に弱いので 190 秒上限で安全運用
    const seconds = Math.max(5, Math.min(190, Number(body.seconds || 190)));

    const r = await fetch("https://fal.run/fal-ai/stable-audio-25/text-to-audio", {
      method: "POST",
      headers: {
        "Authorization": "Key f933e32d-5cca-4096-b475-daf56cffc456:241d754d74bcb80c66ad18a9a3dc20c5",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        prompt,
        seconds_total: seconds
      })
    });

    const data = await r.json();

    // docs上は audio が返る（URL文字列 or Fileオブジェクトの可能性があるので両対応）
    const url =
      (typeof data?.audio === "string" ? data.audio : data?.audio?.url) ||
      data?.audio_url ||
      data?.url ||
      null;

    if (!url) {
      return res.status(500).json({ error: "no audio url", debug: data });
    }

    return res.status(200).json({ url, seconds });
  } catch (e) {
    return res.status(500).json({ error: "server error", message: String(e) });
  }
}
