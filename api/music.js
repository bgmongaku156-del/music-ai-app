export default async function handler(req, res) {

try{

// 参考音源（必須）
const reference =
"https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8e0c1f3c2.mp3";

// プロンプト
const prompt =
req.query.prompt || "EDM driving music";

// Fal API
const response = await fetch(
"https://fal.run/fal-ai/minimax-music",
{
method:"POST",

headers:{
Authorization:"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},

body:JSON.stringify({

prompt: prompt,

reference_audio_url: reference,

duration: 600

})

}
);

const data = await response.json();

const url =
data?.audio?.url ||
data?.output?.audio?.url;

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
