export default async function handler(req, res) {

try{

const prompt =
req.query.prompt ||
"Energetic EDM for driving, powerful beat";


// 10分 = 600秒
// 6秒曲を100個生成
const count = 100;


// reference（安定）
const reference =
"https://fal.media/files/lion/00TBS1xKM_EBH6hoS1b.mp3";


let urls = [];


for(let i=0;i<count;i++){

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

duration:6

})

}
);

const data = await response.json();

const url =
data?.audio?.url ||
data?.output?.audio?.url;

if(url){

urls.push(url);

}

}


// URL一覧返す
res.status(200).json({

ok:true,

list:urls

});


}catch(e){

res.status(500).json({

error:e.toString()

});

}

}
