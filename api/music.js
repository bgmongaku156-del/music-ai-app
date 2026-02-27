let running = false;

export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

// 同時生成防止（fal制限回避）
if(running){

return res.json({
error:"busy",
message:"生成中です。終わるまで待ってください"
})

}

running=true;

try{

const {prompt,duration}=req.body;

const response = await fetch(
"https://fal.run/fal-ai/musicgen",
{
method:"POST",

headers:{
"Authorization":"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},

body:JSON.stringify({

prompt:prompt || "relaxing ambient music",

duration: duration || 10

})

});

const data=await response.json();

running=false;

if(!data.audio){

return res.json({
error:"fal error",
data:data
})

}

return res.json({
url:data.audio.url
})

}catch(e){

running=false;

return res.json({
error:"server error",
message:e.toString()
})

}

}
