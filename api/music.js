export default async function handler(req,res){

if(req.method!=="POST"){
return res.json({error:"POST only"})
}

try{

const body=req.body || {};

const prompt = body.prompt || "relaxing ambient music";

// ★ Stable Audioは seconds を使う
const seconds = body.duration || 30;


// Stable Audio呼び出し
const response = await fetch(
"https://fal.run/fal-ai/stable-audio",
{
method:"POST",

headers:{
"Authorization":"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},

body:JSON.stringify({

prompt:prompt,

seconds:seconds

})

});


// JSONでもHTMLでも安全
const text = await response.text();

let data;

try{
data = JSON.parse(text);
}catch{
return res.json({
error:text
})
}


// そのまま返す（機能維持）
return res.json(data);


}catch(e){

return res.json({
error:e.toString()
})

}

}
