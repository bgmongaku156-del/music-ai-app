let running = false;

export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

if(running){

return res.json({
error:"busy",
message:"他の生成が終わるまで待ってください"
})

}

running=true;

try{

const {prompt,duration}=req.body;

const result = await fetch(
"https://fal.run/fal-ai/musicgen-small",
{
method:"POST",
headers:{
"Authorization":"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({
prompt:prompt,
duration:duration
})
});

const json=await result.json();

running=false;

if(!json.audio_url){

return res.json({
error:"fal error",
data:json
})

}

return res.json({
url:json.audio_url
})

}catch(e){

running=false;

return res.json({
error:"server error",
message:e.toString()
})

}

}
