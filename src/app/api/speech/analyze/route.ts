import { NextRequest, NextResponse } from 'next/server'

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

interface Word {
  text: string
  start: number
  end: number
  confidence: number
}

interface AssemblyAIResponse {
  id: string
  status: 'queued' | 'processing' | 'completed' | 'error'
  words?: Word[]
  error?: string
}

export async function POST(request: NextRequest) {
  if (!ASSEMBLYAI_API_KEY) {
    return NextResponse.json(
      { error: 'Speech API not configured' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as Blob

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Step 1: Upload audio to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
      },
      body: audioFile,
    })

    const { upload_url } = await uploadResponse.json()

    // Step 2: Request transcription with word-level timestamps
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        authorization: ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_code: 'en',
      }),
    })

    const transcript = await transcriptResponse.json()
    const transcriptId = transcript.id

    // Step 3: Poll for completion
    let result: AssemblyAIResponse
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            authorization: ASSEMBLYAI_API_KEY,
          },
        }
      )

      result = await pollingResponse.json()

      if (result.status === 'completed' || result.status === 'error') {
        break
      }

      // Wait 1 second before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000))
      attempts++
    }

    if (result!.status === 'error') {
      return NextResponse.json(
        { error: result!.error || 'Transcription failed' },
        { status: 500 }
      )
    }

    if (result!.status !== 'completed' || !result!.words) {
      return NextResponse.json(
        { error: 'Transcription timed out or incomplete' },
        { status: 500 }
      )
    }

    // Step 4: Calculate timing metrics from word timestamps
    const words = result!.words
    const wordCount = words.length

    if (wordCount === 0) {
      return NextResponse.json({
        wordCount: 0,
        wordsPerMinute: 0,
        pauseCount: 0,
        averagePauseDuration: 0,
        pauses: [],
      })
    }

    // Calculate pauses (gaps between words)
    const pauses: number[] = []
    for (let i = 0; i < words.length - 1; i++) {
      const currentWordEnd = words[i].end
      const nextWordStart = words[i + 1].start
      const pauseDuration = (nextWordStart - currentWordEnd) * 1000 // Convert to ms

      // Only count pauses > 100ms to filter out natural speech flow
      if (pauseDuration > 100) {
        pauses.push(pauseDuration)
      }
    }

    // Calculate words per minute
    const totalDuration = words[words.length - 1].end - words[0].start // in seconds
    const wordsPerMinute = totalDuration > 0 ? (wordCount / totalDuration) * 60 : 0

    // Calculate average pause duration
    const averagePauseDuration =
      pauses.length > 0
        ? pauses.reduce((sum, pause) => sum + pause, 0) / pauses.length
        : 0

    // Return only timing metrics (no transcript text)
    return NextResponse.json({
      wordCount,
      wordsPerMinute: Math.round(wordsPerMinute * 10) / 10,
      pauseCount: pauses.length,
      averagePauseDuration: Math.round(averagePauseDuration),
      pauses: pauses.map((p) => Math.round(p)),
      totalDuration: Math.round(totalDuration * 1000), // Convert to ms
    })
  } catch (error) {
    console.error('Speech analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze speech' },
      { status: 500 }
    )
  }
}
