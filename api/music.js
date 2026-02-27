import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ error: "POST only" });
  }

  try {
    const body =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
    const prompt = body.prompt || "relaxing sleep ambient music no vocals";
    const seconds_total = 5; // ← まずは確実に動く5秒固定

    const result = await fal.subscribe("fal-ai/stable-audio-25/text-to-audio", {
      input: { prompt, seconds_total },
      logs: true,
    });

    // 返り値はモデルで揺れるので全部対応
    const data = result?.data || result;
    const url =
      data?.audio?.url ||
      data?.audio_url ||
      data?.url ||
      data?.output?.audio?.url ||
      null;

    if (!url) {
      return res.status(500).json({ error: "no audio url", debug: data });
    }

    return res.status(200).json({ url });
  } catch (e) {
    return res.status(500).json({ error: "server error", message: String(e) });
  }
}
