"use client";

import { useState } from "react";

export default function MeetingQA({ meetingId }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askQuestion = async () => {
    setError("");
    setAnswer("");

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      const res = await fetch(`/api/meetings/${meetingId}/qa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (data.success) {
        setAnswer(data.answer);
      } else {
        setError(data.error || "Failed to get answer.");
      }
    } catch (err) {
      setError("Something went wrong.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <h2 className="text-lg font-bold">Ask a question about this meeting</h2>

      <textarea
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="What were the main decisions? Any deadlines? Who is responsible for what?"
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-border bg-input"
      />

      <button
        onClick={askQuestion}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Ask"}
      </button>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {answer && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground mb-1">Answer</p>
          <p className="text-sm whitespace-pre-wrap">{answer}</p>
        </div>
      )}
    </div>
  );
}

