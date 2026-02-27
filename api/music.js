export default async function handler(req,res){

const FAL_KEY=process.env.FAL_KEY;

if(!FAL_KEY){

return res.status(500).json({
error:"FAL_KEY missing"
});

}


if(req.method!=="POST"){

return res.status(405).json({
error:"POST only"
});

}



try{

const body=
typeof req.body==="string"
?JSON.parse(req.body)
:req.body;



// ===== status確認 =====

if(body.action==="status"){

const requestId=body.request_id;

if(!requestId){

return res.status(400).json({
error:"request_id required"
});

}



// status取得（正しいURL）

const statusRes=await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}/status`,

{
headers:{
Authorization:`Key ${FAL_KEY}`
}
}
);


const statusText=await statusRes.text();


let statusJson;

try{
statusJson=JSON.parse(statusText);
}
catch{

return res.status(500).json({
error:"status JSON error",
raw:statusText
});

}



// 未完成

if(statusJson.status!=="COMPLETED"){

return res.json({

status:statusJson.status,

queue_position:statusJson.queue_position

});

}



// 完了 → 取得

const resultRes=await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}`,

{
headers:{
Authorization:`Key ${FAL_KEY}`
}
}
);


const resultText=await resultRes.text();


let resultJson;

try{
resultJson=JSON.parse(resultText);
}
catch{

return res.status(500).json({
error:"result JSON error",
raw:resultText
});

}



const url=

resultJson.audio_file?.url||
resultJson.audio?.url||
null;



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

num_inference_steps:4

})

});


const falText=await falRes.text();


let falJson;

try{
falJson=JSON.parse(falText);
}
catch{

return res.status(500).json({
error:"fal JSON error",
raw:falText
});

}


return res.json({

request_id:falJson.request_id

});


}catch(e){

return res.status(500).json({
error:String(e)
});

}

}
