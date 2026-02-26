export default async function handler(req,res){

if(req.method !== "POST"){
return res.status(405).json({error:"POST only"})
}

try{

const body =
typeof req.body==="string"
? JSON.parse(req.body)
: req.body

const prompt =
body?.prompt || "sleep relaxing music"

const minutes =
body?.minutes || 5

// 最大制限（安定用）
const maxParts = 8

// 30秒単位生成
let parts = Math.ceil(minutes*60/30)

// 制限
if(parts>maxParts){
parts=maxParts
}

let urls=[]

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

const d=await r.json()

const url=
d?.audio_url ||
d?.audio?.url ||
d?.url ||
null

if(url){
urls.push(url)
}

}

// 最低1個必要
if(urls.length===0){

return res.json({
error:"生成失敗"
})

}

res.json({
urls:urls
})

}catch(e){

res.json({
error:String(e)
})

}

}
