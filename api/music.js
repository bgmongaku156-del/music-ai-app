export default async function handler(req, res) {

if (req.method !== "POST") {
return res.status(405).json({ error: "POST only" })
}

try {

const body =
typeof req.body === "string"
? JSON.parse(req.body)
: req.body

const prompt = body?.prompt || "lofi background music"

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
duration: 30
})
}
)

const data = await response.json()

// falの返り値パターン全部対応
let audioUrl = null

if (data?.audio?.url) {
audioUrl = data.audio.url
}

if (!audioUrl && data?.audio_url) {
audioUrl = data.audio_url
}

if (!audioUrl && data?.outputs?.[0]?.audio?.url) {
audioUrl = data.outputs[0].audio.url
}

if (!audioUrl) {
console.log("fal response:", data)
return res.status(500).json({ error: "音声URL取得失敗" })
}

// ここは今まで通り
return res.json({ url: audioUrl })

} catch (err) {

console.log("server error:", err)
return res.status(500).json({ error: "サーバーエラー" })

}

}
