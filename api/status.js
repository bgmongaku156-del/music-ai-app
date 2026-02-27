export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(200).json({ error: "GET only" });
  }

  try {
    if (!process.env.FAL_KEY) {
      return res.status(500).json({ error: "FAL_KEY missing" });
    }

    const request_id = (req.query.request_id || "").toString().trim();
    if (!request_id) {
      return res.status(400).json({ error: "request_id missing" });
    }

    const modelPath = "fal-ai/stable-audio-25/text-to-audio";

    // 1) status確認
    const statusUrl = `https://queue.fal.run/${modelPath}/requests/${request_id}/status`;
    const sr = await fetch(statusUrl, {
      headers: { Authorization: `Key ${process.env.FAL_KEY}` },
    });

    const stText = await sr.text();
    let st;
    try {
      st = JSON.parse(stText);
    } catch {
      return res.status(500).json({ error: "fal status non-json", raw: stText });
    }

    const status = st.status || st?.data?.status || "UNKNOWN";

    if (status !== "COMPLETED") {
      // まだ完成してない
      return res.status(200).json({ status, request_id });
    }

    // 2) result取得（COMPLETEDならここはすぐ返る）
    const resultUrl = `https://queue.fal.run/${modelPath}/requests/${request_id}`;
    const rr = await fetch(resultUrl, {
      headers: { Authorization: `Key ${process.env.FAL_KEY}` },
    });

    const rtText = await rr.text();
    let result;
    try {
      result = JSON.parse(rtText);
    } catch {
      return res.status(500).json({ error: "fal result non-json", raw: rtText });
    }

    // Stable Audio 2.5 (fal-ai/stable-audio-25/text-to-audio) は outputが { audio: "URL" } 3
    // 以前あなたが使ってた stable-audio系は { audio_file: { url } } だったので両対応
    const url =
      result?.audio ||
      result?.data?.audio ||
      result?.audio_file?.url ||
      result?.data?.audio_file?.url ||
      null;

    if (!url) {
      return res.status(500).json({ error: "no audio url", status, result });
    }

    return res.status(200).json({ status, request_id, url });
  } catch (e) {
    return res.status(500).json({ error: "server error", message: String(e) });
  }
}
