export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ message: "POSTのみ" });
  }

  try {

    const body = req.body || {};
    const prompt = body.prompt || "relaxing ambient music";
    const duration = body.duration || 30;

    const response = await fetch(
      "https://fal.run/fal-ai/musicgen-small",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: duration
        })
      }
    );

    const result = await response.json();

    if (!result.audio || !result.audio.url) {
      return res.status(500).json({
        error: "fal error",
        result
      });
    }

    return res.status(200).json({
      url: result.audio.url
    });

  } catch (e) {

    return res.status(500).json({
      error: "server error",
      message: e.toString()
    });

  }

}
