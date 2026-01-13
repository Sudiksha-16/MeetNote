import { exec } from "child_process";
import fs from "fs";
import path from "path";
import axios from "axios";
import FormData from "form-data";




// ==============================
// 🎧 Whisper (Local or API) — Speech-to-Text
// ==============================
export async function transcribeAudio(audioPath) {
  const fullPath = path.join(process.cwd(), "public", audioPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Audio file not found: ${fullPath}`);
  }

  // 🧠 Use local Whisper (Python)
  if (process.env.USE_LOCAL_WHISPER === "true") {
    console.log("Using local Whisper model...");

    return new Promise((resolve, reject) => {
      exec(`python transcribe.py "${fullPath}"`, (error, stdout, stderr) => {
        if (error) {
          console.error("Local Whisper error:", stderr || error.message);
          reject(`Local Whisper failed: ${stderr || error.message}`);
        } else {
          try {
            const data = JSON.parse(stdout);
            resolve({
              transcript: data.text || "",
              language: data.language || "en",
              timestamps: data.segments || [],
            });
          } catch (parseError) {
            reject("Failed to parse Whisper output: " + parseError.message);
          }
        }
      });
    });
  }

  // 🌐 Otherwise, use OpenAI Whisper API
  console.log("Using OpenAI Whisper API...");

  const formData = new FormData();
  formData.append("file", fs.createReadStream(fullPath));
  formData.append("model", "whisper-1");
  formData.append("language", "en");

  const response = await axios.post(
    process.env.WHISPER_API_URL || "https://api.openai.com/v1/audio/transcriptions",
    formData,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        ...formData.getHeaders(),
      },
      timeout: 300000,
    }
  );

  return {
    transcript: response.data.text || "",
    language: response.data.language || "en",
  };
}

// =================================
// 🪶 Gemma (via Ollama) Summarizer
// =================================
export async function generateSummary(transcript) {
  try {
    console.log("Generating summary with Gemma via Ollama");
    console.log("Ollama API URL:", process.env.OLLAMA_API_URL);

    const response = await axios.post(
      `${process.env.OLLAMA_API_URL || "http://localhost:11434"}/api/generate`,
      {
        model: process.env.OLLAMA_MODEL || "gemma:latest",
        prompt: `You are a meeting summarization expert. Analyze this meeting transcript and provide a structured summary in JSON format.

Transcript:
"${transcript}"

Provide response in this exact JSON format (no markdown, just raw JSON):
{
  "summary": "2-3 sentence summary of the meeting",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "actionItems": ["action 1 with owner", "action 2 with owner"],
  "decisions": ["decision 1", "decision 2"]
}

Only respond with the JSON object, nothing else.`,
        stream: false,
        temperature: 0.7,
      },
      { timeout: 120000 }
    );

    console.log("Gemma response received, parsing...");

    let parsedResponse;
    try {
      const responseText =
        typeof response.data === "string"
          ? response.data
          : response.data.response || JSON.stringify(response.data);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("No JSON found in response");
      parsedResponse = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse Gemma response:", parseError);
      parsedResponse = {
        summary: transcript.substring(0, 200) + "...",
        keyPoints: ["See full transcript for details"],
        actionItems: [],
        decisions: [],
      };
    }

    return {
      summary: parsedResponse.summary || "",
      keyPoints: Array.isArray(parsedResponse.keyPoints)
        ? parsedResponse.keyPoints
        : [],
      actionItems: Array.isArray(parsedResponse.actionItems)
        ? parsedResponse.actionItems
        : [],
      decisions: Array.isArray(parsedResponse.decisions)
        ? parsedResponse.decisions
        : [],
    };
  } catch (error) {
    console.error("Gemma summary generation error:", error.message);
    throw new Error(`Gemma API failed: ${error.message}`);
  }
}

// ==============================
// 🌍 Hugging Face Translation API
// ==============================
// ==============================
// 🌍 Hugging Face Translation API (Fixed)
// ==============================
// ==============================
// ==============================
/*import { spawn } from "child_process";

let pythonProcess = null;
let serverReady = false;

export function startTranslationServer() {
  if (pythonProcess) return;

  pythonProcess = spawn("python", ["translate_server.py"]);

  pythonProcess.stdout.on("data", (data) => {
    const msg = data.toString();
    console.log(`[Python] ${msg}`);

    // Detect when server is ready
    if (msg.includes("Uvicorn running")) {
      serverReady = true;
      console.log("[v0] Python translation server is ready ✅");
    }
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`[Python ERROR] ${data.toString()}`);
  });

  pythonProcess.on("close", (code) => {
    console.log(`[Python] Translation server exited with code ${code}`);
    pythonProcess = null;
    serverReady = false;
  });

  process.on("exit", () => pythonProcess && pythonProcess.kill());
  process.on("SIGINT", () => pythonProcess && pythonProcess.kill());
}

// Start server automatically
startTranslationServer();

// Wait until Python server is ready before translating
async function waitForServerReady(timeout = 15000) {
  const interval = 200;
  let waited = 0;
  while (!serverReady) {
    await new Promise((res) => setTimeout(res, interval));
    waited += interval;
    if (waited > timeout) throw new Error("Python server not ready in time");
  }
}*/

export async function translateText(text, targetLanguage) {
  try {
    console.log("Translating text to:", targetLanguage);

    const response = await axios.post("http://127.0.0.1:8000/translate", {
      text,
      target_lang: targetLanguage,   // ✅ FIXED
    });

    console.log("Translation complete");
    return response.data.translated_text;
  } catch (error) {
    console.error("Translation failed:", error.message);
    return text; // fallback
  }
}




/*export async function translateText(text, targetLanguage) {
  try {
    console.log("[v0] Translating text to:", targetLanguage);

    // Supported languages and corresponding models
    const languageMap = {
      es: "Helsinki-NLP/opus-mt-en-es",  // Spanish
      fr: "Helsinki-NLP/opus-mt-en-fr",  // French
      de: "Helsinki-NLP/opus-mt-en-de",  // German
      ja: "Helsinki-NLP/opus-mt-en-ja",  // Japanese
      zh: "Helsinki-NLP/opus-mt-en-zh",  // Chinese
      hi: "Helsinki-NLP/opus-mt-en-hi",  // Hindi (optional extra)
    };

    const model = languageMap[targetLanguage];
    if (!model) throw new Error(`Unsupported language: ${targetLanguage}`);

    if (!process.env.HUGGING_FACE_API_KEY) {
      throw new Error("HUGGING_FACE_API_KEY not configured");
    }

    // Make request to Hugging Face model
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    console.log("[v0] Translation response:", response.data);

    // Hugging Face sometimes returns nested arrays
    let translated =
      response.data?.[0]?.translation_text ||
      response.data?.[0]?.generated_text ||
      response.data?.translation_text ||
      response.data?.generated_text ||
      text;

    console.log("[v0] Translation complete ✅:", translated);
    return translated;
  } catch (error) {
    console.error("[v0] Translation failed ❌:", error.message);
    return text; // fallback to original text
  }
}*/


// ==============================
// 🗣️ Language Detection (Hugging Face)
// ==============================
export async function analyzeLanguage(transcript) {
  try {
    console.log("Detecting language of transcript");

    if (!process.env.HUGGING_FACE_API_KEY) {
      console.warn("HUGGING_FACE_API_KEY not configured, assuming English");
      return { detectedLanguage: "en", needsTranslation: false };
    }

    const response = await axios.post(
      "https://api-inference.huggingface.co/models/papluca/xlm-roberta-base-language-detection",
      { inputs: transcript.substring(0, 500) },
      {
        headers: { Authorization: `Bearer ${process.env.HUGGING_FACE_API_KEY}` },
        timeout: 30000,
      }
    );

    const detectedLanguage = response.data[0][0]?.label || "en";
    console.log("Detected language:", detectedLanguage);

    return {
      detectedLanguage,
      needsTranslation: detectedLanguage !== "en",
    };
  } catch (error) {
    console.error("Language detection error:", error.message);
    return { detectedLanguage: "en", needsTranslation: false };
  }
}
// -----------------------------------------
// 🔥 NEW: Meeting Q&A LLM helper
// -----------------------------------------
export async function answerMeetingQuestion({ question, meeting }) {
  const { transcript, summary, keyPoints = [], actionItems = [], decisions = [] } = meeting;

  const systemPrompt = `
You are an AI assistant that answers questions based ONLY on the content of this meeting.
If the answer is not present in the meeting content, reply: "That information was not discussed in the meeting."
Be factual, concise, and accurate.
  `.trim();

  const contextText = `
MEETING SUMMARY:
${summary || "No summary available."}

KEY POINTS:
${keyPoints.length ? keyPoints.join("\n") : "No key points recorded."}

ACTION ITEMS:
${actionItems.length ? actionItems.join("\n") : "No action items recorded."}

DECISIONS:
${decisions.length ? decisions.join("\n") : "No decisions recorded."}

TRANSCRIPT:
${transcript || "No transcript available."}
  `.trim();

  const prompt = `
${systemPrompt}

Meeting content:
----------------
${contextText}
----------------

User question: ${question}

Answer using ONLY the meeting content above.
  `.trim();

  // 🔹 IMPORTANT: use the SAME URL + model you already use for generateSummary
  // Look at your generateSummary function and copy its URL/model names.
  const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
  const MODEL_NAME = process.env.GEMMA_MODEL || "gemma:latest"; // change if your summary uses a different one

  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL_NAME,
      prompt,
      stream: false,
      temperature: 0.2,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    console.error("Ollama QA error:", res.status, errText);
    throw new Error(`Failed to generate answer (status ${res.status})`);
  }

  const data = await res.json();
  const answer = (data.response || "").trim();
  return answer || "I couldn't generate an answer based on this meeting.";
}



// ==============================
// 🧩 Helper Functions
// ==============================
export async function extractSpeakerData(transcript) {
  return { speakers: [], sentiment: "neutral" };
}

export async function extractKeywords(transcript) {
  const words = transcript
    .toLowerCase()
    .split(/[\s\W]+/)
    .filter((word) => word.length > 5);

  const wordFreq = {};
  words.forEach((word) => (wordFreq[word] = (wordFreq[word] || 0) + 1));

  return Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

