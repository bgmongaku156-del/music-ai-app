export default async function handler(req, res) {

try {

const prompt =
req.query.prompt || "lofi chill music";

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

reference_audio_url:
"https://fal.media/files/lion/OOTBTSlxKMH_E8H6hoSlb.mpga",

duration:180

})

}
);

const data = await response.json();

const url =
data?.audio?.url ||
data?.output?.audio?.url ||
data?.url ||
null;

if(!url){

return res.status(500).json({
error:"Fal生成失敗",
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
