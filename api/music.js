export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ "エラー": "POSTのみ" });
  }

  try {

    const { prompt, duration } = req.body || {};

    const response = await fetch(
      "https://fal.run/fal-ai/musicgen",
      {
        method: "POST",
        headers: {
          "Authorization": `Key ${process.env.FAL_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: prompt || "relaxing ambient music",
          duration_seconds: duration || 30
        })
      }
    );

    const data = await response.json();

    if (!data.audio) {

      return res.status(500).json({
        error:"fal error",
        data:data
      });

    }

    return res.status(200).json({
      url:data.audio.url
    });

  } catch(e){

    return res.status(500).json({
      error:e.toString()
    });

  }

}
