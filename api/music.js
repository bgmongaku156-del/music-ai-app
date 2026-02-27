export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(200).json({ error: "POSTのみ" });
  }

  try {

    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: "FAL_KEY missing" });
    }

    const { prompt = "relaxing ambient music", duration = 10 } = req.body || {};

    const seconds = Math.max(5, Math.min(duration, 30));

    // 正しいMusicGenモデル
    const url = "https://fal.run/fal-ai/musicgen";

    const response = await fetch(url,{
      method:"POST",
      headers:{
        "Authorization":`Key ${process.env.FAL_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        prompt:prompt,
        duration:seconds
      })
    });

    const data = await response.json();

    if(!response.ok){

      return res.status(500).json({
        error:"fal error",
        data:data
      });

    }

    const audioUrl =
      data?.audio?.url ||
      data?.data?.audio?.url ||
      data?.audios?.[0]?.url;

    if(!audioUrl){

      return res.status(500).json({
        error:"audio not found",
        data:data
      });

    }

    res.status(200).json({
      url:audioUrl
    });

  } catch(e){

    res.status(500).json({
      error:"server error",
      message:String(e)
    });

  }

}
