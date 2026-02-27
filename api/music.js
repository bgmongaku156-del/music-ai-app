export default async function handler(req, res) {

const FAL_KEY = process.env.FAL_KEY;

if (!FAL_KEY) {
return res.status(500).json({
error:"Server misconfigured",
detail:"FAL_KEY is missing"
});
}


////////////////////////////////////////////////////
//// GET 状態確認
////////////////////////////////////////////////////

if(req.method==="GET"){

const requestId=req.query.request_id;

if(!requestId)
return res.status(400).json({
error:"request_id is required"
});

try{

const statusRes=await fetch(
`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}/status`,
{
headers:{
Authorization:`Key ${FAL_KEY}`
}
});

const statusJson=await statusRes.json();


// 完了してない
if(statusJson.status!=="COMPLETED"){

return res.status(200).json({

status:statusJson.status,

request_id:requestId,

queue_position:statusJson.queue_position||0

});

}



// 完成データ取得

const resultRes=await fetch(
`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}`,
{
headers:{
Authorization:`Key ${FAL_KEY}`
}
});

const resultJson=await resultRes.json();


// URL検出（完全対応）

const url=

resultJson?.audio?.url ||

resultJson?.audio_file?.url ||

resultJson?.url ||

resultJson?.data?.audio?.url ||

resultJson?.audios?.[0]?.url ||

null;


if(!url){

return res.status(500).json({
error:"No audio url",
result:resultJson
});

}


return res.status(200).json({

status:"COMPLETED",

request_id:requestId,

url:url

});


}catch(e){

return res.status(500).json({

error:"Server error(GET)",

detail:String(e)

});

}

}


////////////////////////////////////////////////////
//// POST 生成開始
////////////////////////////////////////////////////

if(req.method==="POST"){

try{

const body=
typeof req.body==="string"
?JSON.parse(req.body)
:req.body;


const prompt=(body?.prompt||"").trim();

let seconds_total=Math.round(body?.duration||10);


// 制限
if(seconds_total<1)seconds_total=1;

if(seconds_total>190)seconds_total=190;


////////////////////////////////////////////////////
//// ★ 高速Queue設定
////////////////////////////////////////////////////

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

seconds_total:seconds_total,


//// ★ 最速設定

num_inference_steps:4,

guidance_scale:1,


//// ★ Queue高速化

scheduler:"euler",

sync_mode:false


})

});


const falJson=await falRes.json();


if(!falJson.request_id){

return res.status(500).json({

error:"No request_id",

detail:falJson

});

}


return res.status(200).json({

request_id:falJson.request_id,

status:falJson.status||"IN_QUEUE"

});


}catch(e){

return res.status(500).json({

error:"Server error(POST)",

detail:String(e)

});

}

}


////////////////////////////////////////////////////
//// その他
////////////////////////////////////////////////////

return res.status(405).json({

error:"POST/GET only"

});


}
