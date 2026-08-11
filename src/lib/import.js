import mammoth from "mammoth";

export const SUPPORTED_EXTENSIONS = ["txt", "md", "docx"];

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Very small markdown -> HTML pass covering the subset our editor supports
// (headings, bold, italic, lists, paragraphs). This is intentionally not a
// full CommonMark implementation -- see ARCHITECTURE.md for the tradeoff.
function markdownToHtml(md) {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let inList = null; // 'ul' | 'ol' | null

  const closeList = () => {
    if (inList) {
      html.push(`</${inList}>`);
      inList = null;
    }
  };

  const inline = (text) =>
    escapeHtml(text)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      closeList();
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      closeList();
      const level = heading[1].length;
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      continue;
    }
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) {
      if (inList !== "ul") {
        closeList();
        html.push("<ul>");
        inList = "ul";
      }
      html.push(`<li>${inline(bullet[1])}</li>`);
      continue;
    }
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (numbered) {
      if (inList !== "ol") {
        closeList();
        html.push("<ol>");
        inList = "ol";
      }
      html.push(`<li>${inline(numbered[1])}</li>`);
      continue;
    }
    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return html.join("\n");
}

function textToHtml(text) {
  return text
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br/>")}</p>`)
    .join("\n");
}

/**
 * Converts an uploaded file's raw bytes into {title, html} for a new document.
 */
export async function importFile(filename, buffer) {
  const ext = filename.split(".").pop()?.toLowerCase();
  const title = filename.replace(/\.[^.]+$/, "");

  if (ext === "docx") {
    const { value: html } = await mammoth.convertToHtml({ buffer });
    return { title, html, ext };
  }
  if (ext === "md") {
    return { title, html: markdownToHtml(buffer.toString("utf-8")), ext };
  }
  if (ext === "txt") {
    return { title, html: textToHtml(buffer.toString("utf-8")), ext };
  }
  throw new Error(
    `Unsupported file type ".${ext}". Supported types: ${SUPPORTED_EXTENSIONS.join(", ")}`
  );
}
