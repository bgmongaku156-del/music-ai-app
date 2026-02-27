export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

try{

const body=req.body||{}

const prompt=
body.prompt||
"relaxing ambient music"

// 分割回数
const parts=18

let urls=[]

for(let i=0;i<parts;i++){

const r=await fetch(
"https://fal.run/fal-ai/stable-audio-25/text-to-audio",
{
method:"POST",
headers:{
"Authorization":`Key ${process.env.FAL_KEY}`,
"Content-Type":"application/json"
},
body:JSON.stringify({

prompt:prompt,

seconds_total:10,

sample_rate:44100

})
}
)

const d=await r.json()

const url=
typeof d.audio==="string"
? d.audio
: d.audio?.url

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
