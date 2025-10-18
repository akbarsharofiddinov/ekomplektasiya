import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderAsync } from "docx-preview";   // npm i docx-preview
import * as XLSX from "xlsx";                 // npm i xlsx
import { inferMimeFromExt } from "@/utils/file_preview";

type Props = { file: File; className?: string; style?: React.CSSProperties };

export default function FilePreviewer({ file, className, style }: Props) {
  const [url, setUrl] = useState<string>();
  const ext = useMemo(() => (file.name.split(".").pop() || "").toLowerCase(), [file.name]);

  // Blob URL lifecycle
  useEffect(() => {
    const u = URL.createObjectURL(file);
    console.log(u)
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  // ===== DOCX (docx-preview) =====
  const docxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ext !== "docx" || !docxRef.current) return;
    docxRef.current.innerHTML = "";
    renderAsync(file, docxRef.current, undefined, { className: "docx", inWrapper: true })
      .catch((e) => {
        if (docxRef.current) {
          docxRef.current.innerHTML = `<div style="color:#dc2626;padding:12px">DOCX ochilmadi: ${String(e)}</div>`;
        }
      });
  }, [file, ext]);

  // ===== DOCM (mammoth) =====
  const docmRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ext !== "docm" || !docmRef.current) return;
    let cancelled = false;
    const el = docmRef.current;
    el.innerHTML = "<div style='padding:8px;color:#6b7280'>Yuklanmoqda…</div>";

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // mammoth’ni brauzer buildi bilan dinamik yuklaymiz
        // TS uchun: src/types/mammoth.d.ts -> declare module "mammoth/mammoth.browser";
        const mammoth = await import("mammoth/mammoth.browser");
        const { value: html } = await mammoth.convertToHtml(
          { arrayBuffer: reader.result as ArrayBuffer },
        );
        if (!cancelled && docmRef.current) {
          docmRef.current.innerHTML = `
            <div style="padding:16px; line-height:1.6; color:#111827;">
              ${html}
            </div>
            <div style="padding:8px 16px; color:#6b7280; font-size:12px; border-top:1px solid #e5e7eb;">
              Eslatma: DOCM (macro-enabled) makrolarisiz ko‘rsatildi.
            </div>
          `;
        }
      } catch (e) {
        if (!cancelled && docmRef.current) {
          // Fallback: foydalanuvchiga yuklab olishni taklif qilish
          const dlUrl = URL.createObjectURL(file);
          docmRef.current.innerHTML = `
            <div style='padding:12px;color:#dc2626'>DOCM preview muvaffaqiyatsiz. Yuklab oling yoki PDF’ga konvert qiling. (${String(e)})</div>
            <a href="${dlUrl}" download="${file.name}" style="text-decoration:underline;color:#4f46e5;padding:8px 12px;display:inline-block">Faylni yuklab olish</a>
          `;
        }
      }
    };
    reader.readAsArrayBuffer(file);

    return () => { cancelled = true; };
  }, [file, ext]);

  // ===== XLS/XLSX (SheetJS) =====
  const xlsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!xlsRef.current || (ext !== "xlsx" && ext !== "xls")) return;
    xlsRef.current.innerHTML = "";
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const wb = XLSX.read(new Uint8Array(reader.result as ArrayBuffer), { type: "array" });
        const first = wb.Sheets[wb.SheetNames[0]];
        const html = XLSX.utils.sheet_to_html(first, { editable: false });
        xlsRef.current!.innerHTML = html;
        const table = xlsRef.current!.querySelector("table") as HTMLTableElement | null;
        if (table) {
          table.style.borderCollapse = "collapse";
          table.querySelectorAll("td,th").forEach((el) => {
            (el as HTMLElement).style.border = "1px solid #e5e7eb";
            (el as HTMLElement).style.padding = "6px 8px";
          });
        }
      } catch (e) {
        xlsRef.current!.innerHTML = `<div style="color:#dc2626;padding:12px">Excel ochilmadi: ${String(e)}</div>`;
      }
    };
    reader.readAsArrayBuffer(file);
  }, [file, ext]);

  // ===== Oddiy text (txt/csv/json/md/log) =====
  const textRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    if (!textRef.current) return;
    if (!["txt", "csv", "json", "md", "log"].includes(ext)) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (textRef.current) textRef.current.textContent = String(reader.result ?? "");
    };
    reader.readAsText(file);
  }, [file, ext]);

  // ===== Render branches =====
  if (ext === "pdf" && url) {
    return <iframe title={file.name} src={url} className={className} style={{ width: "100%", height: "100%", border: 0, ...style }} />;
  }

  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext) && url) {
    return (
      <div className={className} style={{ width: "100%", height: "100%", overflow: "auto", ...style }}>
        <img src={url} alt={file.name} style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }} />
      </div>
    );
  }

  if (ext === "docx") {
    return <div ref={docxRef} className={className} style={{ width: "100%", height: "100%", overflow: "auto", padding: 16, ...style }} />;
  }

  if (ext === "docm") {
    return <div ref={docmRef} className={className} style={{ width: "100%", height: "100%", overflow: "auto", background: "white", ...style }} />;
  }

  if (ext === "xlsx" || ext === "xls") {
    return <div ref={xlsRef} className={className} style={{ width: "100%", height: "100%", overflow: "auto", background: "white", ...style }} />;
  }

  if (ext === "doc") {
    return (
      <div className={className} style={{ padding: 16, ...style }}>
        <p style={{ color: "#b45309" }}>.DOC (97–2003) web’da preview qo‘llanmaydi. Yuklab oling yoki serverda PDF/DOCX’ga konvert qiling.</p>
      </div>
    );
  }

  if (["txt", "csv", "json", "md", "log"].includes(ext)) {
    return (
      <pre
        ref={textRef}
        className={className}
        style={{ width: "100%", height: "100%", overflow: "auto", margin: 0, padding: 16, background: "white", ...style }}
      />
    );
  }

  const mime = file.type || inferMimeFromExt(file.name) || "application/octet-stream";
  return (
    <div className={className} style={{ padding: 16, ...style }}>
      <p>Bu turdagi fayl uchun preview yo‘q. Yuklab olib ko‘ring.</p>
      <p style={{ color: "#6b7280" }}>MIME: {mime}</p>
    </div>
  );
}
