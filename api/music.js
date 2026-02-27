export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

try{

const body=req.body || {};

const prompt=body.prompt || "relaxing ambient music";

// ★まずは短時間生成（Timeout回避）
const duration=Math.min(body.duration || 10,10);


// falに送る（最速レスポンス）
const response=await fetch(
"https://fal.run/fal-ai/musicgen",
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

// ★レスポンス待機を最小化
const text=await response.text();

return res.send(text);

}catch(e){

return res.json({
error:"server error",
message:e.toString()
})

}

}
