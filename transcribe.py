import whisper
import sys
import json
import torch

device = "cuda" if torch.cuda.is_available() else "cpu"
model = whisper.load_model("base", device=device)

audio_path = sys.argv[1]
result = model.transcribe(audio_path)
print(json.dumps(result))
