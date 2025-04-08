const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text } = req.body;
  console.log('[DEBUG] Received text:', text);

  try {
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

    // 브라우저에서 재생되도록 헤더 설정
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'inline; filename="voice.mp3"');

    // 바로 mp3 데이터를 응답
    return res.status(200).send(audioBuffer);
  } catch (error) {
    console.error('[ERROR]', error?.response?.data || error.message || error);
    return res.status(500).json({ message: 'Voice generation failed' });
  }
};
