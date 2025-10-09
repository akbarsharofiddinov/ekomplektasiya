/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
// import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { FilePlus2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Button, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';


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

const DistrictOrderDetail: React.FC = () => {
    const [orderData, setOrderData] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [fileUploadModal, setFileUploadModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
    const [documentFormData, setDocumentFormData] = useState<{
        selectedDocumentType: string;
        filename: string;
        extension: string;
        fileBinary: string;
    }>();

    const { id } = useParams();

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

    const fetchDocumentTypesList = async () => {
        try {
            const response = await axiosAPI.get('enumerations/document_types');
            setDocumentTypes(response.data);
        } catch (error) {
            console.log(error);
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
            console.log(binary)
            // const response = await axiosAPI.post(`files/create/`, arrayBuffer, {
            //     params,
            //     headers: { 'Content-Type': 'application/octet-stream' }
            // })
            // console.log(response)
        } catch (error) {
            console.log(error)
        }
    };

    useEffect(() => {
        fetchOrderDetail();
        fetchDocumentTypesList();
    }, [fetchOrderDetail]);

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
                <div className="text-red-600 text-xl">Маълумот топилмади</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-2 px-2 bg-white">
            <div className="max-w-8xl mx-auto bg-white">
                {/* Header */}
                <div className="bg-white mb-6 overflow-hidden">
                    <div className="flex items-center justify-between p-4">
                        <div className="text-center border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish</p>
                            <p className="text-md font-semibold text-gray-800">{orderData.exit_number}</p>
                        </div>

                        <div className="text-center border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
                            <p className="text-md font-semibold text-gray-800">{orderData.exit_date.split("T").join(" ")}</p>
                        </div>

                        <div className="text-center border-gray-200">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tumandan</p>
                            <p className="text-md font-semibold text-gray-800">{orderData.from_district?.name}</p>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyat</p>
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
                    <Accordion defaultExpanded>
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
                                    <Button className='cursor-pointer'>
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
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1a-content"
                        >
                            <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Imzolovchilar ruyhati</Typography>
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
                    <div>
                        <button className='flex items-center gap-2 cursor-pointer text-sm bg-blue-500 px-4 py-2 rounded-md text-white font-medium mb-2' onClick={() => setFileUploadModal(true)}>
                            <span><FilePlus2 /></span>
                            Hujjat biriktirish
                        </button>
                    </div>
                    <TextArea style={{ width: "600px" }} />
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
        </div>
    );
};

export default DistrictOrderDetail;