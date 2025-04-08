import { useState } from 'react'
import axios from 'axios'

export default function Home() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    try {
      // 1. GPT 요청
      const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: input }],
        }),
      })

      const gptData = await gptRes.json()
      const message = gptData.choices[0].message.content
      console.log('GPT:', message)

      // 2. TTS 요청
      const ttsRes = await axios.post('/api/speak', { text: message })
      const { audioUrl } = ttsRes.data

      // 3. 음성 재생
      const audio = new Audio(audioUrl)
      audio.play()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setInput('')
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>🎙️ GPT 영어 대화</h1>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Say something..."
        style={{ width: '300px', padding: 10 }}
      />
      <button onClick={handleSubmit} disabled={loading} style={{ marginLeft: 10 }}>
        {loading ? 'Loading...' : 'Send'}
      </button>
    </main>
  )
}
