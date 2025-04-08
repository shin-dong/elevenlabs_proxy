const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = process.env.ELEVEN_VOICE_ID;

app.post("/api/speak", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ success: false, error: "Missing text" });
  }

  try {
    // 실제 ElevenLabs 호출은 생략 (테스트용)
    console.log("GPT 요청 수신됨:", text);

    res.status(200).json({
      success: true,
      message: "TTS request received successfully!",
      receivedText: text,
      voiceId: VOICE_ID // 확인용으로 포함
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, error: "Voice synthesis failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
