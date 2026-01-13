"use client";

import { useState, useEffect } from "react";

export default function MeetingAnalytics({ meeting }) {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🌐 Translation states
  const [language, setLanguage] = useState("hi");
  const [translated, setTranslated] = useState("");
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    const fetchSentiment = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await fetch(`/api/sentiment?meetingId=${meeting._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          setSentiment(data.sentiment);
        }
      } catch (err) {
        console.error("Error fetching sentiment:", err);
      } finally {
        setLoading(false);
      }
    };

    if (meeting.status === "processed") {
      fetchSentiment();
    }
  }, [meeting._id, meeting.status]);

  // 🌐 Translate Transcript
  const handleTranslate = async () => {
    setTranslating(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          meetingId: meeting._id,
          targetLanguage: language,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setTranslated(data.translatedTranscript);
      } else {
        alert(data.error || "Translation failed");
      }
    } catch (err) {
      console.error("Translation error:", err);
      alert("Error while translating");
    }
    setTranslating(false);
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Analyzing meeting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🧠 Sentiment Section */}
      {sentiment && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-6">Meeting Sentiment</h3>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Overall Sentiment */}
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-xs font-medium text-muted-foreground mb-2">Overall Sentiment</p>
              <p className="text-2xl font-bold capitalize text-foreground">{sentiment.overall}</p>
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(sentiment.confidence)}% confidence
              </p>
            </div>

            {/* Positive Indicators */}
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-xs font-medium text-muted-foreground mb-2">Positive Indicators</p>
              <p className="text-3xl font-bold text-primary">
                {sentiment.positiveIndicators}
              </p>
              <p className="text-xs text-muted-foreground mt-2">phrases detected</p>
            </div>

            {/* Negative Indicators */}
            <div className="text-center p-4 rounded-lg bg-muted">
              <p className="text-xs font-medium text-muted-foreground mb-2">Negative Indicators</p>
              <p className="text-3xl font-bold text-destructive">
                {sentiment.negativeIndicators}
              </p>
              <p className="text-xs text-muted-foreground mt-2">phrases detected</p>
            </div>
          </div>

          {/* 🌐 Translation Section */}
          <div className="mt-6 border-t border-border pt-4">
            <h4 className="text-md font-semibold mb-3 text-foreground">
              Translate Transcript
            </h4>

            <div className="flex items-center gap-3 mb-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="border p-2 rounded"
              >
                <option value="hi">Hindi</option>
                <option value="te">Telugu</option>
                <option value="ta">Tamil</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>

              <button
                onClick={handleTranslate}
                disabled={translating}
                className="bg-primary text-white px-4 py-2 rounded"
              >
                {translating ? "Translating..." : "Translate"}
              </button>
            </div>

            {translated && (
              <div className="mt-3 bg-muted p-3 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-1">
                  Translated Transcript ({language.toUpperCase()}):
                </p>
                <p className="text-foreground whitespace-pre-wrap">{translated}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📊 Meeting Stats Section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-6">Meeting Statistics</h3>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Total Words */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">Total Words</p>
            <p className="text-3xl font-bold text-foreground">
              {(() => {
                const wordCount = meeting?.transcript
                  ? meeting.transcript.trim().split(/\s+/).length
                  : 0;
                return wordCount.toLocaleString();
              })()}
            </p>
          </div>

          {/* Average Words/Min */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">Average Words/Min</p>
            <p className="text-3xl font-bold text-foreground">
              {(() => {
                const wordCount = meeting?.transcript
                  ? meeting.transcript.trim().split(/\s+/).length
                  : 0;
                const durationMin = meeting?.duration ? meeting.duration / 60 : 1;
                const avg = wordCount && durationMin ? wordCount / durationMin : 0;
                return Number.isFinite(avg) ? Math.round(avg) : 0;
              })()}
            </p>
          </div>

          {/* Key Points */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">Key Points Extracted</p>
            <p className="text-3xl font-bold text-foreground">
              {Array.isArray(meeting.keyPoints) ? meeting.keyPoints.length : 0}
            </p>
          </div>

          {/* Action Items */}
          <div className="p-4 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">Action Items</p>
            <p className="text-3xl font-bold text-foreground">
              {Array.isArray(meeting.actionItems) ? meeting.actionItems.length : 0}
            </p>
          </div>
        </div>
      </div>

      {/* 🔑 Keywords Section */}
      {meeting.keywords && meeting.keywords.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">Keywords</h3>
          <div className="flex flex-wrap gap-2">
            {meeting.keywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm border border-primary/20"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
