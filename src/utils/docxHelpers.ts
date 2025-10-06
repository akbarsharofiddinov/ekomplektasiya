// src/utils/docxHelpers.ts
// NOTE: mammoth noyob typingga ega bo'lmasligi mumkin, shuning uchun
// project ichida `src/custom.d.ts` ga `declare module 'mammoth';` qo'ying.

import mammoth from "mammoth";
import htmlDocx from "html-docx-js/dist/html-docx"; // default export works

export async function docxFileToHtml(file: File): Promise<string> {
  // mammoth.arrayBuffer(); mammoth.extractRawText ishlamaydi — biz to'liq HTML olamiz
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  // result.value is HTML string
  return result?.value ?? "";
}

export function htmlToDocxBlob(html: string): Blob {
  // html-docx-js expects a full HTML string (with <html><body>...)
  const content = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${html}</body></html>`;
  const converted = htmlDocx.asBlob(content);
  return converted;
}

export function downloadBlob(blob: Blob, filename = "document.docx") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
