export default async function handler(req, res) {

try{

const prompt =
req.query.prompt ||
"Energetic EDM for driving";

const minutes =
parseInt(req.query.minutes || "10");

// 6秒単位
const count =
Math.floor((minutes*60)/6);


// reference音声
const reference =
"https://fal.media/files/lion/00TBS1xKM_EBH6hoS1b.mp3";


let buffers=[];


// AI生成
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

if(!url) continue;


// MP3取得
const mp3res =
await fetch(url);

const arrayBuffer =
await mp3res.arrayBuffer();


buffers.push(
Buffer.from(arrayBuffer)
);

}


// MP3結合
const merged =
Buffer.concat(buffers);


// MP3出力
res.setHeader(
"Content-Type",
"audio/mpeg"
);

res.setHeader(
"Content-Disposition",
"attachment; filename=ai-music.mp3"
);

res.send(merged);


}catch(e){

res.status(500).json({

error:e.toString()

});

}

}
