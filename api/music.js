export default async function handler(req, res) {

try{

// 長めのreference音源（安定）
const reference =
"https://fal.media/files/lion/00TBS1xKM_EBH6hoS1b.mp3";

const prompt =
req.query.prompt ||
"Energetic EDM for driving, powerful beat, long mix";

// 180秒（3分）
const duration = 180;

const response = await fetch(
"https://fal.run/fal-ai/minimax-music",
{
method:"POST",
headers:{
Authorization:"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({

prompt:prompt,

reference_audio_url:reference,

duration:duration

})
}
);

const data = await response.json();

const url =
data?.audio?.url ||
data?.output?.audio?.url;

if(!url){

return res.status(500).json({
error:"生成失敗",
data:data
});

}

res.status(200).json({
ok:true,
url:url
});

}catch(e){

res.status(500).json({
error:e.toString()
});

}

}
