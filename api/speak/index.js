const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { put } = require('@vercel/blob');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text } = req.body;
  console.log('[DEBUG] Received text:', text);

  try {
    // STEP 1: ElevenLabs TTS 호출
    const elevenResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${process.env.ELEVEN_VOICE_ID}`,
      { text },
      {
        headers: {
          'xi-api-key': process.env.ELEVEN_API_KEY,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg'
        },
        responseType: 'arraybuffer'
      }
    );

    const audioBuffer = Buffer.from(elevenResponse.data);
    const fileName = `voices/${uuidv4()}.mp3`;

    // STEP 2: Vercel Blob에 업로드 (inline 설정 포함)
    const { url } = await put(fileName, audioBuffer, {
      access: 'public',
      token: process.env.BLOBS_READ_WRITE_TOKEN,
      contentType: 'audio/mpeg',
      addContentDisposition: false // 이 설정이 inline 재생을 도와줍니다
    });

    console.log('[DEBUG] Upload successful. URL:', url);

    // STEP 3: URL을 JSON 응답으로 반환 (ChatGPT Actions 호환)
    return res.status(200).json({ audioUrl: url });

  } catch (error) {
    console.error('[ERROR]', error?.response?.data || error.message || error);
    return res.status(500).json({ message: 'Voice generation failed' });
  }
};
