"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"   // ✅ add this

export default function MeetingList({ meetings, loading }) {
  const [selectedMeeting, setSelectedMeeting] = useState(null)
  const router = useRouter()                  // ✅ hook

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center text-muted-foreground">
        <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p>Loading meetings...</p>
      </div>
    )
  }

  if (meetings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📭</div>
        <p className="text-foreground font-medium">No meetings yet</p>
        <p className="text-muted-foreground text-sm">Start by recording or uploading your first meeting</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {meetings.map((meeting) => (
        <div
          key={meeting._id}
          onClick={() => setSelectedMeeting(selectedMeeting === meeting._id ? null : meeting._id)}
          className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition cursor-pointer"
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-bold text-foreground">{meeting.title}</h3>
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
                  {meeting.status || "pending"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(meeting.createdAt).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <svg className="w-5 h-5 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {selectedMeeting === meeting._id && (
            <div className="mt-4 pt-4 border-t border-border space-y-3">
              {meeting.description && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground">{meeting.description}</p>
                </div>
              )}

              {meeting.summary && meeting.status === "processed" && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Summary</p>
                  <p className="text-sm text-foreground line-clamp-3">{meeting.summary}</p>
                </div>
              )}

              {meeting.keyPoints && meeting.keyPoints.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Key Points</p>
                  <ul className="space-y-1">
                    {meeting.keyPoints.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="text-xs text-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {/* ✅ VIEW DETAILS */}
                <button
                  className="flex-1 px-3 py-2 text-xs bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                  onClick={(e) => {
                    e.stopPropagation(); // so card doesn’t collapse
                    router.push(`/meeting/${meeting._id}`)   // matches your MeetingDetailPage route
                  }}
                >
                  View Details
                </button>

                {/* ✅ DOWNLOAD */}
                <button
                  className="flex-1 px-3 py-2 text-xs border border-primary text-primary rounded-lg hover:bg-primary/5 transition font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/api/export/${meeting._id}/pdf`, "_blank");
                  }}
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
