export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"POST only"})
}

try{

const body =
typeof req.body === "string"
? JSON.parse(req.body)
: req.body

const prompt =
body?.prompt || "sleep music"

const minutes =
body?.minutes || 5

// 30秒単位で生成
const parts = minutes * 2

let urls = []

for(let i=0;i<parts;i++){

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
duration:30
})
}
)

const d = await r.json()

const url =
d?.audio_url ||
d?.audio?.url ||
d?.url ||
null

if(url){
urls.push(url)
}

}

// URL配列返す
res.json({
urls:urls
})

}catch(e){

res.json({
error:String(e)
})

}

}
