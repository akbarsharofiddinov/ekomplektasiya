import { Trash2 } from "lucide-react";
import React, { useState, type DragEvent, type ChangeEvent } from "react";

interface FileDropZoneProps {
  file: File | null;
  setFile: React.Dispatch<React.SetStateAction<File | null>>;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ file, setFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  // Fayl tanlash (oddiy input orqali)
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) setFile(selectedFile);
    function getFileBuffer(file: File): Promise<ArrayBuffer> {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result as ArrayBuffer);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    }

    const arrayBufferPromise = getFileBuffer(selectedFile!);
    arrayBufferPromise.then((arrayBuffer) => {
      const bytes = new Uint8Array(arrayBuffer);
      console.log(bytes);
    });
  }

  // Dragging boshlanishi
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Dragging tugashi
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  // Fayl tashlash (drop)
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) setFile(droppedFile);
  };

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-end gap-4 justify-between">
      {!file && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center gap-4 p-10 text-center transition ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300"
            }`}
        >
          <p className="text-gray-600 mb-2">
            Faylni bu yerga tashlang yoki tanlang 👇
            <label
              htmlFor="fileInput"
              className="cursor-pointer text-blue-500 underline"
            >
              Fayl tanlash
            </label>
          </p>
          <input
            type="file"
            accept=".xlsx, .xls, .doc, .docx, .pdf"
            id="fileInput"
            onChange={handleFileChange}
            className="hidden"
          />

        </div>
      )}

      {file && (
        <div className="mt-4 text-center">
          <p className="font-medium">Tanlangan fayl:</p>
          <p className="text-sm text-gray-600 flex items-center gap-2 justify-center">{file.name} <span onClick={() => setFile(null)} className="cursor-pointer"><Trash2 size={16} color="red" /></span></p>
        </div>
      )}
    </div>
  );
}

export default FileDropZone;