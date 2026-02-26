export default async function handler(req,res){

if(req.method!=="POST"){
return res.status(200).json({error:"POST only"})
}

try{

const body =
typeof req.body==="string"
? JSON.parse(req.body)
: req.body

const prompt =
body?.prompt || "relaxing sleep music"

// 1回だけ生成（安定）
const r = await fetch(
"https://fal.run/fal-ai/musicgen-small",
{
method:"POST",
headers:{
"Authorization":
"Key f933e32d-5cca-4096-b475-daf56cffc456:241d754d74bcb80c66ad18a9a3dc20c5",
"Content-Type":"application/json"
},
body:JSON.stringify({
prompt:prompt,
duration:20
})
}
)

const d = await r.json()

const url =
d?.audio_url ||
d?.audio?.url ||
d?.url ||
null

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
