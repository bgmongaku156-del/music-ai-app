export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {

    const { prompt, duration } = req.body;

    if (!process.env.FAL_KEY) {
      return res.status(500).json({
        error: "FAL_KEY missing"
      });
    }

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
          duration: duration || 10
        })
      }
    );

    const data = await response.json();

    if (!data.audio) {
      return res.status(500).json({
        error: "Fal failed",
        data: data
      });
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
