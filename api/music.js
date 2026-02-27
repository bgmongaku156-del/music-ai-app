export default async function handler(req,res){

const FAL_KEY=process.env.FAL_KEY;

if(!FAL_KEY){

return res.status(500).json({

error:"FAL_KEY missing"

});

}


////////////////////////////////////
//// 同時生成防止（永久対策）
////////////////////////////////////

if(!global.generating){

global.generating=false;

}



////////////////////////////////////
//// GET 状態確認
////////////////////////////////////

if(req.method==="GET"){

const requestId=req.query.request_id;

if(!requestId){

return res.status(400).json({

error:"request_id required"

});

}

try{


const statusRes=await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}/status`,

{

headers:{
Authorization:`Key ${FAL_KEY}`
}

});


const statusJson=await statusRes.json();


// 完成前

if(statusJson.status!=="COMPLETED"){

return res.status(200).json({

status:statusJson.status,

queue:statusJson.queue_position||0,

request_id:requestId

});

}


// 完成取得


const resultRes=await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${requestId}`,

{

headers:{
Authorization:`Key ${FAL_KEY}`
}

});


const resultJson=await resultRes.json();


// URL検出


const url=

resultJson?.audio?.url||

resultJson?.audio_file?.url||

resultJson?.url||

resultJson?.data?.audio?.url||

resultJson?.audios?.[0]?.url||

null;


if(!url){

return res.status(500).json({

error:"no audio url",

result:resultJson

});

}


return res.status(200).json({

status:"COMPLETED",

url:url,

request_id:requestId

});


}catch(e){

return res.status(500).json({

error:String(e)

});

}

}



////////////////////////////////////
//// POST 生成開始
////////////////////////////////////

if(req.method==="POST"){


//// 同時生成防止

if(global.generating){

return res.status(429).json({

error:"already generating"

});

}


global.generating=true;


try{

const body=
typeof req.body==="string"
?JSON.parse(req.body)
:req.body;


const prompt=(body?.prompt||"music").trim();

let seconds_total=Math.round(body?.duration||10);


// 制限

if(seconds_total<1)seconds_total=1;

if(seconds_total>190)seconds_total=190;



////////////////////////////////////
//// Stable Audio 高速設定
////////////////////////////////////


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


// 高速設定

num_inference_steps:4,

guidance_scale:1,

scheduler:"euler",

sync_mode:false

})

});


const falJson=await falRes.json();


global.generating=false;


if(!falJson.request_id){

return res.status(500).json({

error:"no request_id",

detail:falJson

});

}


return res.status(200).json({

request_id:falJson.request_id,

status:falJson.status||"IN_QUEUE"

});


}catch(e){

global.generating=false;

return res.status(500).json({

error:String(e)

});

}

}



////////////////////////////////////
//// その他
////////////////////////////////////

return res.status(405).json({

error:"POST/GET only"

});

}
