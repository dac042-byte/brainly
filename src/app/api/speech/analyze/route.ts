import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'Speech API not configured' },
      { status: 500 }
    )
  }

  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      )
    }

    // Call Whisper API with word-level timestamps
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['word'],
    })

    const words = transcription.words || []
    const wordCount = words.length

    if (wordCount === 0) {
      return NextResponse.json({
        wordCount: 0,
        wordsPerMinute: 0,
        pauseCount: 0,
        averagePauseDuration: 0,
        totalDuration: 0,
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
