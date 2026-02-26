export default async function handler(req, res) {

try{

// Fal公式サンプル音源（確実に動く）
const reference =
"https://fal.media/files/lion/00TBS1xKM_EBH6hoS1b.mp3";

// プロンプト
const prompt =
req.query.prompt || "Energetic EDM driving music";

// Fal生成
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

duration: 180

})

}
);

const data = await response.json();

// URL取得
const url =
data?.audio?.url ||
data?.output?.audio?.url ||
data?.url;

if(!url){

return res.status(500).json({
error:"生成失敗",
data:data
});

}

// 成功
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
