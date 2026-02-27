export default async function handler(req,res){

if(req.method!=="POST"){
return res.status(405).json({error:"POST only"})
}

try{

const {prompt,duration,format}=req.body

// 出力形式
const outputFormat = format || "mp3"


// fal 高品質生成
const response=await fetch(
"https://fal.run/fal-ai/musicgen",
{

method:"POST",

headers:{
"Authorization":"Key "+process.env.FAL_KEY,
"Content-Type":"application/json"
},

body:JSON.stringify({

prompt:prompt,

duration:duration,

model:"musicgen-large",

// WAVまたはMP3
format: outputFormat,

// 高品質設定
temperature:0.7,
top_k:250,
top_p:0.95

})

})

const data=await response.json()

const audioUrl=data.audio.url


// 音声取得
const audioRes=await fetch(audioUrl)

const buffer=await audioRes.arrayBuffer()


// WAVならCD品質
if(outputFormat==="wav"){

res.setHeader("Content-Type","audio/wav")

}else{

// MP3 320kbps想定
res.setHeader("Content-Type","audio/mpeg")

}

res.send(Buffer.from(buffer))


}catch(e){

res.status(500).json({
error:"生成失敗"
})

}

}
