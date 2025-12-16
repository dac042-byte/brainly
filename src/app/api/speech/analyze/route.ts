import { NextRequest, NextResponse } from 'next/server'

const ASSEMBLYAI_API_KEY = process.env.ASSEMBLYAI_API_KEY

export async function POST(request: NextRequest) {
  if (!ASSEMBLYAI_API_KEY) {
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

    // Convert File to Buffer
    const arrayBuffer = await audioFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Step 1: Upload audio file to AssemblyAI
    const uploadResponse = await fetch('https://api.assemblyai.com/v2/upload', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/octet-stream',
      },
      body: buffer,
    })

    if (!uploadResponse.ok) {
      throw new Error('Failed to upload audio')
    }

    const { upload_url } = await uploadResponse.json()

    // Step 2: Request transcription with word-level timestamps
    const transcriptResponse = await fetch('https://api.assemblyai.com/v2/transcript', {
      method: 'POST',
      headers: {
        'authorization': ASSEMBLYAI_API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        audio_url: upload_url,
        language_detection: true,
      }),
    })

    if (!transcriptResponse.ok) {
      throw new Error('Failed to start transcription')
    }

    const { id: transcriptId } = await transcriptResponse.json()

    // Step 3: Poll for transcription completion
    let transcriptData
    let attempts = 0
    const maxAttempts = 60 // 60 seconds max wait

    while (attempts < maxAttempts) {
      const pollingResponse = await fetch(
        `https://api.assemblyai.com/v2/transcript/${transcriptId}`,
        {
          headers: {
            'authorization': ASSEMBLYAI_API_KEY,
          },
        }
      )

      transcriptData = await pollingResponse.json()

      if (transcriptData.status === 'completed') {
        break
      } else if (transcriptData.status === 'error') {
        throw new Error('Transcription failed')
      }

      // Wait 1 second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000))
      attempts++
    }

    if (!transcriptData || transcriptData.status !== 'completed') {
      throw new Error('Transcription timed out')
    }

    const words = transcriptData.words || []
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
      const pauseDuration = nextWordStart - currentWordEnd // Already in ms

      // Only count pauses > 100ms to filter out natural speech flow
      if (pauseDuration > 100) {
        pauses.push(pauseDuration)
      }
    }

    // Calculate words per minute
    const totalDuration = (words[words.length - 1].end - words[0].start) / 1000 // Convert ms to seconds
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
