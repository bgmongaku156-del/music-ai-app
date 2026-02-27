export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ "エラー": "POSTのみ" });
  }

  try {

    const { prompt, duration } = req.body || {};

    if (!prompt) {
      return res.status(400).json({ error: "prompt required" });
    }

    const seconds = duration || 60;

    const response = await fetch(
      "https://fal.run/fal-ai/musicgen",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt,
          duration: seconds
        })
      }
    );

    const data = await response.json();

    if (!data.audio) {
      return res.status(500).json(data);
    }

    res.status(200).json({
      url: data.audio.url
    });

  } catch (e) {

    res.status(500).json({
      error: e.toString()
    });

  }
}
