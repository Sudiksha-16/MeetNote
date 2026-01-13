# MeetingAI - AI Models Used

## Overview
This application uses three main AI models to process meeting audio:

## 1. Whisper Speech-to-Text
- **Model**: OpenAI Whisper
- **Purpose**: Converts audio to text transcription
- **Supports**: 99+ languages
- **Accuracy**: ~95-99% depending on audio quality
- **Options**:
  - Local: `openai-whisper` Python package
  - Cloud: OpenAI API

**Input**: Audio file (MP3, WAV, M4A, FLAC, etc.)
**Output**: 
\`\`\`json
{
  "transcript": "Full text of the meeting",
  "language": "en",
  "timestamps": [...],
  "duration": 1234
}
\`\`\`

## 2. Gemma via Ollama
- **Model**: Google Gemma (7B or 13B)
- **Purpose**: Generates structured summaries and extracts insights
- **Running**: Locally via Ollama
- **Speed**: ~10-30 seconds per meeting depending on length
- **Features**:
  - Generates concise summaries (2-3 sentences)
  - Extracts key points
  - Identifies action items
  - Documents decisions made

**Input**: Transcript text
**Output**:
\`\`\`json
{
  "summary": "Meeting summary...",
  "keyPoints": ["point 1", "point 2", ...],
  "actionItems": ["action with owner", ...],
  "decisions": ["decision 1", ...]
}
\`\`\`

## 3. Helsinki-NLP OPUS-MT Translation Models (Hugging Face)
- **Model**: OPUS-MT (Open Parallel Corpus Machine Translation)
- **Purpose**: Translates transcripts and summaries to multiple languages
- **Supported Languages**: 
  - Spanish (es): `Helsinki-NLP/opus-mt-en-es`
  - French (fr): `Helsinki-NLP/opus-mt-en-fr`
  - German (de): `Helsinki-NLP/opus-mt-en-de`
  - Japanese (ja): `Helsinki-NLP/opus-mt-en-jap`
  - Chinese (zh): `Helsinki-NLP/opus-mt-en-zh`
- **Accuracy**: ~85-95% depending on language pair

**Input**: Text to translate + target language code
**Output**: Translated text in target language

## Processing Pipeline

1. **Audio Upload** → Upload meeting audio file
2. **Whisper Transcription** → Convert audio to text with timestamps
3. **Language Detection** → Detect original language (Hugging Face)
4. **Auto-Translation** (if needed) → Translate to English if non-English detected
5. **Gemma Summarization** → Generate summary, key points, action items, decisions
6. **Sentiment Analysis** → Basic sentiment from keywords
7. **Storage** → Save all results to MongoDB

## Model Sizes & Hardware Requirements

| Model | VRAM | RAM | Speed | Accuracy |
|-------|------|-----|-------|----------|
| Whisper Tiny | 1GB | 2GB | Very Fast | 80% |
| Whisper Base | 1GB | 2GB | Fast | 90% |
| Whisper Small | 2GB | 4GB | Medium | 95% |
| Whisper Medium | 5GB | 8GB | Slow | 97% |
| Gemma 7B | 4GB | 8GB | Medium | Good |
| Gemma 13B | 8GB | 16GB | Slow | Very Good |
| OPUS-MT | <1GB | 2GB | Very Fast | 90% |

## Real-Time vs Offline

- **Whisper**: Can run offline (local) or online (OpenAI API)
- **Gemma**: Runs offline (local Ollama) only
- **Translation**: Requires API calls to Hugging Face (online)

## Accuracy Improvements

To improve accuracy:
1. Use larger Whisper models for audio
2. Use larger Gemma models for better summaries
3. Provide clear, high-quality audio (16kHz minimum)
4. Use professional microphones for recording
5. Ensure minimal background noise

## Cost Comparison

| Service | Local | Cloud |
|---------|-------|-------|
| Whisper | Free (compute cost) | $0.006/min audio |
| Gemma | Free (compute cost) | $0.01-0.05/1K tokens |
| Translation | Free (compute cost) | $0.006-0.05 per API call |

Local = Free but requires your hardware
Cloud = Pay per use but no hardware needed

## Future Enhancements

- Add speaker diarization (identify who said what)
- Implement real-time transcription
- Add custom vocabulary support
- Support for specialized domains (legal, medical, etc.)
- Multi-model consensus for improved accuracy
