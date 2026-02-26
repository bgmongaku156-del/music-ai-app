export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({ error: "POST only" })
}

try {

const body =
typeof req.body === "string"
? JSON.parse(req.body)
: req.body

const prompt = body?.prompt || "relaxing music"

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
duration: 20
})
}
)

const result = await response.json()

console.log("FAL RESULT:", result)

// falの正式音声URL
let audioUrl = null

if(result.audio && result.audio.url){
audioUrl = result.audio.url
}

if(result.audio_url){
audioUrl = result.audio_url
}

if(result.url){
audioUrl = result.url
}

if(!audioUrl){
return res.json({
error:"音声URL取得失敗",
debug: result
})
}

return res.json({
url: audioUrl
})

}catch(err){

return res.json({
error:"サーバーエラー",
message:String(err)
})

}

}
