# translate_server.py
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from deep_translator import GoogleTranslator
import uvicorn
import asyncio
import threading
import requests
import time

app = FastAPI()

@app.post("/translate")
async def translate_text(request: Request):
    try:
        data = await request.json()
    except Exception:
        return JSONResponse({"error": "Invalid JSON"}, status_code=400)

    text = data.get("text", "")
    target_lang = data.get("target_lang", "en")

    if not text:
        return JSONResponse({"error": "No text provided"}, status_code=400)

    try:
        print(f"Translating {len(text)} characters to {target_lang}...")
        translated_chunks = []
        chunk_size = 4000

        for i in range(0, len(text), chunk_size):
            chunk = text[i:i + chunk_size]

            # Run sync translator in thread
            translated = await asyncio.to_thread(
                GoogleTranslator(source="auto", target=target_lang).translate,
                chunk
            )

            translated_chunks.append(translated)

        translated_text = " ".join(translated_chunks)
        print("Translation complete ")

        return {"translated_text": translated_text}

    except Exception as e:
        print("Server Error:", e)
        return JSONResponse({"error": str(e)}, status_code=500)


def run_self_test():
    time.sleep(2)
    payload = {"text": "Hello, how are you?", "target_lang": "ta"}

    try:
        res = requests.post("http://127.0.0.1:8000/translate", json=payload, timeout=15)
        if res.status_code == 200:
            print("Self-test:", res.json())
        else:
            print(f"Self-test failed: {res.status_code}", res.text)
    except Exception as e:
        print("Self-test error:", e)


if __name__ == "__main__":
    print(" Starting Translation Server (Deep Translator)...")
    threading.Thread(target=run_self_test, daemon=True).start()
    uvicorn.run(app, host="127.0.0.1", port=8000)
