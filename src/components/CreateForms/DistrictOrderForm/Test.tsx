import { axiosAPI } from '@/services/axiosAPI';
import React, { useEffect } from 'react'

const docID = "9c7d6f94-a9b1-11f0-adb6-244bfe93ba23";

const Test: React.FC = () => {
  // const [messageFile, setMessageFile] = useState<File | null>(null);

  const handleDownload = async (fileUrl: string) => {
    const response = await fetch(fileUrl.split(" ").join("%"));
    const blob = await response.blob();

    const url = fileUrl.split(" ").join("%");
    const link = document.createElement("a");
    // 👇 Fayl nomini va kengaytmasini o'zgartiryapmiz
    link.href = url;
    link.setAttribute("download", "0000000004.docx");
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.URL.revokeObjectURL(url);
  };

  const getDistrictOrderFile = async (id: string) => {
    if (id) {
      try {
        const response = await axiosAPI.get(`district-orders/${id}/order-file`);
        if (response.status === 200) {
          // const urlParts = response.data.file_url.split("/");
          // const fileName = urlParts[urlParts.length - 1].split(".")[0]
          // const file = new File([response.data.file_url.split(" ").join("%")], `${fileName}.docx`, { type: "application/vnd.ms-word.document.macroEnabled.12" });
          // if (file) {
          //   setMessageFile(file)
          // }
          console.log(response.data)

          handleDownload(response.data.file_url)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  useEffect(() => {
    getDistrictOrderFile(docID)
  }, [])

  // useEffect(() => {
  //   if (messageFile) {
  //     const fileURL = URL.createObjectURL(messageFile);
  //     window.location.href = fileURL
  //   }
  // }, [messageFile])

  return (
    <>
      <div>Test</div>

      {/* ===== Yuborilayotgan xat ===== */}
      {/* {messageFile && (
        <div>
          <FilePreviewer file={messageFile} />
        </div>
      )} */}
    </>
  )
}

export default Test