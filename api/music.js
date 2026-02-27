export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

try{

const {prompt,duration}=req.body;

// falに送る（待たない）
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
duration:duration || 10
})
});

const data=await response.json();

// falのレスポンスそのまま返す
return res.json(data);

}catch(e){

return res.json({
error:"server error",
message:e.toString()
})

}

}
