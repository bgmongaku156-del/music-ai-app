export default async function handler(req,res){

const FAL_KEY=process.env.FAL_KEY;

if(!FAL_KEY){

return res.status(500).json({

error:"FAL_KEY missing"

});

}



// =====POSTのみ=====

if(req.method!=="POST"){

return res.status(405).json({

error:"POST only"

});

}



try{

const body=
typeof req.body==="string"
? JSON.parse(req.body)
:req.body;



// =====status確認=====

if(body.action==="status"){

const requestId=body.request_id;

if(!requestId){

return res.status(400).json({

error:"request_id required"

});

}



// status取得

const statusRes=await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}/status`,

{

headers:{
Authorization:`Key ${FAL_KEY}`
}

});



const statusText=await statusRes.text();



let statusJson;

try{
statusJson=JSON.parse(statusText);
}
catch{

return res.status(500).json({

error:"ステータス JSON エラー",

raw:statusText

});

}



// 完了していない

if(statusJson.status!=="COMPLETED"){

return res.json({

status:statusJson.status,

queue_position:statusJson.queue_position

});

}



// 完了→取得

const resultRes=await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}`,

{

headers:{
Authorization:`Key ${FAL_KEY}`
}

});



const resultText=await resultRes.text();


let resultJson;

try{
resultJson=JSON.parse(resultText);
}
catch{

return res.status(500).json({

error:"結果 JSON エラー",

raw:resultText

});

}



const url=

resultJson?.audio?.url ||

resultJson?.audio_file?.url ||

resultJson?.url ||

null;



if(!url){

return res.status(500).json({

error:"音声URL無し",

result:resultJson

});

}



return res.json({

status:"COMPLETED",

url:url

});

}



// =====生成開始=====

const prompt=body.prompt;

const duration=body.duration||10;


if(!prompt){

return res.status(400).json({

error:"prompt is required"

});

}



// StableAudio生成

const falRes=await fetch(

"https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio",

{

method:"POST",

headers:{
"Content-Type":"application/json",
Authorization:`Key ${FAL_KEY}`
},

body:JSON.stringify({

prompt:prompt,

seconds_total:duration,

num_inference_steps:4,
guidance_scale:1

})

});



const falText=await falRes.text();



let falJson;

try{
falJson=JSON.parse(falText);
}
catch{

return res.status(500).json({

error:"fal JSON エラー",

raw:falText

});

}



if(!falJson.request_id){

return res.status(500).json({

error:"request_id無し",

data:falJson

});

}



return res.json({

request_id:falJson.request_id,

status:"IN_QUEUE"

});



}catch(e){

return res.status(500).json({

error:String(e)

});

}


}
