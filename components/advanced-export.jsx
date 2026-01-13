"use client"

import { useState } from "react"
import { Download, FileJson, FileText, Sheet, FileType, Copy, Check } from "lucide-react"

export default function AdvancedExport({ meeting }) {
  const [exporting, setExporting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = async (format) => {
    setExporting(true)
    try {
      const token = localStorage.getItem("authToken")
      let content = ""
      let filename = ""
      let mimeType = "text/plain"

      switch (format) {
        case "json":
          content = generateJSON(meeting)
          filename = `meeting-${meeting._id}.json`
          mimeType = "application/json"
          break
        case "markdown":
          content = generateMarkdown(meeting)
          filename = `meeting-${meeting._id}.md`
          mimeType = "text/markdown"
          break
        case "csv":
          content = generateCSV(meeting)
          filename = `meeting-${meeting._id}.csv`
          mimeType = "text/csv"
          break
        case "html":
          content = generateHTML(meeting)
          filename = `meeting-${meeting._id}.html`
          mimeType = "text/html"
          break
        case "pdf":
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
          break
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

  const copyToClipboard = () => {
    const text = generateMarkdown(meeting)
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const exportOptions = [
    { format: "json", label: "JSON", icon: FileJson, description: "Structured data format" },
    { format: "markdown", label: "Markdown", icon: FileText, description: "Readable format" },
    { format: "csv", label: "CSV", icon: Sheet, description: "Spreadsheet format" },
    { format: "html", label: "HTML", icon: FileType, description: "Web format" },
    { format: "pdf", label: "PDF", icon: Download, description: "Print-friendly" },
  ]

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={exporting}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {exporting ? "Exporting..." : "Export"}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-lg shadow-xl z-10 p-4">
          <p className="text-sm font-semibold text-foreground mb-3">Export As:</p>

          <div className="space-y-2 mb-4">
            {exportOptions.map(({ format, label, icon: Icon, description }) => (
              <button
                key={format}
                onClick={() => handleExport(format)}
                disabled={exporting}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted rounded-lg transition disabled:opacity-50 text-left"
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground">{description}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-border pt-3">
            <button
              onClick={copyToClipboard}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted rounded-lg transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  Copied to clipboard
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy to clipboard
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function generateJSON(meeting) {
  return JSON.stringify(
    {
      title: meeting.title,
      description: meeting.description,
      createdAt: meeting.createdAt,
      duration: meeting.duration,
      status: meeting.status,
      sentiment: meeting.sentiment,
      summary: meeting.summary,
      keyPoints: meeting.keyPoints || [],
      actionItems: meeting.actionItems || [],
      decisions: meeting.decisions || [],
      keywords: meeting.keywords || [],
      transcript: meeting.transcript,
      metadata: {
        wordCount: meeting.transcript?.split(/\s+/).length || 0,
        wordsPerMinute: Math.round((meeting.transcript?.split(/\s+/).length || 0) / Math.max(meeting.duration / 60, 1)),
      },
    },
    null,
    2,
  )
}

function generateMarkdown(meeting) {
  let md = `# ${meeting.title}\n\n`
  md += `**Date:** ${new Date(meeting.createdAt).toLocaleString()}\n`
  md += `**Duration:** ${Math.floor(meeting.duration / 60)}m ${meeting.duration % 60}s\n`
  md += `**Status:** ${meeting.status}\n`
  md += `**Sentiment:** ${meeting.sentiment || "N/A"}\n\n`

  if (meeting.description) {
    md += `**Description:** ${meeting.description}\n\n`
  }

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
    md += `## Decisions Made\n`
    meeting.decisions.forEach((decision) => {
      md += `- ${decision}\n`
    })
    md += "\n"
  }

  if (meeting.keywords && meeting.keywords.length > 0) {
    md += `## Keywords\n${meeting.keywords.join(", ")}\n\n`
  }

  if (meeting.transcript) {
    md += `## Full Transcript\n${meeting.transcript}\n`
  }

  return md
}

function generateCSV(meeting) {
  const rows = [
    ["Field", "Value"],
    ["Title", meeting.title],
    ["Date", new Date(meeting.createdAt).toLocaleString()],
    ["Duration", `${Math.floor(meeting.duration / 60)}m ${meeting.duration % 60}s`],
    ["Status", meeting.status],
    ["Sentiment", meeting.sentiment || "N/A"],
    ["Word Count", meeting.transcript?.split(/\s+/).length || 0],
  ]

  if (meeting.summary) {
    rows.push(["Summary", meeting.summary])
  }

  rows.push(["", ""])
  rows.push(["Key Points", ""])
  meeting.keyPoints?.forEach((point) => {
    rows.push(["", point])
  })

  rows.push(["", ""])
  rows.push(["Action Items", ""])
  meeting.actionItems?.forEach((item) => {
    rows.push(["", item])
  })

  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n")
}

function generateHTML(meeting) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${meeting.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
    h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
    h2 { color: #2563eb; margin-top: 20px; }
    .metadata { background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .metadata p { margin: 5px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .sentiment { padding: 10px; border-radius: 5px; font-weight: bold; }
    .sentiment.positive { background: #dcfce7; color: #166534; }
    .sentiment.neutral { background: #f5f5f5; color: #4b5563; }
    .sentiment.negative { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <h1>${meeting.title}</h1>
  <div class="metadata">
    <p><strong>Date:</strong> ${new Date(meeting.createdAt).toLocaleString()}</p>
    <p><strong>Duration:</strong> ${Math.floor(meeting.duration / 60)}m ${meeting.duration % 60}s</p>
    <p><strong>Status:</strong> ${meeting.status}</p>
    <p><strong>Sentiment:</strong> <span class="sentiment ${meeting.sentiment}">${meeting.sentiment || "N/A"}</span></p>
  </div>
  ${meeting.description ? `<p><strong>Description:</strong> ${meeting.description}</p>` : ""}
  ${meeting.summary ? `<h2>Summary</h2><p>${meeting.summary}</p>` : ""}
  ${meeting.keyPoints?.length ? `<h2>Key Points</h2><ul>${meeting.keyPoints.map((p) => `<li>${p}</li>`).join("")}</ul>` : ""}
  ${meeting.actionItems?.length ? `<h2>Action Items</h2><ul>${meeting.actionItems.map((i) => `<li>☐ ${i}</li>`).join("")}</ul>` : ""}
  ${meeting.decisions?.length ? `<h2>Decisions Made</h2><ul>${meeting.decisions.map((d) => `<li>${d}</li>`).join("")}</ul>` : ""}
  ${meeting.keywords?.length ? `<h2>Keywords</h2><p>${meeting.keywords.join(", ")}</p>` : ""}
  ${meeting.transcript ? `<h2>Full Transcript</h2><pre>${meeting.transcript}</pre>` : ""}
</body>
</html>
  `
  return html
}
