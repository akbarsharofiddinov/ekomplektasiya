/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
// import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { CircleCheckBig, Layers, Plus, Save, Search, Trash, X } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { Select, Button, Modal, message } from 'antd';

import { axiosAPI } from '@/services/axiosAPI';
import { useNavigate, useParams } from 'react-router-dom';
import {
  EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import { arrayBufferToFile, inferMimeFromExt } from "@/utils/file_preview";
import { toast } from 'react-toastify';
import FilePreviewModal from "@/components/files/FilePreviewModal";
import TextArea from 'antd/es/input/TextArea';


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



const RepublicOrderDetail: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const { id } = useParams();
  const [selectedFileMeta, setSelectedFileMeta] = useState<FileData | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const navigate = useNavigate();


  const handleView = async (f: FileData) => {
    try {
      setSelectedFileMeta(f);
      const res = await axiosAPI.get(`republic-orders/${id}/file/${f.raw_number}`, {
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
      const res = await axiosAPI.get(`republic-orders/${id}/file/${f.raw_number}`, {
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


  const fetchOrderDetail = async () => {
    try {
      const response = await axiosAPI.get(`republic-orders/detail/${id}`);
      setOrderData(response.data[0]);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentTypesList = async () => {
    try {
      const response = await axiosAPI.get('enumerations/document_types');
      setDocumentTypes(response.data);
    } catch (error) {
      console.log(error);
    }
  }
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await axiosAPI.get(`republic-orders/${id}/files/list`);
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

    if (id) fetchFiles();
  }, [id]);
  useEffect(() => {
    fetchOrderDetail();
    fetchDocumentTypesList();
  }, []);

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

  const getFileIcon = (fileName) => {
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

  // 📌 O'chirish funksiyasi
  const handleDeleteOrder = () => {
    if (!orderData || !orderData.id) {
      message.error("Buyurtma ID topilmadi!");
      return;
    }
    setDeleteModalError(null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!orderData || !orderData.id) {
      message.error("Buyurtma ma’lumoti topilmadi!");
      return;
    }

    try {
      const response = await axiosAPI.delete(
        `republic-orders/delete/${orderData.id}/`
      );

      if (response.status === 200) {
        message.success("Buyurtma muvaffaqiyatli o‘chirildi!");
        setIsDeleteModalOpen(false);

        setTimeout(() => {
          window.history.back();
        }, 1000);
      }
    } catch (error: any) {
      console.error("O‘chirishda xatolik:", error);

      // Agar backend "error" maydoni yuborsa, o‘sha xabarni modalga chiqaramiz
      const backendError =
        error?.response?.data?.error ||
        "Buyurtmani o‘chirishda xatolik yuz berdi!";

      setDeleteModalError(backendError);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteModalError(null);
  };

  return (
    <div className="min-h-screen py-2 px-2 bg-white">
      <div className="max-w-8xl mx-auto bg-white">
        <div>
          <div className="bg-white mb-6 overflow-hidden">
            <div className="flex items-center justify-between p-2">
              <button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish</p>
                <p className="text-md font-semibold text-gray-800">{orderData.exit_number}</p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
                <p className="text-md font-semibold text-gray-800">
                  {new Date(orderData.exit_date)
                    .toLocaleString('uz-UZ', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                    .replace(',', '. ')}
                </p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatdan</p>
                <p className="text-md font-semibold text-gray-800">{orderData.from_region?.name}</p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Respublikada qabul qiluvchi</p>
                <p className="text-md font-semibold text-gray-800">{orderData.sender_from_region?.name}</p>
              </div>

            </div>
          </div>

          <div>
            <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
              <div>
                <h1 className='text-xl text-[#000] font-semibold'>Buyurtma uchun berilgan tovarlar ruyhati</h1>
              </div>
              <div className='flex items-center gap-3'>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'>
                  <div className='bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors'>
                    <Plus className='w-3 h-3' />
                  </div>
                  Kiritish
                </button>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2.5 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'>
                  <div className='bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors'>
                    <Layers className='w-3 h-3' />
                  </div>
                  Qoldiqlar
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Qidirish (Ctrl+F)"
                    className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                  />
                </div>
              </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-2">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                    <tr className=" data-[state=selected]:bg-muted border-b transition-colors">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar nomi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar turi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Buyurtma bo'yicha izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderData.products && orderData.products.length > 0 ? (
                      orderData.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold text-sm">
                              {product.row_number}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.model?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-red-500 text-lg font-semibold">
                          Tovarlar mavjud emas
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          </div>


          <div>
            <div className="bg-transparent rounded-md p-2 flex items-center justify-between mb-2">
              <div>
                <h1 className='text-xl text-[#000] font-semibold'>Kelishuvchilar ruyhati</h1>
              </div>
              <div className='flex items-center gap-3'>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'>
                  <div className='bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors'>
                    <Plus className='w-3 h-3' />
                  </div>
                  Kiritish
                </button>
              </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-4">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                    <tr className="data-[state=selected]:bg-muted border-b transition-colors">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajaruvchi xodim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Javob turi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Izoh qoldiring</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {orderData.executors?.map((executor, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                        <td className="px-6 py-4 text-sm text-gray-700"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>

            <div className="bg-transparent rounded-md p-2 flex items-center justify-between mb-2">
              <div>
                <h1 className='text-xl text-[#000] font-semibold'>O'sti xat qo'yuvchi xodim</h1>
              </div>
              <div className='flex items-center gap-3'>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'>
                  <div className='bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors'>
                    <Plus className='w-3 h-3' />
                  </div>
                  Kiritish
                </button>
              </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-4">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                    <tr className='data-[state=selected]:bg-muted border-b transition-colors'>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xodim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sana</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* {orderData.executors?.map((executor, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                            <td className="px-6 py-4 text-sm text-gray-900"></td>
                            <td className="px-6 py-4 text-sm text-gray-900"></td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                          </tr>
                        ))} */}
                    <tr>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div>

            <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
              <div>
                <h1 className='text-xl text-[#000] font-semibold'>Ijrochilar ruyhati</h1>
              </div>
              <div className='flex items-center gap-3'>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'>
                  <div className='bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors'>
                    <Plus className='w-3 h-3' />
                  </div>
                  Kiritish
                </button>
              </div>
            </div>


            <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-4">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                    <tr className='data-[state=selected]:bg-muted border-b transition-colors'>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajaruvchi xodim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usti xat biriktiruvchi xodim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajarilish muddati</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status obzor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {/* {orderData.executors?.map((executor, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                            <td className="px-6 py-4 text-sm text-gray-900"></td>
                            <td className="px-6 py-4 text-sm text-gray-900"></td>
                            <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                            <td className="px-6 py-4 text-sm text-gray-900"></td>
                            <td className="px-6 py-4 text-sm text-gray-900"></td>
                            <td className="px-6 py-4 text-sm text-gray-700"></td>
                          </tr>
                        ))} */}
                    <tr>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* 🔸 3. FAYLLAR RO‘YXATI */}
        <div className="p-4">
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

                    <div className='flex'>

                      {/* 🔸 Fayl ma’lumotlari */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`p-3 rounded-lg ${bg}`}>
                          <div className={`${color} text-3xl`}>{icon}</div>
                        </div>
                        <div className="flex flex-col">
                          <h4 className="text-gray-800 font-semibold text-[12px] truncate w-40">
                            {file.file_name}
                          </h4>
                          {file.user}
                          <p className="text-gray-500 text-[12px] mt-1">{formatDate(file.date)}</p>
                        </div>
                      </div>

                      {/* 🔸 Action tugmalar */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => handleView(file)}
                          className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                          title="Ko‘rish"
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


                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-900 font-bold text-2xl text-center">
              Hozircha fayllar mavjud emas.
            </p>
          )}
          {/* 🟣 PDF modal */}
          {selectedFileMeta && (
            <FilePreviewModal
              open={previewOpen}
              file={previewFile}
              onClose={() => { setPreviewOpen(false); setPreviewFile(null); }}
              onDownload={() => { if (selectedFileMeta) handleDownloadFile(selectedFileMeta); }}
            />
          )}
        </div>
        <div className="sticky bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-sm z-40 px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
          {/* TextArea */}
          <div className="flex-1 max-w-md w-full">
            <TextArea
              placeholder='Qisqacha mazmun yozing...'
              className='rounded-xl border-2 border-gray-200 focus:border-blue-400 hover:border-gray-300 transition-colors'
              style={{ height: "30px" }}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              className='group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
            >
              <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                <CircleCheckBig className="w-3 h-3" />
              </div>
              <span>Tasdiqlash</span>
            </button>

            <button
              className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
            >
              <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                <Save className="w-3 h-3" />
              </div>
              <span>Saqlash</span>
            </button>
            <button
              className='group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
              onClick={handleDeleteOrder}
            >
              <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                <Trash className="w-3 h-3" />
              </div>
              <span>O‘chirish</span>
            </button>

          </div>
        </div>
      </div>

      {/* 🔴 O'chirish tasdiqlash modali */}
      <Modal
        title={
          deleteModalError
            ? null
            : "Buyurtmani o‘chirishni tasdiqlaysizmi?"
        }
        open={isDeleteModalOpen}
        closable={!deleteModalError}
        maskClosable={!deleteModalError}
        width={deleteModalError ? 520 : 420}
        centered
        footer={
          deleteModalError
            ? [
              <Button
                key="ok"
                type="primary"
                onClick={cancelDelete}
                style={{
                  width: 120,
                  fontWeight: 600,
                }}
              >
                OK
              </Button>,
            ]
            : [
              <Button key="cancel" onClick={cancelDelete}>
                Bekor qilish
              </Button>,
              <Button key="delete" danger onClick={confirmDelete}>
                Ha, o‘chirish
              </Button>,
            ]
        }
        bodyStyle={{
          textAlign: "center",
          padding: deleteModalError ? "16px 16px" : "16px",
        }}
      >
        {deleteModalError ? (
          <p
            style={{
              color: "#ff4d4f",
              fontSize: "20px",
              fontWeight: "700",
              textAlign: "center",
              lineHeight: "1.8",
            }}
          >
            {deleteModalError}
          </p>
        ) : (
          <p
            style={{
              fontSize: "16px",
              color: "#555",
              lineHeight: "1.6",
              marginBottom: 0,
            }}
          >
            Bu amalni qaytarib bo‘lmaydi. Davom etasizmi?
          </p>
        )}
      </Modal>

    </div>
  );
};

export default RepublicOrderDetail;