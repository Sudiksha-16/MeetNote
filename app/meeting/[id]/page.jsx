"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import TranscriptViewer from "@/components/transcript-viewer"
import SummaryPanel from "@/components/summary-panel"
import MeetingAnalytics from "@/components/meeting-analytics"
import AdvancedExport from "@/components/advanced-export"
import MeetingQA from "@/components/meeting-qa";




// ✅ helper to safely format duration in seconds
function formatDuration(sec) {
  const total = Number(sec)
  if (!total || isNaN(total)) return "0m 0s"

  const m = Math.floor(total / 60)
  const s = Math.floor(total % 60)
  return `${m}m ${s}s`
}

export default function MeetingDetailPage() {
  const [meeting, setMeeting] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("summary")
  const router = useRouter()
  const params = useParams() // ✅ Get params dynamically
  const meetingId = params?.id // ✅ Extract meeting ID safely

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const token = localStorage.getItem("authToken")
        if (!meetingId) return // prevent fetch if id missing

        const res = await fetch(`/api/meetings/${meetingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (res.ok) {
          const data = await res.json()
          setMeeting(data.meeting)
        } else {
          router.push("/dashboard")
        }
      } catch (err) {
        console.error("Error fetching meeting:", err)
        router.push("/dashboard")
      } finally {
        setLoading(false)
      }
    }

    fetchMeeting()
  }, [meetingId, router])

  // ✅ Delete handler
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this meeting? This cannot be undone.")) {
      return
    }

    try {
      const token = localStorage.getItem("authToken")

      const res = await fetch(`/api/meetings/${meetingId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data.success) {
        alert("Meeting deleted successfully.")
        router.push("/dashboard")
      } else {
        alert(data.error || "Failed to delete meeting.")
      }
    } catch (err) {
      console.error("Delete error:", err)
      alert("Something went wrong deleting the meeting.")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-muted-foreground">Loading meeting details...</p>
        </div>
      </div>
    )
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Meeting not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary hover:text-primary/80 flex items-center gap-1 transition"
          >
            ← Back to Meetings
          </button>

          <h1 className="text-xl font-bold text-foreground">{meeting.title}</h1>

          <div className="flex items-center gap-4">
            <AdvancedExport meeting={meeting} />
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 transition font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Meeting Info */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Date</p>
              <p className="text-foreground">{new Date(meeting.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Duration</p>
              <p className="text-foreground">
                {formatDuration(meeting.duration)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Status</p>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  meeting.status === "processed"
                    ? "bg-primary/20 text-primary"
                    : meeting.status === "processing"
                      ? "bg-accent/20 text-accent"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {meeting.status === "processing" && (
                  <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                )}
                {meeting.status}
              </span>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Sentiment</p>
              <p className="text-foreground capitalize">{meeting.sentiment || "analyzing..."}</p>
            </div>
          </div>

          {meeting.description && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-foreground">{meeting.description}</p>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-border sticky top-20 bg-background/80 backdrop-blur-md">
          {[
            { id: "summary", label: "Summary" },
            { id: "transcript", label: "Transcript" },
            { id: "analytics", label: "Analytics" },
            { id: "qa", label: "Q&A" },

          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div>
          {activeTab === "summary" && <SummaryPanel meeting={meeting} />}
          {activeTab === "transcript" && <TranscriptViewer meeting={meeting} />}
          {activeTab === "analytics" && <MeetingAnalytics meeting={meeting} />}
          {activeTab === "qa" && <MeetingQA meetingId={meeting._id} />}

        </div>
      </main>
    </div>
  )
}
