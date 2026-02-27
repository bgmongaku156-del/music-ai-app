export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ error: "POST only" });
  }

  try {

    const body = req.body || {};
    const prompt = body.prompt || "relaxing ambient music";

    const response = await fetch(
      "https://fal.run/fal-ai/stable-audio-25/text-to-audio",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({

          prompt: prompt,

          duration_seconds: 10,

          sample_rate: 44100,   // 高音質CD品質
          steps: 50,            // 高品質生成
          cfg_scale: 7.5        // 音質安定

        })
      }
    );

    const data = await response.json();

    if (!data || !data.audio || !data.audio.url) {
      return res.status(500).json({
        error: "生成失敗",
        data: data
      });
    }

    res.status(200).json({
      url: data.audio.url
    });

  } catch (e) {

    res.status(500).json({
      error: "サーバーエラー",
      message: e.toString()
    });

  }

}
