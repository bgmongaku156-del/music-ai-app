export default async function handler(req,res){

if(req.method !== "POST"){

res.status(405).json({error:"POST only"})
return

}

try{

const body =
typeof req.body === "string"
? JSON.parse(req.body)
: req.body

const prompt =
body?.prompt || "lofi music"

const r = await fetch(
"https://fal.run/fal-ai/musicgen-small",

{
method:"POST",

headers:{
"Authorization":
"Key " + process.env.FAL_KEY,

"Content-Type":
"application/json"
},

body:JSON.stringify({

prompt:prompt,
duration:30

})

})

const data = await r.json()

if(data.audio_url){

res.json({
url:data.audio_url
})

}else{

res.json({
error:data
})

}

}catch(e){

res.json({
error:String(e)
})

}

}
