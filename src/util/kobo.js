// Only individuals imported from a Kobo form have an application to show
function cameFromKobo(individual) {
  let jsonExt = individual?.jsonExt;
  if (typeof jsonExt === "string") {
    try {
      jsonExt = JSON.parse(jsonExt);
    } catch (e) {
      return false;
    }
  }
  return !!jsonExt?.kobo_uuid;
}

// A file size for people: 87676 -> "85.6 KB"
function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined || Number.isNaN(Number(bytes))) return "-";
  const units = ["B", "KB", "MB", "GB"];
  let size = Number(bytes);
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${unit ? size.toFixed(1) : size} ${units[unit]}`;
}

// How the document viewer shows a file: "pdf", "image", or null (download only)
function previewKind(mimetype) {
  if (mimetype === "application/pdf") return "pdf";
  if (["image/png", "image/jpeg", "image/gif", "image/webp"].includes(mimetype)) return "image";
  return null;
}

export { cameFromKobo, formatFileSize, previewKind };

// CommonJS compatibility for Node.js tests
if (typeof module !== "undefined" && module.exports) {
  module.exports = { cameFromKobo, formatFileSize, previewKind };
}
