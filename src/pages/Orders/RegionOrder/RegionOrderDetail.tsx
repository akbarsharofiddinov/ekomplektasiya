/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
// import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { CircleCheckBig, FilePlus2, Layers, Plus, Save, Search, Trash, X } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { axiosAPI } from '@/services/axiosAPI';
import { useNavigate, useParams } from 'react-router-dom';
import { Select, Button, Modal, message } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';
import { SaveOutlined } from '@ant-design/icons';
import SelectRemainsModal from '@/components/CreateForms/SelectRemainsModal';
import {
  EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import { arrayBufferToFile, inferMimeFromExt } from "@/utils/file_preview";
import { toast } from 'react-toastify';
import FilePreviewModal from "@/components/files/FilePreviewModal";


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
  input_number: string;
  input_date: string;
  is_seen: boolean;
  type_document_for_filter: TypeDocumentForFilter;
  application_status_region: ApplicationStatusRegion;
  confirmation_date: string;
  is_approved: boolean;
  user: string;
  description: string;
  from_district: RegionOrDistrict;
  sender_from_district: RegionOrDistrict;
  to_region: RegionOrDistrict;
  recipient_region: RegionOrDistrict;
  from_region: RegionOrDistrict;
  sender_from_region: RegionOrDistrict;
  to_district: RegionOrDistrict;
  recipient_district: RegionOrDistrict;
  products: Products[];
  cancelled_products: any[]; // agar bekor qilingan mahsulotlar keyin kelsa, alohida type berish mumkin
  executors: Executors[];
  goods_received: any[]; // agar keyinchalik tovar qabul qilish ma'lumotlari kelsa
}

interface TypeDocumentForFilter {
  id: string;
  name: string;
}

interface ApplicationStatusRegion {
  id: string;
  name: string;
}

interface RegionOrDistrict {
  id: string;
  name: string;
}

interface Products {
  row_number: number;
  product: SimpleItem;
  model: SimpleItem;
  product_type: SimpleItem;
  size: SimpleItem;
  unit: SimpleItem;
  quantity: number;
  order_type: SimpleItem;
  description: string;
}

interface Executors {
  row_number: number;
  executor: SimpleItem;
  executor_type: SimpleItem;
  status_message: SimpleItem;
  position: SimpleItem;
  comment: string;
}

interface SimpleItem {
  id: string;
  name: string;
}

// 🔹 Turlar
interface IdName {
  id: string;
  name: string;
}

interface FileData {
  raw_number: string;
  user: string;
  file_name: string;
  extension: string;
  date: string;
}

const RegionOrderDetail: React.FC = () => {
  const [regionData, setRegionData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [warehouses, setWarehouses] = useState<IdName[]>([]);
  const [districts, setDistricts] = useState<IdName[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>("");
  const [remainders, setRemainders] = useState<any[]>([]);
  const [showWarehouseSelect, setShowWarehouseSelect] = useState(false);
  const [showRemaindersModal, setShowRemaindersModal] = useState(false);
  const [documentFormData, setDocumentFormData] = useState<{
    selectedDocumentType: string;
    filename: string;
    extension: string;
    fileBinary: string;
  }>();
  const [files, setFiles] = useState<FileData[]>([]);
  const { id } = useParams();
  const [selectedFileMeta, setSelectedFileMeta] = useState<FileData | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchOrderDetail = async () => {
    try {
      const response = await axiosAPI.get(`region-orders/detail/${id}`);
      setRegionData(response.data[0]);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const handleView = async (f: FileData) => {
    try {
      setSelectedFileMeta(f);
      const res = await axiosAPI.get(`region-orders/${id}/file/${f.raw_number}`, {
        responseType: "arraybuffer",
      });

      const suggestedName =
        f.file_name || `${regionData?.exit_number || "file"}-${f.raw_number}.${f.extension}`;
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
      const res = await axiosAPI.get(`region-orders/${id}/file/${f.raw_number}`, {
        responseType: "blob",
      });
      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = f.file_name || `${regionData?.exit_number || "file"}-${f.raw_number}.${f.extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      toast("Yuklab olishda xatolik", { type: "error" });
    }
  };

  useEffect(() => {
    if (file) {
      setDocumentFormData(prev => ({ ...prev!, filename: file.name, extension: file.name.split('.').pop()! }))
      console.log(documentFormData)
    }

  }, [file, documentFormData?.filename, documentFormData?.extension]);

  // Handle file attach
  const handleFileAttach = async () => {
    // Params
    const params = {
      id: regionData?.id,
      file_name: documentFormData?.filename,
      extension: documentFormData?.extension,
      file_type: "ЗаявкаДокументПоРайон"
    }
    try {
      const arrayBuffer = await file?.arrayBuffer();
      const binary = new Uint8Array(arrayBuffer!);
      const response = await axiosAPI.post(`region-orders/files/create`, binary, {
        params,
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      })
      console.log(response)
    } catch (error) {
      console.log(error)
    }
  };


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
        const response = await axiosAPI.get(`region-orders/${id}/files/list`);
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

  // 🔹 Viloyat bo‘yicha omborlarni olish
  const fetchWarehousesByRegion = async () => {
    try {
      if (!regionData?.to_region?.id) return;
      const response = await axiosAPI.get(
        `warehouses/list?region=${regionData.to_region.id}`
      );
      if (response.status === 200) {
        setWarehouses(response.data);
      }
    } catch (error) {
      console.error("Omborlarni olishda xatolik:", error);
    }
  };

  // 🔹 Tumanlarni olish (viloyat bo‘yicha)
  const fetchDistrictsByRegion = async () => {
    try {
      if (!regionData?.to_region?.id) return;
      const response = await axiosAPI.get(
        `districts/list?region=${regionData.to_region.id}`
      );
      if (response.status === 200) {
        setDistricts(response.data); // ✅ endi to‘g‘ri statega yozamiz
      }
    } catch (error) {
      console.error("Tumanlarni olishda xatolik:", error);
    }
  };

  // 🔹 Modal ochilganda tumanlar yuklanadi
  useEffect(() => {
    if (showWarehouseSelect) fetchDistrictsByRegion();
  }, [showWarehouseSelect]);


  // 🔹 Tanlangan tumandan ombor topish va qoldiqlarni olish
  const fetchRemaindersByDistrict = async (districtId: string) => {
    try {
      setLoading(true);

      // 1️⃣ Avvalo, shu tuman uchun ombor topamiz
      const warehouseRes = await axiosAPI.get(
        `warehouses/list?district=${districtId}`
      );

      if (warehouseRes.status === 200 && warehouseRes.data.length > 0) {
        const warehouseId = warehouseRes.data[0].id;

        // 2️⃣ Ombor orqali qoldiqlarni olish
        const remaindersResponse = await axiosAPI.post("remainders/warehouses", {
          warehouse: warehouseId,
          date: new Date().toISOString(),
        });

        if (remaindersResponse.status === 200) {
          setRemainders(remaindersResponse.data);
          setShowRemaindersModal(true);
        }
      } else {
        console.warn("Ushbu tumanga tegishli ombor topilmadi.");
      }
    } catch (error) {
      console.error("Qoldiqlarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Tuman tanlanadi
  // const handleSelectDistrict = async (districtId: string) => {
  //   setSelectedWarehouse(districtId);
  //   setShowWarehouseSelect(false);
  //   await fetchRemaindersByDistrict(districtId);

  // 🔹 Modal ochilganda tumanlar yuklanadi
  useEffect(() => {
    if (showWarehouseSelect) fetchDistrictsByRegion();
  }, [showWarehouseSelect]);

  // 🔹 Tuman tanlanganida
  const handleSelectDistrict = async (districtId: string) => {
    setSelectedWarehouse(districtId); // endi bu district id
    setShowWarehouseSelect(false);
    await fetchRemaindersByDistrict(districtId);
  };

  const handleDownload = async (file) => {
    try {
      const response = await axiosAPI.get(
        `region-orders/${id}/file/${file.file_name}`,
        {
          responseType: "blob", // fayl sifatida olish uchun
        }
      );

      const blobUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.setAttribute("download", file.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl); // xotirani tozalash
    } catch (error) {
      console.error("Faylni yuklab olishda xato:", error);
    }
  };
  useEffect(() => {
    if (showWarehouseSelect) fetchWarehousesByRegion();

  }, [showWarehouseSelect])

  // // 🔹 Omborni tanlanganda qoldiqlarni olish
  // const handleSelectWarehouse = async (warehouseId: string) => {
  //   setSelectedWarehouse(warehouseId);
  //   setShowWarehouseSelect(false);
  //   await fetchRemaindersUserWarehouse(warehouseId);
  // };
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

  // 📌 O'chirish funksiyasi
  const handleDeleteOrder = () => {
    if (!regionData || !regionData.id) {
      message.error("Buyurtma ID topilmadi!");
      return;
    }
    setDeleteModalError(null);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!regionData || !regionData.id) {
      message.error("Buyurtma ma’lumoti topilmadi!");
      return;
    }

    try {
      const response = await axiosAPI.delete(
        `region-orders/delete/${regionData.id}/`
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!regionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">Маълумот топилмади</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 px-2 bg-white">

      <div className="max-w-8xl mx-auto bg-white">
        {/* 🔸 1. BUYURTMALAR OYNASI */}
        <div>
          <div className="bg-white overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <Button
                type='text'
                size="small"
                onClick={() => navigate(-1)}
                className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish</p>
                <p className="text-md font-semibold text-gray-800">{regionData.exit_number}</p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
                <p className="text-md font-semibold text-gray-800">
                  {regionData.exit_date.split("T").join("  ")}
                </p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyat</p>
                <p className="text-md font-semibold text-gray-800">{regionData.to_region?.name}</p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatdan qabul qiluvchi</p>
                <p className="text-md font-semibold text-gray-800">{regionData.sender_from_region?.name}</p>
              </div>

            </div>
          </div>

          <div>
            <div className="bg-transparent rounded-md p-2 flex justify-between mb-1">
              <div>
                <h1 className='font-semibold text-xl text-[#000]'>Buyurtma uchun berilgan tovarlar ruyhati</h1>
              </div>
              <div className='flex items-center gap-3'>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'>
                  <div className='bg-white/20 p-1 rounded-md group-hover:bg-white/30 transition-colors'>
                    <Plus className='w-3 h-3' />
                  </div>
                  Kiritish
                </button>
                <button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm px-2.5 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-normal cursor-pointer'
                  onClick={() => setShowWarehouseSelect(true)}
                >
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


            <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-8">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                    <tr className=" data-[state=selected]:bg-muted border-b transition-colors">
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">№</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Buyurtma turi</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Tovar nomi</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Tovar turi</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Model</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lcham</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lchov birligi</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Soni</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Soni Tumandan</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Soni Sotuvdan</th>
                      <th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Buyurtma bo'yicha izoh</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regionData.products && regionData.products.length > 0 ? (
                      regionData.products.map((product, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm">
                              {product.row_number}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.order_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.model?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.quantity}</td>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-6 text-center text-gray-500 text-sm font-semibold">
                          Tovar qo'shilmagan
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>
            </div>
          </div>

          <div>
            <div className='mb-2 flex items-center justify-between'>
              <h1 className='font-semibold text-xl text-[#000]'>Bekor qilingan tovarlar ruyhati</h1>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Qidirish (Ctrl+F)"
                  className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                />
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-8">
              <div className="overflow-x-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
                    <tr className=" data-[state=selected]:bg-muted border-b transition-colors">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Buyurtma turi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tovar nomi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Tovar turi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Model</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">O'lcham</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">O'lchov birligi</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Soni</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Bekor qilish xolati</th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-600">Bekor qilish jujjati</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regionData.cancelled_products && regionData.cancelled_products.length > 0 ? (
                      regionData.cancelled_products.map((cancelledproduct, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cancelledproduct.row_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cancelledproduct.order_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{cancelledproduct.product?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{cancelledproduct.product_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cancelledproduct.model?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{cancelledproduct.size?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{cancelledproduct.unit?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{cancelledproduct.quantity}</td>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{cancelledproduct.description}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={11} className="py-6 text-center text-gray-500 text-sm font-semibold">
                          Bekor qilingan tovarlar mavjud emas
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
                <h1 className='text-xl text-[#000] font-semibold'>Imzolovchilar</h1>
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
                    <tr className=" data-[state=selected]:bg-muted border-b transition-colors">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">№</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Xabar xolati</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Bajaruvchi xodim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Xujjat turi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Lavozim</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Javob turi</th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Izox</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {regionData.executors?.map((executor, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-all duration-200">
                        <td className="px-6 py-4 text-sm text-gray-900">{executor?.row_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{executor.status_message?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{executor.executor?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{executor.executor_type?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">{executor.position?.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                        <td className="px-6 py-4 text-sm text-gray-700">{executor.comment}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-semibold text-xl text-[#000]'>Hujjatlar ruyhati</h1>
            </div>
            {/* Attach document */}
            <div className='flex items-center justify-center gap-6 p-6'>
              {/* File Upload Button */}
              <button
                onClick={() => setFileUploadModal(true)}
                className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
              >
                <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                  <FilePlus2 className='w-3.5 h-3.5' />
                </div>
                <span>Hujjat biriktirish</span>
              </button>
            </div>

            {fileUploadModal && (
              <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setFileUploadModal(false)}>
                <div className="bg-white rounded-lg p-6 w-96 flex flex-col" onClick={(e) => e.stopPropagation()}>
                  {/* Top */}
                  <div className='flex items-center justify-between mb-4 pb-2 border-b'>
                    <h2 className="text-xl font-semibold">Hujjat biriktirish</h2>
                    <button className='text-2xl' onClick={() => setFileUploadModal(false)}>&times;</button>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hujjat turi</label>
                    <Select
                      style={{ width: '100%' }}
                      placeholder="Hujjat turini tanlang"
                      onChange={(value) => {
                        console.log(value)
                        // setDocumentFormData(prev => ({ ...prev!, selectedDocumentType: value }))
                      }}
                      options={documentTypes.map(docType => ({ value: docType.id, label: docType.name }))}
                    />
                  </div>
                  <div className="mb-4">
                    <FileDropZone file={file} setFile={setFile} />
                  </div>

                  <Button
                    className="bg-blue-500 p-2 rounded-lg text-sm cursor-pointer hover:bg-blue-600 ml-auto"
                    onClick={() => {
                      setFileUploadModal(false);
                      handleFileAttach()
                    }}
                    disabled={!file && !documentFormData?.selectedDocumentType}>
                    Yuklash
                  </Button>
                </div>
              </div>
            )}
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
                      <span className="text-[13px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                        {regionData.exit_number}-{file.raw_number}
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
            <p className="text-gray-500 font-semibold text-lg text-center">
              Hozircha fayllar mavjud emas
            </p>
          )}
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

      {/* 🔹 1 - Modal: Ombor tanlash oynasi */}
      <Modal
        title="Tuman tanlash"
        open={showWarehouseSelect}
        onCancel={() => setShowWarehouseSelect(false)}
        footer={null}
        centered
        width={400}
      >
        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Viloyat:{" "}
            <span className="font-semibold text-gray-800">
              {regionData?.to_region?.name || "Noma’lum"}
            </span>
          </label>

          <Select
            showSearch
            style={{ width: "100%" }}
            placeholder="Tuman tanlang"
            options={districts.map((d) => ({ label: d.name, value: d.id }))} // ✅ endi districts ishlatyapmiz
            onChange={(value) => handleSelectDistrict(value)}
            value={selectedWarehouse || undefined}
            loading={loading}
          />
        </div>
      </Modal>

      {/* 🔴 O'chirish tasdiqlash modali */}
      {/* <Modal
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
      </Modal> */}
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
        onCancel={cancelDelete} // ✅ shu qator “X” bosilganda modalni yopadi
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


      {/* 🔹 2 - Modal: Qoldiqlarni ko‘rsatish oynasi */}
      {showRemaindersModal && (
        <SelectRemainsModal
          remainders={remainders}
          onClose={() => setShowRemaindersModal(false)}
        />
      )}

    </div>
  );
};

export default RegionOrderDetail; 