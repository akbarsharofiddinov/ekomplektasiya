import React, { useEffect, useMemo, useRef, useState } from "react";
import { renderAsync } from "docx-preview";   // npm i docx-preview
import * as XLSX from "xlsx";                 // npm i xlsx
import { inferMimeFromExt } from "@/utils/file_preview";

type Props = { file: File; className?: string; style?: React.CSSProperties };

export default function FilePreviewer({ file, className, style }: Props) {
  const [url, setUrl] = useState<string>();
  const ext = useMemo(() => file.name.split(".").pop()?.toLowerCase(), [file.name]);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => { URL.revokeObjectURL(u); };
  }, [file]);

  // DOCX
  const docxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (ext === "docx" && docxRef.current) {
      docxRef.current.innerHTML = "";
      renderAsync(file, docxRef.current, undefined, { className: "docx", inWrapper: true })
        .catch((e) => (docxRef.current!.innerHTML = `<div style="color:#dc2626">DOCX ochilmadi: ${e}</div>`));
    }
  }, [file, ext]);

  // XLS/XLSX
  const xlsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if ((ext === "xlsx" || ext === "xls") && xlsRef.current) {
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
          xlsRef.current!.innerHTML = `<div style="color:#dc2626">Excel ochilmadi: ${e}</div>`;
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file, ext]);

  if (ext === "pdf" && url) {
    return <iframe title={file.name} src={url} className={className} style={{ width: "100%", height: "100%", border: 0, ...style }} />;
  }
  if (["png", "jpg", "jpeg"].includes(ext || "") && url) {
    return (
      <div className={className} style={{ width: "100%", height: "100%", overflow: "auto", ...style }}>
        <img src={url} alt={file.name} style={{ maxWidth: "100%", height: "auto", display: "block", margin: "0 auto" }} />
      </div>
    );
  }
  if (ext === "docx") {
    return <div ref={docxRef} className={className} style={{ width: "100%", height: "100%", overflow: "auto", padding: 16, ...style }} />;
  }
  if (ext === "xlsx" || ext === "xls") {
    return <div ref={xlsRef} className={className} style={{ width: "100%", height: "100%", overflow: "auto", background: "white", ...style }} />;
  }
  if (ext === "doc") {
    return (
      <div className={className} style={{ padding: 16, ...style }}>
        <p style={{ color: "#b45309" }}>.DOC (97–2003) web’da preview qo‘llanmaydi. Iltimos, yuklab oling yoki serverda PDF/DOCX’ga konvert qiling.</p>
      </div>
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
