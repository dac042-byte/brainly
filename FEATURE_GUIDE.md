# Feature Implementation Guide

This guide explains how to add new test types to Braingauge: Memory tests, Eye tracking, and AI Speech Analysis.

## Table of Contents
1. [Adding Memory Tests](#adding-memory-tests)
2. [Adding Eye Tracking](#adding-eye-tracking)
3. [Implementing AI Speech Analysis](#implementing-ai-speech-analysis)

---

## Adding Memory Tests

Memory tests measure working memory, recall, and recognition. Here's how to implement them:

### 1. Database Schema Updates

Add new tables for memory tests:

```sql
-- Memory test data
CREATE TABLE memory_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL, -- 'digit_span', 'word_recall', 'pattern_memory'
  sequence_length INTEGER NOT NULL,
  items_shown JSONB NOT NULL, -- Array of items shown
  items_recalled JSONB, -- Array of items user recalled
  correct_count INTEGER,
  total_items INTEGER,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_test_type CHECK (test_type IN ('digit_span', 'word_recall', 'pattern_memory'))
);

-- Memory metrics
CREATE TABLE memory_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL,
  accuracy_percent NUMERIC(5, 2),
  max_span_recalled INTEGER,
  average_response_time_ms NUMERIC(10, 2),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add indexes
CREATE INDEX idx_memory_tests_session ON memory_tests(session_id);
CREATE INDEX idx_memory_metrics_session ON memory_metrics(session_id);

-- Add RLS policies (same pattern as reaction_trials)
ALTER TABLE memory_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own memory tests"
  ON memory_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = memory_tests.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- Add similar policies for INSERT
```

### 2. Create Memory Test Component

Create `src/components/MemoryTest.tsx`:

```typescript
'use client'

import { useState, useEffect } from 'react'

interface MemoryTestProps {
  onComplete: (data: {
    testType: string
    sequenceLength: number
    itemsShown: string[]
    itemsRecalled: string[]
    correctCount: number
    responseTime: number
  }) => void
}

const DIGIT_SEQUENCES = [
  ['3', '7', '2'],
  ['5', '9', '1', '4'],
  ['8', '2', '6', '3', '9'],
  // Add more sequences of increasing length
]

export function MemoryTest({ onComplete }: MemoryTestProps) {
  const [phase, setPhase] = useState<'intro' | 'show' | 'recall' | 'complete'>('intro')
  const [currentSequence, setCurrentSequence] = useState<string[]>([])
  const [userInput, setUserInput] = useState('')
  const [startTime, setStartTime] = useState(0)

  const startTest = () => {
    const sequence = DIGIT_SEQUENCES[0] // Start with first sequence
    setCurrentSequence(sequence)
    setPhase('show')

    // Show sequence for 1 second per item
    setTimeout(() => {
      setPhase('recall')
      setStartTime(Date.now())
    }, sequence.length * 1000)
  }

  const handleSubmit = () => {
    const recalled = userInput.split('').filter(c => c.trim())
    const correct = recalled.filter((digit, i) => digit === currentSequence[i]).length

    onComplete({
      testType: 'digit_span',
      sequenceLength: currentSequence.length,
      itemsShown: currentSequence,
      itemsRecalled: recalled,
      correctCount: correct,
      responseTime: Date.now() - startTime
    })
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Memory Test</h2>
        <p className="mb-4">
          A sequence of digits will appear on screen. Memorize them in order,
          then type them back when prompted.
        </p>
        <button
          onClick={startTest}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Start Test
        </button>
      </div>
    )
  }

  if (phase === 'show') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-8">Memorize This Sequence</h2>
        <div className="text-6xl font-mono space-x-4">
          {currentSequence.map((digit, i) => (
            <span key={i}>{digit}</span>
          ))}
        </div>
      </div>
    )
  }

  if (phase === 'recall') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Enter the Sequence</h2>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          className="w-full px-4 py-3 text-2xl font-mono text-center border rounded-lg"
          placeholder="Type digits here"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Submit
        </button>
      </div>
    )
  }

  return null
}
```

### 3. Add Server Actions

Add to `src/lib/actions/session.ts`:

```typescript
export async function saveMemoryTest(
  sessionId: string,
  data: {
    testType: string
    sequenceLength: number
    itemsShown: string[]
    itemsRecalled: string[]
    correctCount: number
    responseTime: number
  }
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('memory_tests')
    .insert({
      session_id: sessionId,
      test_type: data.testType,
      sequence_length: data.sequenceLength,
      items_shown: data.itemsShown,
      items_recalled: data.itemsRecalled,
      correct_count: data.correctCount,
      total_items: data.itemsShown.length,
      response_time_ms: data.responseTime
    })

  if (error) throw error

  // Compute metrics
  const accuracy = (data.correctCount / data.itemsShown.length) * 100

  await supabase
    .from('memory_metrics')
    .insert({
      session_id: sessionId,
      test_type: data.testType,
      accuracy_percent: accuracy,
      max_span_recalled: data.sequenceLength,
      average_response_time_ms: data.responseTime
    })
}
```

### 4. Integrate into Session Flow

Update `src/app/session/SessionContent.tsx` to include memory test after speech test.

---

## Adding Eye Tracking

Eye tracking monitors gaze patterns and focus. This requires WebGazer.js or a similar library.

### 1. Install Eye Tracking Library

```bash
npm install webgazer
```

### 2. Database Schema

```sql
-- Eye tracking data
CREATE TABLE eye_tracking_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  duration_ms INTEGER NOT NULL,
  calibration_accuracy NUMERIC(5, 2),
  sample_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE eye_tracking_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tracking_session_id UUID NOT NULL REFERENCES eye_tracking_sessions(id) ON DELETE CASCADE,
  timestamp_ms INTEGER NOT NULL, -- Relative to session start
  gaze_x INTEGER,
  gaze_y INTEGER,
  fixation BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eye tracking metrics
CREATE TABLE eye_tracking_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  fixation_count INTEGER,
  average_fixation_duration_ms NUMERIC(10, 2),
  saccade_count INTEGER, -- Rapid eye movements
  smooth_pursuit_ratio NUMERIC(5, 4),
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3. Create Eye Tracking Component

Create `src/components/EyeTrackingTest.tsx`:

```typescript
'use client'

import { useEffect, useRef, useState } from 'react'

// Note: This is a simplified example. Real implementation needs:
// import webgazer from 'webgazer'

interface EyeTrackingSample {
  timestamp: number
  x: number
  y: number
}

interface EyeTrackingTestProps {
  onComplete: (samples: EyeTrackingSample[]) => void
}

export function EyeTrackingTest({ onComplete }: EyeTrackingTestProps) {
  const [phase, setPhase] = useState<'intro' | 'calibration' | 'tracking' | 'complete'>('intro')
  const [calibrated, setCalibrated] = useState(false)
  const samplesRef = useRef<EyeTrackingSample[]>([])
  const startTimeRef = useRef(0)

  useEffect(() => {
    if (phase === 'calibration') {
      // Initialize WebGazer
      // webgazer.begin()
      //   .showPredictionPoints(true)
      //   .setGazeListener((data, elapsedTime) => {
      //     if (data) {
      //       samplesRef.current.push({
      //         timestamp: elapsedTime,
      //         x: data.x,
      //         y: data.y
      //       })
      //     }
      //   })
    }

    return () => {
      // webgazer.end()
    }
  }, [phase])

  const startCalibration = () => {
    setPhase('calibration')
  }

  const finishCalibration = () => {
    setCalibrated(true)
    setPhase('tracking')
    startTimeRef.current = Date.now()

    // Run tracking for 30 seconds
    setTimeout(() => {
      setPhase('complete')
      onComplete(samplesRef.current)
    }, 30000)
  }

  if (phase === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Eye Tracking Calibration</h2>
        <div className="space-y-4">
          <p>This test will track your eye movements to measure focus and attention patterns.</p>
          <ul className="list-disc list-inside space-y-2">
            <li>Look directly at the camera</li>
            <li>Follow the calibration points with your eyes</li>
            <li>Keep your head still during the test</li>
            <li>Ensure good lighting on your face</li>
          </ul>
        </div>
        <button
          onClick={startCalibration}
          className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Start Calibration
        </button>
      </div>
    )
  }

  if (phase === 'calibration') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Calibration</h2>
        <p className="text-center mb-8">Look at each point as it appears</p>

        {/* Show calibration points in corners and center */}
        <div className="relative h-96 border-2 border-gray-300 rounded-lg">
          {/* WebGazer calibration UI would go here */}
        </div>

        <button
          onClick={finishCalibration}
          className="mt-6 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Calibration Complete - Start Tracking
        </button>
      </div>
    )
  }

  if (phase === 'tracking') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Eye Tracking Active</h2>
        <p className="text-center mb-8">Focus on the center target and keep your eyes on it</p>

        <div className="relative h-96 border-2 border-gray-300 rounded-lg flex items-center justify-center">
          <div className="w-16 h-16 bg-purple-500 rounded-full"></div>
        </div>

        <p className="text-center mt-4 text-gray-600 dark:text-gray-400">
          Tracking for 30 seconds...
        </p>
      </div>
    )
  }

  return null
}
```

### 4. Key Implementation Notes

- **Privacy**: Eye tracking data is sensitive. Only store aggregated metrics by default
- **Calibration**: Requires 5-9 calibration points for accuracy
- **Browser Support**: Only works in modern browsers with camera access
- **Performance**: WebGazer can be CPU-intensive, may need optimization
- **Accuracy**: Varies by lighting, distance, and hardware

### 5. Processing Eye Tracking Data

```typescript
function analyzeEyeTrackingSamples(samples: EyeTrackingSample[]) {
  // Detect fixations (when gaze stays in one area)
  const fixations = detectFixations(samples)

  // Detect saccades (rapid eye movements)
  const saccades = detectSaccades(samples)

  return {
    fixationCount: fixations.length,
    averageFixationDuration: calculateAverage(fixations.map(f => f.duration)),
    saccadeCount: saccades.length,
    smoothPursuitRatio: calculateSmoothPursuitRatio(samples)
  }
}

function detectFixations(samples: EyeTrackingSample[]) {
  const fixations = []
  const FIXATION_THRESHOLD = 50 // pixels
  const MIN_DURATION = 100 // ms

  // Group samples that are close together in space and time
  // This is a simplified algorithm - real implementations are more sophisticated

  return fixations
}
```

---

## Implementing AI Speech Analysis

Replace the mock speech analysis with real AI-powered analysis using AssemblyAI, Google Cloud Speech, or a custom model.

### Option 1: Using AssemblyAI (Recommended)

AssemblyAI provides accurate speech-to-text with automatic pause detection and timing data.

#### 1. Install AssemblyAI SDK

```bash
npm install assemblyai
```

#### 2. Add API Key to Environment

```bash
# .env.local
ASSEMBLYAI_API_KEY=your-api-key-here
```

#### 3. Update Speech Analysis Function

Replace `src/lib/speech-analysis.ts` with:

```typescript
import { AssemblyAI } from 'assemblyai'

export interface SpeechMetrics {
  voiced_time_ms: number
  pause_time_ms: number
  pause_count: number
  avg_pause_length_ms: number
  speech_activity_ratio: number
  word_count?: number
  words_per_minute?: number
  transcript?: string
}

export async function analyzeSpeechAudio(
  audioBlob: Blob,
  sessionId: string
): Promise<SpeechMetrics> {
  // Option 1: Use AssemblyAI API
  if (process.env.ASSEMBLYAI_API_KEY) {
    return analyzeWithAssemblyAI(audioBlob)
  }

  // Fallback to local analysis
  return analyzeLocally(audioBlob)
}

async function analyzeWithAssemblyAI(audioBlob: Blob): Promise<SpeechMetrics> {
  const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY!
  })

  // Upload audio
  const uploadUrl = await client.files.upload(audioBlob)

  // Transcribe with word-level timestamps
  const transcript = await client.transcripts.transcribe({
    audio_url: uploadUrl,
    speech_model: 'nano',
    language_detection: true
  })

  if (transcript.status === 'error') {
    throw new Error('Transcription failed')
  }

  // Calculate metrics from word timestamps
  const words = transcript.words || []
  const totalDuration = transcript.audio_duration * 1000 // Convert to ms

  // Calculate pauses (gaps between words)
  const pauses = []
  for (let i = 0; i < words.length - 1; i++) {
    const pauseStart = words[i].end
    const pauseEnd = words[i + 1].start
    const pauseDuration = pauseEnd - pauseStart

    // Only count pauses longer than 150ms
    if (pauseDuration > 150) {
      pauses.push(pauseDuration)
    }
  }

  const pauseTime = pauses.reduce((sum, p) => sum + p, 0)
  const voicedTime = totalDuration - pauseTime

  // Calculate words per minute
  const durationMinutes = totalDuration / 60000
  const wordsPerMinute = words.length / durationMinutes

  return {
    voiced_time_ms: Math.floor(voicedTime),
    pause_time_ms: Math.floor(pauseTime),
    pause_count: pauses.length,
    avg_pause_length_ms: pauses.length > 0 ? pauseTime / pauses.length : 0,
    speech_activity_ratio: voicedTime / totalDuration,
    word_count: words.length,
    words_per_minute: wordsPerMinute,
    transcript: transcript.text
  }
}

async function analyzeLocally(audioBlob: Blob): Promise<SpeechMetrics> {
  // Fallback: Simple duration-based estimates
  const totalDuration = 12000 // Get from audio blob metadata

  return {
    voiced_time_ms: Math.floor(totalDuration * 0.75),
    pause_time_ms: Math.floor(totalDuration * 0.25),
    pause_count: 5,
    avg_pause_length_ms: Math.floor((totalDuration * 0.25) / 5),
    speech_activity_ratio: 0.75
  }
}
```

#### 4. Update API Route

Update `src/app/api/speech/analyze/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeSpeechAudio } from '@/lib/speech-analysis'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const audioBlob = formData.get('audio') as Blob
    const sessionId = formData.get('sessionId') as string

    if (!audioBlob) {
      return NextResponse.json(
        { error: 'Audio blob is required' },
        { status: 400 }
      )
    }

    // Use real AI analysis
    const metrics = await analyzeSpeechAudio(audioBlob, sessionId)

    return NextResponse.json({
      success: true,
      metrics,
    })
  } catch (error) {
    console.error('Speech analysis error:', error)
    return NextResponse.json(
      { error: 'Speech analysis failed' },
      { status: 500 }
    )
  }
}
```

### Option 2: Using Google Cloud Speech-to-Text

```bash
npm install @google-cloud/speech
```

```typescript
import speech from '@google-cloud/speech'

async function analyzeWithGoogle(audioBuffer: Buffer): Promise<SpeechMetrics> {
  const client = new speech.SpeechClient({
    credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS!)
  })

  const [response] = await client.recognize({
    config: {
      encoding: 'WEBM_OPUS',
      sampleRateHertz: 48000,
      languageCode: 'en-US',
      enableWordTimeOffsets: true
    },
    audio: {
      content: audioBuffer.toString('base64')
    }
  })

  // Process results similar to AssemblyAI example
  // ...
}
```

### Option 3: Local ML Model (Advanced)

For fully offline analysis:

```bash
npm install @tensorflow/tfjs @tensorflow-models/speech-commands
```

This requires:
- Voice Activity Detection (VAD) model
- Audio processing with Web Audio API
- More complex implementation but fully private

---

## General Integration Steps

For any new test type:

1. **Update Database Schema** - Add tables for raw data and metrics
2. **Create Test Component** - Build the UI and interaction logic
3. **Add Server Actions** - Create functions to save data
4. **Update Session Flow** - Integrate into existing session sequence
5. **Update Dashboard** - Add charts and displays for new metrics
6. **Update History** - Show new test results in history page
7. **Add to Baseline** - Include in baseline calculations if appropriate

---

## Testing New Features

1. **Local Testing**: Test each component individually
2. **Integration Testing**: Test full session flow with new tests
3. **Data Validation**: Verify metrics are calculated correctly
4. **Performance**: Ensure tests don't slow down the app
5. **Browser Compatibility**: Test across Chrome, Firefox, Safari
6. **Mobile**: Test on mobile devices if applicable

---

## Best Practices

- **Privacy First**: Always ask permission before collecting data
- **Graceful Degradation**: Provide fallbacks if features aren't supported
- **Clear Instructions**: Make tests easy to understand
- **Error Handling**: Handle failures gracefully
- **Progressive Enhancement**: Start simple, add complexity gradually
- **User Feedback**: Show progress and results clearly

---

## Resources

- **WebGazer.js**: https://webgazer.cs.brown.edu/
- **AssemblyAI**: https://www.assemblyai.com/docs
- **Google Cloud Speech**: https://cloud.google.com/speech-to-text
- **TensorFlow.js**: https://www.tensorflow.org/js
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
