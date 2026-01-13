// Export utilities for various formats

export function generateCSV(meeting) {
  const csv = [
    ["Field", "Value"],
    ["Title", meeting.title],
    ["Date", new Date(meeting.createdAt).toLocaleString()],
    ["Duration", `${Math.floor(meeting.duration / 60)} min`],
    ["Language", meeting.language],
  ]

  // Add key points
  csv.push(["", ""])
  csv.push(["Key Points", ""])
  meeting.keyPoints.forEach((point) => {
    csv.push(["", point])
  })

  // Add action items
  csv.push(["", ""])
  csv.push(["Action Items", ""])
  meeting.actionItems.forEach((item) => {
    csv.push(["", item])
  })

  return csv.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")
}

export function generateMarkdown(meeting) {
  let md = `# ${meeting.title}\n\n`
  md += `**Date:** ${new Date(meeting.createdAt).toLocaleString()}\n`
  md += `**Duration:** ${Math.floor(meeting.duration / 60)} minutes\n\n`

  if (meeting.summary) {
    md += `## Summary\n${meeting.summary}\n\n`
  }

  if (meeting.keyPoints.length > 0) {
    md += `## Key Points\n`
    meeting.keyPoints.forEach((point) => {
      md += `- ${point}\n`
    })
    md += "\n"
  }

  if (meeting.actionItems.length > 0) {
    md += `## Action Items\n`
    meeting.actionItems.forEach((item) => {
      md += `- [ ] ${item}\n`
    })
    md += "\n"
  }

  if (meeting.transcript) {
    md += `## Transcript\n${meeting.transcript}\n`
  }

  return md
}

export function generateJSON(meeting) {
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
      },
    },
    null,
    2,
  )
}
