// MIME'ni kengaytmadan aniqlash
export function inferMimeFromExt(nameOrExt?: string): string | undefined {
  if (!nameOrExt) return;
  const ext = nameOrExt.includes(".")
    ? nameOrExt.split(".").pop()!.toLowerCase()
    : nameOrExt.toLowerCase();

  switch (ext) {
    case "pdf": return "application/pdf";
    case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    case "doc": return "application/msword";
    case "xlsx": return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    case "xls": return "application/vnd.ms-excel";
    case "png": return "image/png";
    case "jpg":
    case "jpeg": return "image/jpeg";
    default: return undefined;
  }
}

export function arrayBufferToFile(
  buf: ArrayBuffer,
  fileName: string,
  mime?: string
): File {
  const type = mime || inferMimeFromExt(fileName) || "application/octet-stream";
  const blob = new Blob([buf], { type });
  return new File([blob], fileName, { type });
}
