export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "POSTのみ" });
  }

  try {

    const body = req.body || {};
    const prompt = body.prompt || "relaxing ambient music";
    const duration = body.duration || 60;

    const response = await fetch(
      "https://fal.run/fal-ai/musicgen",
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

    const result = await response.json();

    if (!result.audio) {
      return res.status(500).json({
        error: "FAL error",
        result
      });
    }

    res.status(200).json({
      url: result.audio.url
    });

  } catch (e) {

    res.status(500).json({
      error: "server error",
      message: e.toString()
    });

  }

}
