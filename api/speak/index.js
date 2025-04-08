const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID; // 예: "Nhs6CiEuKyJpYrxhZqDd"

app.post("/api/speak", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, error: "Missing text" });
  }

  try {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
      {
        text: text,
        model_id: "eleven_monolingual_v1",
        voice_settings: {
          stability: 0.4,
          similarity_boost: 0.7
        }
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json"
        },
        responseType: "arraybuffer" // binary로 받기
      }
    );

    const audioBuffer = Buffer.from(response.data, "binary");
    const audioBase64 = audioBuffer.toString("base64");

    res.status(200).json({
      success: true,
      audio_base64: audioBase64,
      mime_type: "audio/mpeg"
    });
  } catch (error) {
    console.error("TTS 호출 실패:", error.response?.data || error.message);
    res.status(500).json({ success: false, error: "Voice synthesis failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
