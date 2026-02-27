export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

try{

const {prompt,duration}=req.body;

// fal Queue API
const response = await fetch(
"https://queue.fal.run/fal-ai/musicgen",
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

// request_id返すだけ（即終了）
return res.json(data);

}catch(e){

return res.json({
error:e.toString()
})

}

}
