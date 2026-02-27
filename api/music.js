export default async function handler(req, res) {

if(req.method !== "POST"){
return res.status(405).json({error:"POST only"});
}

try{

const {prompt,duration} = req.body;

if(!prompt){
return res.status(400).json({error:"No prompt"});
}

// fal API
const response = await fetch(
"https://fal.run/fal-ai/musicgen",
{
method:"POST",

headers:{
"Content-Type":"application/json",
"Authorization":"Key " + process.env.FAL_KEY
},

body:JSON.stringify({

prompt:prompt,

duration_seconds:duration || 60,

format:"wav"

})
});

const result = await response.json();

if(!result.audio?.url){

return res.status(500).json({
error:"fal error",
data:result
});

}

return res.json({

url:result.audio.url

});


}catch(e){

return res.status(500).json({

error:"server error",
message:e.toString()

});

}

}
