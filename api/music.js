export default async function handler(req,res){

try{

const prompt=
req.query.prompt||
"Energetic EDM driving music";

const reference=
"https://fal.media/files/lion/00TBS1xKM_EBH6hoS1b.mp3";

const response=await fetch(
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

const data=await response.json();

const url=
data?.audio?.url||
data?.output?.audio?.url;

res.status(200).json({
url:url
});

}catch(e){

res.status(500).json({
error:e.toString()
});

}

}
