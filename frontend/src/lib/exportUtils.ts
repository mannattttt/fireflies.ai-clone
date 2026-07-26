import { MeetingDetail } from "./types";

/**
 * Trigger a browser download for a text string.
 */
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Format timestamp in seconds to m:ss format.
 */
function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Export meeting AI summary as a clean Markdown document (.md).
 */
export function exportSummaryAsMarkdown(meeting: MeetingDetail) {
  const dateStr = new Date(meeting.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const participantsList = meeting.participants.map((p) => `- ${p.name} (${p.email})`).join("\n");
  const summaryText = meeting.summary?.overview_text || "No AI summary generated.";

  const topicsList = meeting.key_topics.length > 0
    ? meeting.key_topics.map((t) => `- ${t.topic_text}`).join("\n")
    : "- None listed";

  const actionItemsList = meeting.action_items.length > 0
    ? meeting.action_items
      .map((a) => `- [${a.is_completed ? "x" : " "}] ${a.text}${a.assignee ? ` (@${a.assignee})` : ""}`)
      .join("\n")
    : "- None listed";

  const markdownContent = `# ${meeting.title}
*Date:* ${dateStr}  
*Duration:* ${Math.floor(meeting.duration_seconds / 60)} minutes  

## 👥 Participants
${participantsList}

---

## 📝 Meeting Summary
${summaryText}

---

## 📌 Key Topics
${topicsList}

---

## ✅ Action Items
${actionItemsList}
`;

  const cleanTitle = meeting.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  downloadFile(markdownContent, `${cleanTitle}_summary.md`, "text/markdown;charset=utf-8");
}

/**
 * Export meeting transcript as plain text (.txt).
 */
export function exportTranscriptAsText(meeting: MeetingDetail) {
  const dateStr = new Date(meeting.date).toLocaleDateString();

  const lines = meeting.transcript_segments.map(
    (seg) => `[${formatTimestamp(seg.start_time)}] ${seg.speaker_name}: ${seg.text}`
  );

  const textContent = `${meeting.title} — Transcript
Date: ${dateStr}
--------------------------------------------------

${lines.join("\n\n")}`;

  const cleanTitle = meeting.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  downloadFile(textContent, `${cleanTitle}_transcript.txt`, "text/plain;charset=utf-8");
}

/**
 * Export meeting transcript as WebVTT subtitles (.vtt).
 */
export function exportTranscriptAsVTT(meeting: MeetingDetail) {
  const formatVTTTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(3, "0")}`;
  };

  const vttLines = meeting.transcript_segments.map((seg, idx) => {
    return `${idx + 1}\n${formatVTTTime(seg.start_time)} --> ${formatVTTTime(seg.end_time)}\n<v ${seg.speaker_name}>${seg.text}\n`;
  });

  const vttContent = `WEBVTT - ${meeting.title}\n\n${vttLines.join("\n")}`;

  const cleanTitle = meeting.title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  downloadFile(vttContent, `${cleanTitle}_transcript.vtt`, "text/vtt;charset=utf-8");
}

/**
 * Open a clean printable PDF window formatted specifically as an Executive Summary Report.
 */
export function exportSummaryAsPDF(meeting: MeetingDetail) {
  const dateStr = new Date(meeting.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const participantsHTML = meeting.participants
    .map((p) => `<span style="display:inline-block; background:#f3f4f6; color:#374151; padding:4px 10px; border-radius:6px; font-size:12px; margin-right:6px; margin-bottom:6px;">${p.name}</span>`)
    .join("");

  const summaryParagraphs = (meeting.summary?.overview_text || "No AI summary available.")
    .split("\n")
    .map((p) => `<p style="line-height:1.6; color:#374151; margin-bottom:12px;">${p}</p>`)
    .join("");

  const topicsHTML = meeting.key_topics.length > 0
    ? meeting.key_topics.map((t) => `<li style="margin-bottom:6px; color:#1f2937;">${t.topic_text}</li>`).join("")
    : "<li>None listed</li>";

  const actionItemsHTML = meeting.action_items.length > 0
    ? meeting.action_items
      .map(
        (a) => `
            <div style="display:flex; items-center; gap:8px; margin-bottom:8px; background:#fafafa; border:1px solid #f3f4f6; padding:8px 12px; border-radius:8px;">
              <span style="color:${a.is_completed ? "#10b981" : "#9ca3af"}; font-weight:bold;">${a.is_completed ? "✓" : "○"}</span>
              <span style="color:#1f2937; ${a.is_completed ? "text-decoration:line-through; opacity:0.6;" : ""}">${a.text}</span>
              ${a.assignee ? `<span style="font-size:11px; background:#e0e7ff; color:#4338ca; padding:2px 6px; border-radius:4px; margin-left:auto;">@${a.assignee}</span>` : ""}
            </div>
          `
      )
      .join("")
    : "<p style='color:#9ca3af;'>No action items recorded.</p>";

  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${meeting.title} — Executive Summary Report</title>
        <style>
          @body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
          @page { size: A4; margin: 20mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; padding: 20px; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 24px; font-weight: 700; color: #111827; margin-bottom: 4px; }
          .meta { font-size: 13px; color: #6b7280; margin-bottom: 24px; border-bottom: 2px solid #6c5ce7; padding-bottom: 12px; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #6c5ce7; margin-top: 24px; margin-bottom: 12px; }
          .card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        </style>
      </head>
      <body>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <div style="width:28px; height:28px; background:#6c5ce7; color:white; font-weight:bold; border-radius:6px; display:flex; align-items:center; justify-center; text-align:center; line-height:28px;">F</div>
            <span style="font-weight:bold; font-size:16px; color:#6c5ce7;">Fireflies.ai Summary Report</span>
          </div>
        </div>

        <h1>${meeting.title}</h1>
        <div class="meta">
          <strong>Date:</strong> ${dateStr} &nbsp;|&nbsp; 
          <strong>Duration:</strong> ${Math.floor(meeting.duration_seconds / 60)} mins
        </div>

        <div className="section-title">👥 Participants</div>
        <div style="margin-bottom:20px;">
          ${participantsHTML}
        </div>

        <div class="section-title">📝 Executive Overview</div>
        <div class="card">
          ${summaryParagraphs}
        </div>

        <div class="section-title">📌 Key Topics & Outline</div>
        <div class="card">
          <ul style="padding-left:20px; margin:0;">
            ${topicsHTML}
          </ul>
        </div>

        <div class="section-title">✅ Action Items</div>
        <div>
          ${actionItemsHTML}
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(printHTML);
    printWindow.document.close();
  }
}

