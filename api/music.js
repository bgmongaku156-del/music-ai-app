export default async function handler(req,res){

const FAL_KEY = process.env.FAL_KEY;

if(!FAL_KEY){
return res.status(500).json({
error:"FAL_KEY missing"
});
}


// POSTのみ
if(req.method!=="POST"){
return res.status(405).json({
error:"POST only"
});
}


try{

const body =
typeof req.body==="string"
?JSON.parse(req.body)
:req.body;



// ===== 状態確認 =====

if(body.action==="status"){

const id=body.request_id;

if(!id){
return res.status(400).json({
error:"request_id required"
});
}


// ★ 直接結果取得（最安定）

const r = await fetch(

`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${id}`,

{
headers:{
Authorization:`Key ${FAL_KEY}`
}
}

);


const text=await r.text();

let j;

try{
j=JSON.parse(text);
}
catch{

return res.status(500).json({
error:"JSON error",
raw:text
});

}



// 完了チェック

const url =

j?.audio_file?.url ||

j?.audio?.url ||

j?.url ||

null;



if(!url){

return res.json({
status:"IN_PROGRESS"
});

}


return res.json({

status:"COMPLETED",

url:url

});

}



// ===== 生成開始 =====

const prompt=body.prompt;
const duration=body.duration||10;


if(!prompt){

return res.status(400).json({
error:"prompt is required"
});

}



const r = await fetch(

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

}

);


const text=await r.text();

let j;

try{
j=JSON.parse(text);
}
catch{

return res.status(500).json({
error:"fal JSON error",
raw:text
});

}



return res.json({

request_id:j.request_id

});


}catch(e){

return res.status(500).json({
error:String(e)
});

}

}
