"use client"

import { useState, useRef } from "react"
import AudioRecorder from "./audio-recorder"

export default function MeetingUpload({ onUpload }) {
  const [uploadMode, setUploadMode] = useState("record") // 'record' or 'file'
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [uploading, setUploading] = useState(false)
  const [recordedAudio, setRecordedAudio] = useState(null)
  const [recordingDuration, setRecordingDuration] = useState(0)
  const fileInputRef = useRef(null)

  const handleRecordingComplete = (audioBlob, duration) => {
    setRecordedAudio(audioBlob)
    setRecordingDuration(duration)
  }

  const uploadMeeting = async (audioBlob, fileName) => {
    if (!title.trim()) {
      alert("Please enter a meeting title")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("audio", audioBlob, fileName)
      formData.append("title", title)
      formData.append("description", description)

      const token = localStorage.getItem("authToken")
      const res = await fetch("/api/meetings/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        setTitle("")
        setDescription("")
        setRecordedAudio(null)
        setUploadMode("record")
        onUpload()
        alert("Meeting uploaded successfully!")
      } else {
        const error = await res.json()
        alert(`Upload failed: ${error.error}`)
      }
    } catch (err) {
      console.error("Upload error:", err)
      alert("Upload error. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      await uploadMeeting(file, file.name)
    }
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-6 sticky top-24">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-2">New Meeting</h2>
        <p className="text-sm text-muted-foreground">Upload or record a meeting to get started</p>
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          onClick={() => {
            setUploadMode("record")
            setRecordedAudio(null)
          }}
          className={`flex-1 py-2 rounded transition font-medium ${
            uploadMode === "record"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Record
        </button>
        <button
          onClick={() => setUploadMode("file")}
          className={`flex-1 py-2 rounded transition font-medium ${
            uploadMode === "file" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upload File
        </button>
      </div>

      {/* Meeting Details */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Meeting Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Q4 Planning Session"
            className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Add context about this meeting"
            rows="3"
            className="w-full px-4 py-2 rounded-lg border border-border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
        </div>
      </div>

      {/* Recording Section */}
      {uploadMode === "record" && (
        <div className="space-y-4">
          <AudioRecorder onRecordingComplete={handleRecordingComplete} />

          {recordedAudio && (
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm text-foreground font-medium mb-2">Recording ready</p>
              <p className="text-xs text-muted-foreground mb-4">
                Duration: {Math.floor(recordingDuration / 60)}m {recordingDuration % 60}s
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setRecordedAudio(null)}
                  className="flex-1 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary/5 transition font-medium"
                >
                  Discard
                </button>
                <button
                  onClick={() => uploadMeeting(recordedAudio, `recording-${Date.now()}.webm`)}
                  disabled={uploading || !title.trim()}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* File Upload Section */}
      {uploadMode === "file" && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="block w-full py-8 rounded-lg font-semibold text-center border-2 border-dashed border-primary text-primary cursor-pointer hover:bg-primary/5 transition disabled:opacity-50"
          >
            <div className="text-3xl mb-2">📁</div>
            <p>Click to upload or drag and drop</p>
            <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A or MP4 up to 500MB</p>
          </label>

          {uploading && (
            <div className="mt-4 p-4 bg-muted rounded-lg text-center">
              <div className="inline-block w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-sm text-muted-foreground">Processing your meeting...</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
