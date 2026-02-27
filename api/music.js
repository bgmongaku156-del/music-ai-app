export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "POSTのみ" });
  }

  try {

    const { prompt = "relaxing ambient music", duration = 30 } = req.body || {};

    const response = await fetch(
      "https://fal.run/fal-ai/musicgen-small",
      {
        method: "POST",
        headers: {
          "Authorization": "Key " + process.env.FAL_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: duration
        })
      }
    );

    const data = await response.json();

    if (!data.audio?.url) {
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
