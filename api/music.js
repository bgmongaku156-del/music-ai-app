export default async function handler(req,res){

const response =
await fetch(
"https://fal.run/fal-ai/minimax-music",
{
method:"POST",

headers:{
Authorization:
"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},

body:JSON.stringify({

input:{
prompt:"lofi chill music",

reference_audio_url:
"https://fal.media/files/lion/OOTBTSlxKMH_E8H6hoSlb.mpga"
}

})

}
);

const data =
await response.json();

const url =
data?.audio?.url ||
data?.data?.audio?.url ||
data?.output?.audio?.url;

res.status(200).json({
url:url
});

}
