import React, { useState, useEffect } from 'react';
// import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { FilePlus2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Select, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';
import { SaveOutlined } from '@ant-design/icons';
import SelectRemainsModal from '@/components/CreateForms/SelectRemainsModal';
import {
    EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";

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

// interface OrderDetail {
//   id: string;
//   exit_number: string;
//   exit_date: string;
//   type_document_for_filter: IdName;
//   application_status_district: IdName;
//   confirmation_date: string;
//   is_approved: boolean;
//   user: string;
//   description: string;
//   from_district: IdName;
//   sender_from_district: IdName;
//   to_region: IdName;
//   recipient_region: IdName;
//   from_region: IdName;
//   sender_from_region: IdName;
//   to_district: IdName;
//   recipient_district: IdName;
//   products: Product[];
//   executors: Executor[];
// }

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
  const [viewMode, setViewMode] = useState<'orders' | 'letters' | 'files'>('orders');
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
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const { id } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);
  
      useEffect(() => {
          const fetchPDF = async () => {
              try {
              const response = await axiosAPI.get(
                  `region-orders/${id}/file/${selectedFile?.raw_number}`,
                  {
                  responseType: 'blob', 
                  }
              );
  
              const url = URL.createObjectURL(response.data);
              setPdfUrl(url);
              } catch (error) {
              console.error('PDF yuklanmadi:', error);
              }
          };
  
          if (id && selectedFile) {
              fetchPDF();
          }
    }, [id, selectedFile]);
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
      const response = await axiosAPI.post(`district-orders/files/create`, binary, {
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

  // const fetRemaindersUserWarehouse = async (warehouseId: string) => {
  //   try {
  //     setLoading(true)
  //     const remaindersResponse = await axiosAPI.post("remainders/warehouses", {
  //       warehouse: warehouseId,
  //       date: new Date().toISOString(),
  //     });

  //     if (remaindersResponse.status === 200) {
  //       setRemainders(remaindersResponse.data);
  //       setShowRemaindersModal(true);
  //     }
  //   } catch (error) {
  //     console.error("Qoldiqlarni olishda xatolik:", error);
  //   } finally {
  //     setLoading(false)
  //   }
  // }
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

        <div className="flex gap-8 mb-8 border-b border-gray-200 pb-2">
          <span
            onClick={() => setViewMode('orders')}
            className={`cursor-pointer pb-2 text-base font-medium transition-all duration-200 ${viewMode === 'orders'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
              }`}
          >
            Buyurtmalar oynasi
          </span>

          <span
            onClick={() => setViewMode('letters')}
            className={`cursor-pointer pb-2 text-base font-medium transition-all duration-200 ${viewMode === 'letters'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
              }`}
          >
            Respublikaga yuborilayotgan xatning ko‘rinishi
          </span>

          <span
            onClick={() => setViewMode('files')}
            className={`cursor-pointer pb-2 text-base font-medium transition-all duration-200 ${viewMode === 'files'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-blue-500'
              }`}
          >
            Fayllar ro‘yxati
          </span>
        </div>

        {/* 🔸 1. BUYURTMALAR OYNASI */}
        {viewMode === 'orders' && (
          <div>

            <div className="bg-white mb-6 overflow-hidden">
              <div className="flex items-center justify-between p-4">
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
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                >
                  <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Buyurtma uchun berilgan tovarlar ruyhati</Typography>
                </AccordionSummary>
                <AccordionDetails>

                  <div className="bg-transparent rounded-md p-2 flex justify-between mb-6">
                    <div className='flex items-center gap-3'>
                      <Button className='cursor-pointer'>
                        <Plus></Plus>
                        Kiritish
                      </Button>

                      <Button className='cursor-pointer'
                        onClick={() => setShowWarehouseSelect(true)}
                      >
                        Qoldiqlar
                      </Button>

                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Qidirish (Ctrl+F)"
                        className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                      />
                    </div>
                  </div>


                  <div className="bg-white rounded-xl mb-6 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyurtma turi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar nomi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar turi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni Tumandan</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni Sotuvdan</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Buyurtma bo'yicha izoh</th>
                          </tr>
                        </thead>
                        <tbody className=" bg-[#f2f2f2b6]">
                          {regionData.products?.map((product, index) => (
                            <tr key={index} className="hover:bg-indigo-50 transition-colors">
                              <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.row_number}</td>
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
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </AccordionDetails>
              </Accordion>
            </div>

            <div>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                >
                  <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Bekor qilingan tovarlar ruyhati</Typography>
                </AccordionSummary>
                <AccordionDetails>


                  <div className="bg-white rounded-xl mb-6 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyurtma turi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar nomi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar turi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Bekor qilish xolati</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Bekor qilish jujjati</th>
                          </tr>
                        </thead>
                        <tbody className=" bg-[#f2f2f2b6]">
                          {/* {regionData.cancelled_products?.map((cancelledproduct, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
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
                      ))} */}
                          <tr>
                            <td></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                </AccordionDetails>
              </Accordion>
            </div>

            <div>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                >
                  <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Kelishuvchilar ruyhati</Typography>
                </AccordionSummary>
                <AccordionDetails>


                  <div className="bg-transparent rounded-md p-2 flex justify-between mb-6">
                    <div className='flex items-center gap-3'>
                      <Button className='cursor-pointer'>
                        <Plus></Plus>
                        Kiritish
                      </Button>
                      <Button className='cursor-pointer'>
                        Yuborish
                      </Button>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        type="text"
                        placeholder="Qidirish (Ctrl+F)"
                        className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                      />
                    </div>
                  </div>


                  <div className="bg-white rounded-xl mb-6 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b-2">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajaruvchi xodim</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xujjat turi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Javob turi</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Izox</th>
                          </tr>
                        </thead>
                        <tbody className=" bg-[#f2f2f2b6]">
                          {regionData.executors?.map((executor, index) => (
                            <tr key={index} className="hover:bg-indigo-50 transition-colors">
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

                </AccordionDetails>
              </Accordion>
            </div>

            {/* Attach document */}
            <div className='flex items-center justify-center gap-10'>
              {/* File */}
              <div className='bg-blue-500 flex items-center justify-center p-3 rounded-lg'>
                <button className='flex items-center gap-2 cursor-pointer text-lg px-4 py-2 rounded-md text-white font-medium mb-2' onClick={() => setFileUploadModal(true)}>
                  <span><FilePlus2 /></span>
                  Hujjat biriktirish
                </button>
              </div>
              <TextArea style={{ width: "500px", height: "100px" }} placeholder='Qisqacha mazmun' />
              <button className='bg-blue-500 text-white py-6 px-6 rounded-lg cursor-pointer'>
                <SaveOutlined className='inline mr-3 text-lg' />
                Saqlash
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
                    className="bg-gray-100 p-2 rounded-lg text-sm cursor-pointer hover:bg-blue-400 hover:text-white ml-auto"
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
        )}

        {/* 🔸 2. YUBORILGAN XATNI KO‘RINISHI */}
        {viewMode === 'letters' && (
          <div className="p-6 bg-gray-50 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Yuborilgan xatni ko‘rinishi</h2>
            <p>Bu bo‘limda yuborilgan xat tafsilotlari chiqadi.</p>
            <p className="text-sm text-gray-500 mt-2">
              (Bu joyni keyinchalik o‘z API yoki table bilan to‘ldirish mumkin)
            </p>
          </div>
        )}

        {/* 🔸 3. FAYLLAR RO‘YXATI */}
        {viewMode === 'files' && (
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
                                          {regionData.exit_number}-{file.raw_number}
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
                                          onClick={() => setSelectedFile(file)}
                                          className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                                          title="Ko‘rish"
                                      >
                                          <EyeOutlined className="text-lg" />
                                      </button>
                                      <button
                                          onClick={() => handleDownload(file)}
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
                  <p className="text-gray-900 font-bold text-2xl text-center">
                      Hozircha fayllar mavjud emas.
                  </p>
              )}
              {/* 🟣 PDF modal */}
              {selectedFile && (
                  <div
                      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
                      onClick={() => setSelectedFile(null)}
                  >
                      <div
                          className="bg-white w-11/12 h-[90vh] rounded-xl overflow-hidden shadow-xl flex flex-col"
                          onClick={(e) => e.stopPropagation()}
                      >  
                         {pdfUrl && (
                                        <iframe
                                            src={pdfUrl}
                                            title="PDF Viewer"
                                            className="flex-1 border-none w-full h-screen"
                                        />
                          )}
                          <button
                              onClick={() => setSelectedFile(null)}
                              className="bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium"
                          >
                              Yopish
                          </button>
                      </div>
                  </div>
              )}
          </div>          
        )}


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