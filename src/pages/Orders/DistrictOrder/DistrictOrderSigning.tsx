/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/UI/input';

import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { Button, Modal } from 'antd';
import {
  EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import { toast } from 'react-toastify';

import FilePreviewModal from "@/components/files/FilePreviewModal";
import { arrayBufferToFile, inferMimeFromExt } from "@/utils/file_preview";
import FilePreviewer from '@/components/files/FilePreviewer';

interface IdName {
  id: string;
  name: string;
}

interface Product {
  row_number: number;
  product: IdName;
  model: IdName;
  product_type: IdName;
  size: IdName;
  unit: IdName;
  quantity: number;
  order_type: IdName;
  description: string;
}

interface Executor {
  executor: IdName;
  status: IdName;
  message: string;
  confirmation_date: string;
}

interface OrderDetail {
  id: string;
  exit_number: string;
  exit_date: string;
  type_document_for_filter: IdName;
  application_status_district: IdName;
  confirmation_date: string;
  is_approved: boolean;
  user: string;
  description: string;
  from_district: IdName;
  sender_from_district: IdName;
  to_region: IdName;
  recipient_region: IdName;
  from_region: IdName;
  sender_from_region: IdName;
  to_district: IdName;
  recipient_district: IdName;
  products: Product[];
  executors: Executor[];
}

interface FileData {
  raw_number: string;
  user: string;
  file_name: string;
  extension: string;
  date: string;
}


const DistrictOrderSigning: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileData[]>([]);
  const [open, setOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [selectedFileMeta, setSelectedFileMeta] = useState<FileData | null>(null);
  const [messageFile, setMessageFile] = useState<File | null>(null);

  const { id } = useParams();

  const handleView = async (f: FileData) => {
    try {
      setSelectedFileMeta(f);
      const res = await axiosAPI.get(`district-orders/${id}/file/${f.raw_number}`, {
        responseType: "arraybuffer",
      });

      const suggestedName =
        f.file_name || `${orderData?.exit_number || "file"}-${f.raw_number}.${f.extension}`;
      const mime = inferMimeFromExt(suggestedName) || inferMimeFromExt(f.extension) || "application/octet-stream";

      const fileObj = arrayBufferToFile(res.data, suggestedName, mime);
      setPreviewFile(fileObj);
      setPreviewOpen(true);
    } catch (e) {
      console.error(e);
      toast("Faylni ochib bo‘lmadi", { type: "error" });
    }
  };


  const handleDownloadFile = async (f: FileData) => {
    try {
      const res = await axiosAPI.get(`district-orders/${id}/file/${f.raw_number}`, {
        responseType: "blob",
      });
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.file_name || `${orderData?.exit_number || "file"}-${f.raw_number}.${f.extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast("Yuklab olishda xatolik", { type: "error" });
    }
  };


  const handleCancel = () => {
    setOpen(false);
  };

  const fetchOrderDetail = useCallback(async () => {
    try {
      const response = await axiosAPI.get(`district-orders/detail/${id}`);
      setOrderData(response.data[0]);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetail();
  }, [fetchOrderDetail]);

  // 🟢 Fayllarni olish
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axiosAPI.get(`district-orders/${id}/files/list`);
        if (Array.isArray(response.data)) {
          setFiles(response.data);
        } else {
          console.error("Kutilmagan format:", response.data);
        }
      } catch (error) {
        console.error("Fayllarni olishda xato:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchMessageFileUrl = async () => {
      try {
        const response = await axiosAPI.get(`district-orders/${id}/order-file/`);
        const link = document.createElement("a");
        link.href = response.data.file_url;
        const fileName = response.data.file_url.split("/").pop() || "file";
        const fileExt = (fileName.split(".").pop() || "").toLowerCase();
        const mime = inferMimeFromExt(fileName) || inferMimeFromExt(fileExt) || "application/octet-stream";
        const res = await fetch(link.href);
        const arrayBuffer = await res.arrayBuffer();
        const fileObj = arrayBufferToFile(arrayBuffer, fileName, mime);
        setMessageFile(fileObj);
      } catch (error) {
        console.error("Xatolik:", error);
      }
    };

    if (id) {
      fetchFiles();
      fetchMessageFileUrl();
    }
  }, [id]);

  // 📅 Sana formatlash
  const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 📁 Fayl turiga qarab icon va rang qaytaruvchi funksiya
  const getFileIcon = (fileName: any) => {
    const ext = fileName.split(".").pop().toLowerCase();

    switch (ext) {
      case "pdf":
        return { icon: <FilePdfOutlined />, color: "text-red-500", bg: "bg-red-50" };
      case "doc":
      case "docx":
        return { icon: <FileWordOutlined />, color: "text-blue-500", bg: "bg-blue-50" };
      case "xls":
      case "xlsx":
        return { icon: <FileExcelOutlined />, color: "text-green-500", bg: "bg-green-50" };
      case "jpg":
      case "jpeg":
      case "png":
        return { icon: <FileImageOutlined />, color: "text-yellow-500", bg: "bg-yellow-50" };
      default:
        return { icon: <FileTextOutlined />, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };


  // 🟣 Yuklanayotgan holat    
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">Malumotlar topilmadi</div>
      </div>
    );
  }

  console.log(messageFile)

  return (
    <>

      <div className="min-h-screen py-2 px-2 bg-white">
        <div className="max-w-8xl mx-auto bg-white">

          {/* 🔸 1. BUYURTMALAR OYNASI */}
          <div className="p-6 bg-gray-50 rounded-lg shadow-sm mb-8 relative">
            <Button onClick={() => setOpen(true)} style={{ position: "absolute", top: 30, left: 30 }}>
              (QR code) tasdiqlash E-IMZO
            </Button>
            {
              messageFile && (
                <div style={{ width: "100%", height: "80vh", display: "flex", flexDirection: "column" }}>
                  <div style={{ flex: 1, overflow: "auto" }}>
                    <FilePreviewer file={messageFile!} />
                  </div>
                </div>
              )
            }
          </div>

          {/* 🔸 2. YUBORILGAN XATNI KO‘RINISHI */}

          <div className='mb-2'>
            <div className='flex flex-col gap-4'>
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Buyurtma uchun berilgan tovarlar ruyhati</Typography>

              {/* Tovarlar ro'yxati */}
              <div className="bg-white rounded-xl mb-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2">
                      <tr>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">№</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Tovar nomi</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Model</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Tovar turi</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">O'lcham</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">O'lchov birligi</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Soni</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Tovar bo'yicha izoh</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.products?.map((product, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="text-center px-6 py-4 text-sm text-gray-700 font-medium">{product.row_number}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.product?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700 font-medium">{product.model?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.product_type?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.quantity}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{product.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Imzolovchi xodimlar */}
            <div className='flex flex-col gap-4'>
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Imzolovchilar ro'yhati</Typography>

              <div className="bg-white rounded-xl mb-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2">
                      <tr>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">№</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Xabar xolati</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Imzolovchi xodim</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Lavozim</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Imzolash xoati</th>
                        <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Sana</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.executors?.map((executor, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{index + 1}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{executor.status?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700 font-medium">{executor.executor?.name}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700"></td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{executor.message}</td>
                          <td className="text-center px-6 py-4 text-sm text-gray-700">{executor.confirmation_date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* 🔸 3. FAYLLAR RO‘YXATI */}
          <div className="p-4">
            <Typography fontSize={"20px"} fontWeight={600} color="#0f172b" className="mb-4">
              Buyurtmaga biriktirilgan fayllar ro‘yxati
            </Typography>
            {files.length !== 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {files.map((file, index) => {
                  const { icon, color, bg } = getFileIcon(file.file_name);

                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col justify-between"
                    >
                      {/* 🔹 Exit number & Row number */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                          {orderData.exit_number}-{file.raw_number}
                        </span>
                      </div>

                      {/* 🔸 Fayl ma’lumotlari */}
                      <div className="flex items-center gap-4 mb-3">
                        <div className={`p-3 rounded-lg ${bg}`}>
                          <div className={`${color} text-3xl`}>{icon}</div>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-gray-800 font-semibold text-sm truncate w-48">
                            {file.file_name}
                          </h4>
                          {file.user}
                          <p className="text-gray-500 text-sm mt-1">{formatDate(file.date)}</p>
                        </div>
                      </div>

                      {/* 🔸 Action tugmalar */}
                      <div className="flex justify-end gap-3 mt-auto">
                        <button
                          onClick={() => handleView(file)}
                          className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                          title="Ko'rish"
                        >
                          <EyeOutlined className="text-lg" />
                        </button>

                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                          title="Yuklab olish"
                        >
                          <DownloadOutlined className="text-lg" />
                        </button>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-700 font-bold text-2xl text-center">
                Hozircha fayllar mavjud emas.
              </p>
            )}
          </div>

        </div>
      </div>

      {/* 🟣 PDF modal */}
      {selectedFileMeta && (
        <FilePreviewModal
          open={previewOpen}
          file={previewFile}
          onClose={() => { setPreviewOpen(false); setPreviewFile(null); }}
          onDownload={() => { if (selectedFileMeta) handleDownloadFile(selectedFileMeta); }}
        />
      )}

      <Modal
        title="E-IMZO maxfiy raqamini kiriting !"
        open={open}
        onCancel={handleCancel}
        style={{ minWidth: "600px" }}
        footer={null} // footer qo'l bilan yozamiz
      >
        <div className='flex flex-col gap-3 min-h-[200px]'>
          <Input
            placeholder="Kodni kiriting..."
            className='bg-gray-50 mt-8 px-2 py-6 text-[20px]'
          />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "auto",
            }}
          >
            <Button type="primary">
              Tasdiqlash
            </Button>
            <Button onClick={handleCancel}>Chiqish</Button>
          </div>
        </div>
      </Modal>

    </>
  );
};

export default DistrictOrderSigning;
