/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { FilePlus2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { SaveOutlined } from '@ant-design/icons';

import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Button, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';
import {
    EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import SelectRemainsModal from '@/components/CreateForms/SelectRemainsModal';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks/hooks';
import DistrictOrderSigning from './DistrictOrderSigning';


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
    for_purpose: "signing" | "editing";
}

interface FileData {
    raw_number: string;
    user: string;
    file_name: string;
    extension: string;
    date: string;
}


const DistrictOrderDetail: React.FC = () => {
    const [orderData, setOrderData] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [fileUploadModal, setFileUploadModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
    const [viewMode, setViewMode] = useState<'orders' | 'letters' | 'files'>('orders');
    const [files, setFiles] = useState<FileData[]>([]);
    const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
    const [remainders, setRemainders] = useState<ProductRemainder[]>([]);
    const [showRemainders, setShowRemainders] = useState(false);
    const [documentFormData, setDocumentFormData] = useState<{
        selectedDocumentType: string;
        filename: string;
        extension: string;
        fileBinary: string;
    }>();

    const { id } = useParams();
    const { currentUserInfo } = useAppSelector(state => state.info);

    console.log(orderData?.for_purpose)

    const fetchOrderDetail = useCallback(async () => {
        try {
            const response = await axiosAPI.get(`district-orders/detail/${id}`);
            setOrderData(response.data[0])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }, [id]);

    const fetchDocumentTypesList = async () => {
        try {
            const response = await axiosAPI.get('enumerations/document_types');
            setDocumentTypes(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    const fetchRemaindersUserWarehouse = async () => {
        try {
            const response = await axiosAPI.get(`/warehouses/list?region=${currentUserInfo?.region.name}&district=${currentUserInfo?.district.name}`);
            if (response.status === 200) {
                const warehouseId = response.data[0].id;
                const remaindersResponse = await axiosAPI.post("remainders/warehouses", {
                    warehouse: warehouseId,
                    date: new Date().toISOString()
                });
                if (remaindersResponse.status === 200) {
                    setRemainders(remaindersResponse.data);
                    setShowRemainders(true);
                }
            }
        } catch (error) {
            console.log(error)
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
            id: orderData?.id,
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
            if (response.status === 200) {
                fetchOrderDetail();
                fetchDocumentTypesList();
                setFile(null);
                setDocumentFormData({} as {
                    selectedDocumentType: string;
                    filename: string;
                    extension: string;
                    fileBinary: string;
                });
                toast("Fayl muvaffaqiyatli yuklandi", { type: "success" });
            }
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        fetchOrderDetail();
        fetchDocumentTypesList();
    }, [fetchOrderDetail]);

    // 🟢 Fayllarni olish
    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const response = await axiosAPI.get(`district-orders/${id}/files/list`);
                if (response.status === 200) {
                    setFiles(response.data);
                }
            } catch (error) {
                console.error("Fayllarni olishda xato:", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchFiles();
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

    // 📥 Yuklab olish
    const handleDownload = (file: FileData) => {
        const link = document.createElement("a");
        link.href = `https://ekomplektasiya.uz/ekomplektasiya_backend/hs/district-orders/${id}/files/${file.file_name}`;
        link.download = file.file_name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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

    return (
        <>
            {
                orderData.for_purpose === "editing" ? (
                    <div className="min-h-screen py-2 px-2 bg-white">
                        <div className="max-w-8xl mx-auto bg-white">
                            {/* 🔹 Yuqoridagi text-style navigation */}
                            <div className="flex gap-8 mb-1 border-b border-gray-200 pb-2">
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
                                    Yuborilgan xatning ko‘rinishi
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
                                    {/* Header */}
                                    <div className="bg-white overflow-hidden">
                                        <div className="flex items-center justify-between p-4">
                                            <div className="text-center border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish</p>
                                                <p className="text-md font-semibold text-gray-800">{orderData.exit_number}</p>
                                            </div>

                                            <div className="text-center border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
                                                <p className="text-md font-semibold text-gray-800">{orderData.exit_date?.split("T").join(" ")}</p>
                                            </div>

                                            <div className="text-center border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tumandan</p>
                                                <p className="text-md font-semibold text-gray-800">{orderData.from_district?.name}</p>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatga</p>
                                                <p className="text-md font-semibold text-gray-800">{orderData.from_region?.name}</p>
                                            </div>

                                            <div className="text-center border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tumandan junatuvchi</p>
                                                <p className="text-md font-semibold text-gray-800">{orderData.recipient_district?.name}</p>
                                            </div>

                                            <div className="text-center border-gray-200">
                                                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatdan qabul qiluvchi</p>
                                                <p className="text-md font-semibold text-gray-800">{orderData.recipient_region?.name}</p>
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

                                                <div className="bg-transparent rounded-md flex justify-between mb-4">
                                                    <div className='flex items-center gap-3'>
                                                        <Button className='cursor-pointer'>
                                                            <Plus></Plus>
                                                            Kiritish
                                                        </Button>
                                                        <Button className='cursor-pointer' onClick={() => fetchRemaindersUserWarehouse()}>
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
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyurtma nomi</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyurtma turi</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                                                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                                                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Buyurtma bo'yicha izoh</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className=" bg-[#f2f2f2b6]">
                                                                {orderData.products?.map((product, index) => (
                                                                    <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.row_number}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900">{product.product?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.model?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900">{product.product_type?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.quantity}</td>
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
                                                <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Imzolovchilar ruyhati</Typography>
                                            </AccordionSummary>
                                            <AccordionDetails>

                                                <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
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
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Imzolovchi xodim</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim nomi</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Imzolash xoati</th>
                                                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sana</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className=" bg-[#f2f2f2b6]">
                                                                {orderData.executors?.map((executor, index) => (
                                                                    <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                                                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900">{executor.status?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{executor.executor?.name}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900"></td>
                                                                        <td className="px-6 py-4 text-sm text-gray-900">{executor.message}</td>
                                                                        <td className="px-6 py-4 text-sm text-gray-700">{executor.confirmation_date}</td>
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
                                                <iframe
                                                    src={`https://ekomplektasiya.uz/ekomplektasiya_backend/hs/district-orders/${id}/file/${selectedFile.raw_number}`}
                                                    title="PDF Viewer"
                                                    className="flex-1 border-none"
                                                />
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
                    </div>
                ) : (
                    <>
                        <DistrictOrderSigning />
                    </>
                )
            }

            {
                showRemainders && (
                    <SelectRemainsModal onClose={() => setShowRemainders(false)} remainders={remainders} />
                )
            }
        </>
    );
};

export default DistrictOrderDetail;
