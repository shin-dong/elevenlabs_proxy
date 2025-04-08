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

    const { url } = await put(fileName, audioBuffer, {
      access: 'public',
      token: process.env.BLOBS_READ_WRITE_TOKEN,
      contentType: 'audio/mpeg'
    });

    console.log('[DEBUG] Upload successful. URL:', url);
    return res.status(200).json({ audioUrl: url });
  } catch (error) {
    console.error('[ERROR]', error?.response?.data || error.message || error);
    return res.status(500).json({ message: 'Voice generation failed' });
  }
};
