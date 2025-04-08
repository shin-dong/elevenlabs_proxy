const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const { put } = require("@vercel/blob");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;
const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

app.post("/api/speak", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    // Step 1: ElevenLabs TTS 요청
    const response = await axios({
      method: "POST",
      url: `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_API_KEY,
      },
      data: {
        text: text,
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7,
        },
      },
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);
    const fileName = `voices/${uuidv4()}.mp3`;

    // Step 2: Blob 업로드
    const { url } = await put(fileName, buffer, {
      access: "public",
      contentType: "audio/mpeg",
      token: BLOB_TOKEN,
    });

    // Step 3: URL 응답
    res.status(200).json({ audioUrl: url });
  } catch (error) {
    console.error("Voice generation error:", error?.response?.data || error.message);
    res.status(500).json({ error: "Voice synthesis failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
