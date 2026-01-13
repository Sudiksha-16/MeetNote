"use client"

import { useState } from "react"

export default function ExportMenu({ meeting }) {
  const [exporting, setExporting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const token = localStorage.getItem("authToken")

      let content = ""
      let filename = ""
      let mimeType = ""

      if (format === "json") {
        content = generateJSON(meeting)
        filename = `meeting-${meeting._id}.json`
        mimeType = "application/json"
      } else if (format === "markdown") {
        content = generateMarkdown(meeting)
        filename = `meeting-${meeting._id}.md`
        mimeType = "text/markdown"
      } else if (format === "csv") {
        content = generateCSV(meeting)
        filename = `meeting-${meeting._id}.csv`
        mimeType = "text/csv"
      } else if (format === "pdf") {
        // For PDF, we would call the PDF generation endpoint
        const res = await fetch(`/api/export/${meeting._id}/pdf`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.ok) {
          const blob = await res.blob()
          downloadBlob(blob, `meeting-${meeting._id}.pdf`)
          setShowMenu(false)
          setExporting(false)
          return
        }
      }

      if (content) {
        const blob = new Blob([content], { type: mimeType })
        downloadBlob(blob, filename)
      }

      setShowMenu(false)
    } catch (err) {
      console.error("Export error:", err)
      alert("Export failed")
    } finally {
      setExporting(false)
    }
  }

  const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
      >
        {exporting ? "Exporting..." : "Export"}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
          <button onClick={() => handleExport("json")} className="w-full text-left px-4 py-2 hover:bg-muted transition">
            JSON
          </button>
          <button
            onClick={() => handleExport("markdown")}
            className="w-full text-left px-4 py-2 hover:bg-muted transition"
          >
            Markdown
          </button>
          <button onClick={() => handleExport("csv")} className="w-full text-left px-4 py-2 hover:bg-muted transition">
            CSV
          </button>
          <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-2 hover:bg-muted transition">
            PDF
          </button>
        </div>
      )}
    </div>
  )
}

function generateJSON(meeting) {
  return JSON.stringify(
    {
      title: meeting.title,
      createdAt: meeting.createdAt,
      summary: meeting.summary,
      keyPoints: meeting.keyPoints,
      actionItems: meeting.actionItems,
      decisions: meeting.decisions,
      transcript: meeting.transcript,
      metadata: {
        duration: meeting.duration,
        language: meeting.language,
        status: meeting.status,
        sentiment: meeting.sentiment,
      },
    },
    null,
    2,
  )
}

function generateMarkdown(meeting) {
  let md = `# ${meeting.title}\n\n`
  md += `**Date:** ${new Date(meeting.createdAt).toLocaleString()}\n`
  md += `**Duration:** ${Math.floor(meeting.duration / 60)} minutes\n`
  md += `**Status:** ${meeting.status}\n\n`

  if (meeting.summary) {
    md += `## Summary\n${meeting.summary}\n\n`
  }

  if (meeting.keyPoints && meeting.keyPoints.length > 0) {
    md += `## Key Points\n`
    meeting.keyPoints.forEach((point) => {
      md += `- ${point}\n`
    })
    md += "\n"
  }

  if (meeting.actionItems && meeting.actionItems.length > 0) {
    md += `## Action Items\n`
    meeting.actionItems.forEach((item) => {
      md += `- [ ] ${item}\n`
    })
    md += "\n"
  }

  if (meeting.decisions && meeting.decisions.length > 0) {
    md += `## Decisions\n`
    meeting.decisions.forEach((decision) => {
      md += `- ${decision}\n`
    })
    md += "\n"
  }

  if (meeting.transcript) {
    md += `## Transcript\n${meeting.transcript}\n`
  }

  return md
}

function generateCSV(meeting) {
  const csv = [["Field", "Value"]]

  csv.push(["Title", meeting.title])
  csv.push(["Date", new Date(meeting.createdAt).toLocaleString()])
  csv.push(["Duration", `${Math.floor(meeting.duration / 60)} minutes`])
  csv.push(["Status", meeting.status])
  csv.push(["Sentiment", meeting.sentiment || "N/A"])
  csv.push(["Summary", meeting.summary || ""])

  csv.push(["", ""])
  csv.push(["Key Points", ""])
  meeting.keyPoints?.forEach((point) => {
    csv.push(["", point])
  })

  csv.push(["", ""])
  csv.push(["Action Items", ""])
  meeting.actionItems?.forEach((item) => {
    csv.push(["", item])
  })

  return csv.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n")
}
