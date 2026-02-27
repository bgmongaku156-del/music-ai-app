export default async function handler(req, res) {

const FAL_KEY = process.env.FAL_KEY;

if(!FAL_KEY){
return res.status(500).json({
error:"FAL_KEY missing"
});
}


// ========= GET (状態確認)

if(req.method==="GET"){

const id=req.query.request_id;

if(!id){
return res.status(400).json({
error:"request_id required"
});
}

try{

const r=await fetch(
`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${id}/status`,
{
headers:{
Authorization:`Key ${FAL_KEY}`
}
}
);

const t=await r.text();

let j;

try{
j=JSON.parse(t);
}catch{
return res.status(500).json({
error:"Status JSON error",
raw:t
});
}


if(j.status!=="COMPLETED"){

return res.json({
status:j.status,
request_id:id
});

}


const r2=await fetch(
`https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio/requests/${id}`,
{
headers:{
Authorization:`Key ${FAL_KEY}`
}
}
);

const t2=await r2.text();

let j2;

try{
j2=JSON.parse(t2);
}catch{
return res.status(500).json({
error:"Result JSON error",
raw:t2
});
}


const url=

j2.audio?.url ||
j2.audio_file?.url ||
j2.url ||
null;


if(!url){

return res.status(500).json({
error:"No audio URL",
data:j2
});
}


return res.json({
status:"COMPLETED",
url:url
});


}catch(e){

return res.status(500).json({
error:"GET error",
detail:String(e)
});

}

}



// ========= POST (生成開始)

if(req.method==="POST"){

try{

const body=req.body;

const prompt=body.prompt||"music";

let seconds=Math.round(body.duration||10);

if(seconds<1)seconds=1;
if(seconds>180)seconds=180;


const r=await fetch(
"https://queue.fal.run/fal-ai/stable-audio-25/text-to-audio",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Key ${FAL_KEY}`
},
body:JSON.stringify({
prompt:prompt,
seconds_total:seconds
})
}
);


const t=await r.text();

let j;

try{
j=JSON.parse(t);
}catch{
return res.status(500).json({
error:"POST JSON error",
raw:t
});
}


if(!j.request_id){

return res.status(500).json({
error:"No request_id",
data:j
});
}


return res.json({
request_id:j.request_id,
status:"IN_QUEUE"
});


}catch(e){

return res.status(500).json({
error:"POST error",
detail:String(e)
});

}

}


return res.status(405).json({
error:"POST or GET only"
});

}
