export default async function handler(req, res) {

 if (req.method !== "POST") {
   return res.status(405).json({ error: "POST only" });
 }

 try {

   const { prompt, duration } = req.body;

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
         duration_seconds: duration
       })
     }
   );

   const data = await response.json();

   return res.status(200).json({
     url: data.audio.url
   });

 } catch (e) {

   return res.status(500).json({
     error: "生成失敗"
   });

 }

}
