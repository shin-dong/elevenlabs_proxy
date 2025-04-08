import { put } from '@vercel/blob';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Missing text in request body' });
  }

  try {
    // STEP 1: ElevenLabs로 TTS 요청
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

    // STEP 2: Blob에 업로드
    const blobFileName = `voices/${uuidv4()}.mp3`;
    const { url } = await put(blobFileName, audioBuffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      contentType: 'audio/mpeg'
    });

    // STEP 3: 결과 반환
    return res.status(200).json({ audioUrl: url });
  } catch (error) {
    console.error('[TTS ERROR]', error?.response?.data || error.message);
    return res.status(500).json({ message: 'Failed to generate voice' });
  }
}
