"use client"

import { useEffect, useState } from "react"

export default function SummaryPanel({ meeting: meetingProp, uploadedFile }) {
  const [meeting, setMeeting] = useState(meetingProp || null)
  const [loading, setLoading] = useState(false)

  // 🔄 keep local state in sync when detail page passes a meeting
  useEffect(() => {
    if (meetingProp) {
      setMeeting(meetingProp)
      setLoading(false)
    }
  }, [meetingProp])

  // 🎧 upload page flow: process audio only when we DON'T already have a meeting
  useEffect(() => {
    const processAudio = async () => {
      if (meetingProp) return        // already have full meeting from API (detail page)
      if (!uploadedFile) return

      setLoading(true)
      try {
        const res = await fetch("/api/process-meeting", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filePath: uploadedFile }), // path from upload
        })

        const data = await res.json()
        if (data.success) {
          setMeeting(data.meeting)
        } else {
          console.error("Processing failed:", data.error)
        }
      } catch (err) {
        console.error("Error:", err)
      } finally {
        setLoading(false)
      }
    }

    processAudio()
  }, [uploadedFile, meetingProp])

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-muted-foreground">Processing your audio...</p>
      </div>
    )
  }

  if (!meeting) {
    return <p className="text-muted-foreground">Upload an audio file to generate a summary.</p>
  }

  // ✅ at this point meeting has data (either from detail GET /api/meetings/[id] or process-meeting)
  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Meeting Summary</h2>
        <p className="text-foreground whitespace-pre-wrap">{meeting.summary}</p>
      </div>

      {meeting.keyPoints && meeting.keyPoints.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Key Points</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
            {meeting.keyPoints.map((point, idx) => (
              <li key={idx}>{point}</li>
            ))}
          </ul>
        </div>
      )}

      {meeting.actionItems && meeting.actionItems.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Action Items</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
            {meeting.actionItems.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {meeting.transcript && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Transcript</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">{meeting.transcript}</p>
        </div>
      )}
    </div>
  )
}
