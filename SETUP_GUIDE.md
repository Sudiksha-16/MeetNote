# MeetingAI Setup Guide - Real AI Models Integration

This guide explains how to set up all required AI services to run MeetingAI with real, non-mock data processing.

## Prerequisites
- Node.js 18+
- MongoDB account (free tier at https://www.mongodb.com/cloud/atlas)
- Hugging Face account (free at https://huggingface.co)

## Step 1: Set Up Whisper Speech-to-Text

### Option A: Local Whisper (Recommended for Development)

1. Install Whisper (requires Python 3.8+)
\`\`\`bash
pip install openai-whisper
\`\`\`

2. Create a simple Flask API wrapper for Whisper:
\`\`\`bash
pip install flask
\`\`\`

Create `whisper_api.py`:
\`\`\`python
from flask import Flask, request, jsonify
import whisper

app = Flask(__name__)
model = whisper.load_model("base")  # or "tiny", "small", "medium", "large"

@app.route('/transcribe', methods=['POST'])
def transcribe():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    result = model.transcribe(file.stream)
    
    return jsonify({
        "transcript": result["text"],
        "language": result.get("language", "en"),
        "timestamps": result.get("segments", [])
    })

if __name__ == '__main__':
    app.run(host='localhost', port=5000)
\`\`\`

3. Run the Whisper API:
\`\`\`bash
python whisper_api.py
\`\`\`

The API will be available at `http://localhost:5000/transcribe`

### Option B: OpenAI Whisper API

1. Get an OpenAI API key from https://platform.openai.com/api-keys
2. Set environment variable:
\`\`\`
OPENAI_API_KEY=sk-your-key-here
WHISPER_API_URL=https://api.openai.com/v1/audio/transcriptions
\`\`\`

## Step 2: Set Up Ollama with Gemma Model

1. Install Ollama from https://ollama.ai

2. Pull the Gemma model:
\`\`\`bash
ollama pull gemma
\`\`\`

3. Start Ollama (it runs by default on port 11434):
\`\`\`bash
ollama serve
\`\`\`

4. Verify it's working:
\`\`\`bash
curl http://localhost:11434/api/generate -d '{"model":"gemma","prompt":"hello"}'
\`\`\`

## Step 3: Set Up Hugging Face API

1. Sign up at https://huggingface.co
2. Create an API token: Settings → Access Tokens → New Token
3. Add to `.env.local`:
\`\`\`
HUGGING_FACE_API_KEY=hf_your_token_here
\`\`\`

## Step 4: Set Up MongoDB

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (with password)
4. Add to `.env.local`:
\`\`\`
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/meetingai?retryWrites=true&w=majority
\`\`\`

## Step 5: Configure Environment Variables

1. Copy the `.env.local` template above
2. Fill in all values
3. Place in project root directory

## Step 6: Start the Application

In separate terminal windows:

### Terminal 1: Start Whisper API (if using local)
\`\`\`bash
python whisper_api.py
\`\`\`

### Terminal 2: Start Ollama (if using local)
\`\`\`bash
ollama serve
\`\`\`

### Terminal 3: Start Next.js App
\`\`\`bash
npm install
npm run dev
\`\`\`

Visit `http://localhost:3000` in your browser.

## Step 7: Test the Pipeline

1. Create an account and login
2. Upload an audio file (MP3, WAV, M4A, etc.)
3. Wait for processing to complete
4. Check browser console for detailed logs (starts with "[v0]")

## Troubleshooting

### Issue: "Whisper API connection refused"
- Make sure Python Whisper API is running on port 5000
- Check: `curl http://localhost:5000/transcribe` should return 400 (no file)

### Issue: "Ollama connection refused"
- Make sure Ollama is running: `ollama serve`
- Check: `curl http://localhost:11434/api/generate` should respond

### Issue: "Hugging Face API key invalid"
- Verify token at https://huggingface.co/settings/tokens
- Use "read" permission level minimum

### Issue: Transcript is empty
- Check audio file format (supports: MP3, WAV, M4A, FLAC)
- Verify audio file size is not too large (Whisper has limits)
- Check Whisper logs for errors

### Issue: Gemma generates no summary
- Verify Ollama is running with `ollama serve`
- Check available models: `ollama list`
- Ensure you have enough system RAM (Gemma needs ~4GB minimum)

## Performance Tips

- Use `whisper` model size based on your hardware:
  - `tiny`: ~1GB VRAM, fastest
  - `base`: ~1GB VRAM (recommended)
  - `small`: ~2GB VRAM
  - `medium`: ~5GB VRAM
  - `large`: ~10GB VRAM, most accurate

- Use `ollama quantize` to reduce Gemma model size for lower-end systems

## Production Deployment

For production, consider:
1. Use OpenAI Whisper API instead of local (more reliable)
2. Use cloud-based Ollama or alternative LLM API
3. Use cloud-based MongoDB
4. Use Hugging Face's paid inference API for faster responses
5. Set up proper error handling and monitoring
6. Use environment variables for all secrets

## Next Steps

Once everything is working, you can:
- Upload test audio files with meetings
- View real transcripts and summaries
- Test translation features
- Export results in various formats

Questions? Check the browser console for "[v0]" debug logs showing exactly where processing fails.
