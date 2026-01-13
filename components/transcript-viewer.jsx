"use client"

import { useState } from "react"

export default function TranscriptViewer({ meeting }) {
  const [searchTerm, setSearchTerm] = useState("")

  const transcript = meeting.transcript || ""
  const lines = transcript.split("\n").filter((line) => line.trim())

  const filteredLines = searchTerm
    ? lines.filter((line) => line.toLowerCase().includes(searchTerm.toLowerCase()))
    : lines

  if (!transcript) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <p className="text-muted-foreground">Transcript not available yet</p>
      </div>
    )
  }

  // ✅ Highlight only the matching word(s) inside a line
  const getHighlightedText = (text, highlight) => {
    if (!highlight || !highlight.trim()) return text

    // Escape regex special characters
    const escaped = highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const regex = new RegExp(`(${escaped})`, "gi")

    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-300 text-black px-1 rounded">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-card border border-border rounded-xl p-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search in transcript..."
          className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Transcript Display */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4 max-h-screen overflow-y-auto">
        {searchTerm && filteredLines.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No results found for "{searchTerm}"
          </p>
        ) : (
          filteredLines.map((line, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg transition hover:bg-muted"
            >
              <p className="text-foreground leading-relaxed">
                {getHighlightedText(line, searchTerm)}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Word Count</p>
          <p className="text-2xl font-bold text-foreground">
            {transcript.split(/\s+/).length.toLocaleString()}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Paragraphs</p>
          <p className="text-2xl font-bold text-foreground">{lines.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Reading Time</p>
          <p className="text-2xl font-bold text-foreground">
            ~{Math.ceil(transcript.split(/\s+/).length / 200)} min
          </p>
        </div>
      </div>
    </div>
  )
}
