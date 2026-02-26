export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

try{

const body =
typeof req.body==="string"
? JSON.parse(req.body)
: req.body

const prompt =
body?.prompt || "relaxing ambient sleep music"

// 最短で安定する長さ
const seconds = 5

const r = await fetch(
"https://fal.run/fal-ai/stable-audio-25/text-to-audio",
{
method:"POST",
headers:{
"Authorization":
"Key f933e32d-5cca-4096-b475-daf56cffc456:241d754d74bcb80c66ad18a9a3dc20c5",
"Content-Type":"application/json"
},
body:JSON.stringify({
prompt:prompt,
seconds_total:seconds
})
}
)

const d = await r.json()

const url =
typeof d.audio==="string"
? d.audio
: d.audio?.url

if(!url){

return res.json({
error:"生成失敗",
debug:d
})

}

return res.json({
url:url
})

}catch(e){

return res.json({
error:String(e)
})

}

}
