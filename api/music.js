export default async function handler(req, res) {

try{

// プロンプト
const prompt =
req.query.prompt || "Driving EDM music energetic";

// Fal呼び出し
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

duration: 30,

reference_audio_url:
"https://fal.media/files/lion/OOTBTSixKM_EBH6h0s1b.mp3"

})
}
);

// Fal結果
const data = await response.json();

// URL取得
const url =
data?.audio?.url ||
data?.output?.audio?.url;

// エラー
if(!url){

return res.status(500).json({
error:"Fal生成失敗",
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
