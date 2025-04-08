const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

const ELEVEN_API_KEY = process.env.ELEVEN_API_KEY;
const VOICE_ID = "Nhs6CiEuKyJpYrxhZqDd";

app.post("/api/speak", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "Missing text" });
  }

  try {
    // 원래는 여기서 음성 요청 보내는 코드가 있지만,
    // 테스트용이므로 실제 요청 생략

    console.log("Received text:", text);
    
    // GPT 테스트용 JSON 응답
    res.json({
      message: "TTS request received successfully!",
      text: text,
      status: "ok"
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Voice synthesis failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
