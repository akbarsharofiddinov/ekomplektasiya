/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
// import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Input } from '@/components/UI/input';
import { Plus, RefreshCw, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useAppDispatch } from '@/store/hooks/hooks';
import {
    CheckCircle,
    XCircle,
} from "lucide-react";
// import { setWarehouseTransfers } from '@/store/transferSlice/transferSlice';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
// import { SearchOutlined } from '@ant-design/icons';
import { setRegions } from '@/store/infoSlice/infoSlice';
import { Select } from 'antd';

interface DocumentInfo {
    id: string;
    type_document_for_filter: string;
    application_status_district: string;
    confirmation_date: string;
    is_approved: boolean;
    is_seen: boolean;
    exit_date: string;
    exit_number: string;
    from_district: string;
    sender_from_district: string;
    to_region: string;
    recipient_region: string;
    reception_date: string;
    reception_number: string;
    from_region: string;
    sender_from_region: string;
    to_district: string;
    recipient_district: string;
}

type FilterStatus = 'all' | 'approved' | 'approved_not_accepted' | 'not_approved' | "Canceled";

const DistrictOrder: React.FC = () => {
    const [data, setData] = useState<DocumentInfo[]>([]);
    const [filteredData, setFilteredData] = useState<DocumentInfo[]>([]);
    // const [mockData, setMockData] = useState<DocumentInfo[]>([]);
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('not_approved');
    const [loading, setLoading] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);

    // order type
    const [orderType, setOrderType] = useState<"outgoing" | "incoming">("outgoing")

    // const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
    // const [toDate, setToDate] = useState<Date | undefined>(undefined);
    // const [isFromDateOpen, setIsFromDateOpen] = useState(false);
    // const [isToDateOpen, setIsToDateOpen] = useState(false);

    // Create Transfer modal state
    const [isCreateFormModalOpen] = useState(false);
    const [totalItems, setTotalItems] = useState<{
        approved: number;
        cancelled: 0;
        count: number;
        limit: number;
        offset: number;
        results: DocumentInfo;
        unapproved: number;
        unseen: number;
    } | null>(null);


    // Redux
    const dispatch = useAppDispatch()
    // Calculate pagination
    const totalPages = Math.ceil((totalItems?.count ?? 0) / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    // Generate PDF for printing
    //     const handlePrintPDF = () => {
    //         const printWindow = window.open('', '_blank');
    //         if (!printWindow) return;

    //         const htmlContent = `
    //     <!DOCTYPE html>
    //     <html>
    //       <head>
    //         <title>Ombordan Omborga Transfer Hisoboti</title>
    //         <meta charset="utf-8">
    //         <style>
    //           body { 
    //             font-family: Arial, sans-serif; 
    //             margin: 20px; 
    //             color: #333;
    //           }
    //           .header {
    //             text-align: center;
    //             margin-bottom: 30px;
    //             border-bottom: 2px solid #1E56A0;
    //             padding-bottom: 15px;
    //           }
    //           .header h1 {
    //             color: #1E56A0;
    //             margin: 0;
    //             font-size: 24px;
    //           }
    //           .date-range {
    //             margin: 15px 0;
    //             padding: 10px;
    //             background-color: #f8f9fa;
    //             border-radius: 5px;
    //           }
    //           table { 
    //             width: 100%; 
    //             border-collapse: collapse; 
    //             margin-top: 20px;
    //             font-size: 11px;
    //           }
    //           th, td { 
    //             border: 1px solid #ddd; 
    //             padding: 6px; 
    //             text-align: left;
    //           }
    //           th { 
    //             background-color: #1E56A0; 
    //             color: white;
    //             font-weight: bold;
    //           }
    //           tr:nth-child(even) { 
    //             background-color: #f9f9f9; 
    //           }
    //           .footer {
    //             margin-top: 30px;
    //             text-align: center;
    //             font-size: 10px;
    //             color: #666;
    //           }
    //           .status-approved-accepted { color: #10b981; font-weight: bold; }
    //           .status-approved-not-accepted { color: #f59e0b; font-weight: bold; }
    //           .status-not-approved { color: #ef4444; font-weight: bold; }
    //         </style>
    //       </head>
    //       <body>
    //         <div class="header">
    //           <h1>E-KOMPLEKTATSIYA</h1>
    //           <h2>Ombordan Omborga Transfer Hisoboti</h2>
    //         </div>

    //         <table>
    //           <thead>
    //             <tr>
    //               <th>№</th>
    //               <th>Hujjat №</th>
    //               <th>Sana</th>
    //               <th>Yuboruvchi ombor</th>
    //               <th>Qabul qiluvchi ombor</th>
    //               <th>Transfer turi</th>
    //               <th>Holat</th>
    //               <th>Foydalanuvchi</th>
    //               <th>M.J.Sh</th>
    //             </tr>
    //           </thead>
    //           <tbody>
    //             ${filteredData.map((item, index) => `
    //               <tr>
    //                 <td>${index + 1}</td>
    //                 <td>${item.number}</td>
    //                 <td>${item.date.split('T').join(" ")}</td>
    //                 <td>${item.from_responsible_person}</td>
    //                 <td>${item.to_responsible_person}</td>
    //                 <td>${item.transfer_type}</td>
    //                 <td class="status-${item.is_approved && item.is_accepted ? 'approved-accepted' :
    //                 item.is_approved && !item.is_accepted ? 'approved-not-accepted' : 'not-approved'}">
    //                   ${item.is_approved && item.is_accepted ? 'Tasdiqlangan va Qabul qilingan' :
    //                 item.is_approved && !item.is_accepted ? 'Tasdiqlangan, Kutilmoqda' : 'Tasdiqlanmagan'}
    //                 </td>
    //                 <td>${item.user}</td>
    //                 <td>${item.to_responsible_person}</td>
    //               </tr>
    //             `).join('')}
    //           </tbody>
    //         </table>

    //         <div class="footer">
    //           <p>Jami: ${filteredData.length} ta transfer</p>
    //           <p>Chop etilgan: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ')}</p>
    //         </div>
    //       </body>
    //     </html>
    //   `;

    //         printWindow.document.write(htmlContent);
    //         printWindow.document.close();
    //         printWindow.print();
    //     };


    // API Requests


    const getDistrictOrderList = async () => {
        try {
            const response = await axiosAPI.get(`district-orders/list/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}&type_document_for_filter=${orderType === "outgoing" ? encodeURIComponent("Тумандан") : encodeURIComponent("Вилоятдан")}`);
            setFilteredData(response.data.results);
            setData(response.data.results);
            setTotalItems(response.data);
        } catch (error) {
            console.error('Error fetching warehouse transfers:', error);
        }
    };

    const handleRefresh = async () => {
        setLoading(true);
        await getDistrictOrderList();
        setLoading(false);
    };

    // Qidiruv funksiyasi
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        const lower = value.toLowerCase();

        const filtered = filteredData.filter((item) =>
            Object.values(item).some(
                (val) =>
                    val &&
                    val.toString().toLowerCase().includes(lower)
            )
        );

        setFilteredData(filtered);
    };

    // Ctrl + F bosilganda inputga focus berish
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key.toLowerCase() === "f") {
                e.preventDefault(); // brauzer qidiruvini to‘xtatadi
                searchInputRef.current?.focus(); // inputga fokus beradi
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const handleDocumentClick = (id: string) => {
        navigate("order-details/" + id);
    };

    useEffect(() => {
        getDistrictOrderList();
    }, [orderType, currentPage]);


    const navigate = useNavigate();
    const { id } = useParams()

    // 🔹 ViewMode bo‘yicha filter
    useEffect(() => {
        let filtered = data;
        if (orderType === "outgoing") {
            filtered = data.filter(
                (item) => item.type_document_for_filter === "Тумандан"
            );
        } else {
            filtered = data.filter(
                (item) => item.type_document_for_filter === "Вилоятдан"
            );
        }

        // 🔸 Search qo‘llanadi
        if (searchTerm.trim() !== "") {
            const query = searchTerm.toLowerCase();
            filtered = filtered.filter(item =>
                Object.values(item).some(val =>
                    val && val.toString().toLowerCase().includes(query)
                )
            );
        }


        setFilteredData(filtered);
        setCurrentPage(1);
    }, [orderType, searchTerm]);

    const handleStatusFilter = (status: FilterStatus) => {
        setStatusFilter(status);

        let filtered = data;

        switch (status) {
            case 'approved': // ✅ Tasdiqlangan
                filtered = data.filter(item => item.is_approved === true && item.application_status_district !== "Bekor qilingan");
                break;
            case 'not_approved': // ❌ Tasdiqlanmagan
                filtered = data.filter(item => item.is_approved === false);
                break;
            case 'approved_not_accepted': // 🕓 Ko‘rilmagan
                filtered = data.filter(item => item.is_seen === false && item.application_status_district !== "Bekor qilingan");
                break;
            case 'Canceled': // 🚫 Bekor qilingan
                filtered = data.filter(item => item.application_status_district === "Bekor qilingan");
                break;
            default:
                filtered = data; // 🔁 Barchasi
        }

        setFilteredData(filtered);
    };


    // 🔹 Row ranglari
    const getRowStyling = (item: DocumentInfo) => {
        const base = "border-b border-slate-100 cursor-pointer transition-all duration-200";

        if (item.application_status_district === "Bekor qilingan") {
            return `${base}`;
        } else if (item.is_seen === false) {
            return `${base} `; // Ko‘rilmagan
        } else if (item.is_approved === true) {
            return `${base} `; // Tasdiqlangan
        } else if (item.is_approved === false) {
            return `${base} `; // Tasdiqlanmagan
        }
        return `${base} bg-white hover:bg-slate-50`; // Default
    };

    // Pagination handlers
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
    const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
    const goToPage = (page: number) => setCurrentPage(page);

    // Generate page numbers for pagination
    const getPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        // Adjust start page if we're near the end
        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    };

    // API Requests
    // Get regions
    const getRegionsList = React.useCallback(async () => {
        try {
            const response = await axiosAPI.get("regions/list/?order_by=2");
            if (response.status === 200) {
                dispatch(setRegions(response.data));
            }
        } catch (error) {
            console.log(error);
        }
    }, [dispatch]);

    useEffect(() => {
        getRegionsList();
    }, []);

    // Get document number styling and icon based on status
    const getDocumentStyling = (status: boolean) => {
        if (status) {
            return {
                color: "text-emerald-600 hover:text-emerald-700",
                icon: CheckCircle,
                iconColor: "text-emerald-500",
            };
        } else {
            return {
                color: "text-red-600 hover:text-red-700",
                icon: XCircle,
                iconColor: "text-red-500",
            };
        }
    };

    // Get counts for each status

    // 🔹 Har bir status uchun sonlarni hisoblash
    const statusCounts = {
        all: totalItems?.count,
        approved: totalItems?.approved,
        not_approved: totalItems?.unapproved,
        approved_not_accepted: totalItems?.unseen,
        Canceled: totalItems?.cancelled,
    };

    return (
        <>
            {isCreateFormModalOpen ? (
                <>
                </>
            ) : id ? (
                <Outlet />
            ) : (
                <div className="space-y-4 animate-in fade-in duration-700">
                    {/* Professional Status Filter with Action Buttons */}
                    <div className="animate-in slide-in-from-top-4 fade-in duration-600">
                        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                            <h1 className='text-2xl text-black pb-4'>Tumanlar bo'yicha buyurtma</h1>
                            <div className="flex items-center justify-between gap-20">
                                {/* Status Filter Tabs - Left Side */}
                                <div className="flex gap-2 flex-wrap">
                                    {/* Barchasi */}
                                    <button
                                        onClick={() => handleStatusFilter('all')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'all'
                                            ? 'bg-slate-100 text-slate-900 shadow-sm'
                                            : 'text-slate-600 hover:bg-slate-50'
                                            }`}
                                    >
                                        <span>Barchasi</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'all'
                                            ? 'bg-slate-200 text-slate-800'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {statusCounts.all}
                                        </span>
                                    </button>

                                    {/* Tasdiqlangan */}
                                    <button
                                        onClick={() => handleStatusFilter('approved')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'approved'
                                            ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200'
                                            : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                                            }`}
                                    >
                                        <span>Tasdiqlangan</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'approved'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {statusCounts.approved}
                                        </span>
                                    </button>

                                    {/* Tasdiqlanmagan */}
                                    <button
                                        onClick={() => handleStatusFilter('not_approved')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'not_approved'
                                            ? 'bg-red-50 text-red-800 shadow-sm border border-red-200'
                                            : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
                                            }`}
                                    >
                                        <span>Tasdiqlanmagan</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'not_approved'
                                            ? 'bg-red-100 text-red-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {statusCounts.not_approved}
                                        </span>
                                    </button>

                                    {/* Ko‘rilmagan */}
                                    <button
                                        onClick={() => handleStatusFilter('approved_not_accepted')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'approved_not_accepted'
                                            ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200'
                                            : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                                            }`}
                                    >
                                        <span>Ko'rilmagan</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'approved_not_accepted'
                                            ? 'bg-amber-100 text-amber-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {statusCounts.approved_not_accepted}
                                        </span>
                                    </button>

                                    {/* Bekor qilingan */}
                                    <button
                                        onClick={() => handleStatusFilter('Canceled')}
                                        className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'Canceled'
                                            ? 'bg-slate-200 text-slate-900 shadow-sm border border-slate-300'
                                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                            }`}
                                    >
                                        <span>Bekor qilingan</span>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'Canceled'
                                            ? 'bg-slate-300 text-slate-900'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {statusCounts.Canceled}
                                        </span>
                                    </button>
                                </div>
                                <div className='w-[30%]'>
                                    <Select
                                        placeholder="tur"
                                        value={orderType}
                                        className='w-full'
                                        options={[
                                            { value: 'outgoing', label: 'Chiquvchi xabarlar' },
                                            { value: 'incoming', label: 'Kiruvchi xabarlar' },
                                        ]}
                                        onChange={value => {
                                            if (value === "incoming") setOrderType("incoming")
                                            else setOrderType("outgoing")
                                        }}
                                    />
                                </div>

                                {/* Action Buttons - Right Side */}

                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-md flex justify-between">
                        <div className='flex items-center gap-3'>
                            <Button className='cursor-pointer'>
                                <Plus></Plus>
                                Yaratish
                            </Button>

                            <Button
                                className='cursor-pointer'
                                onClick={handleRefresh}
                                disabled={loading}
                            >
                                {loading ? (
                                    <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                {loading ? "Yangilanmoqda..." : "Yangilash"}
                            </Button>
                          
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <Input
                                type="text"
                                placeholder="Qidirish (Ctrl+F)"
                                ref={searchInputRef}
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-64 h-8 pl-9 text-sm border-slate-200"
                            />
                        </div>
                    </div>

                    {/* Table with Status-Based Row Colors */}
                    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 border-b border-slate-200">
                                        {orderType === "outgoing" ? (
                                            <>
                                                <TableHead>Chiqish №</TableHead>
                                                <TableHead>Chiqish sanasi</TableHead>
                                                <TableHead>Buyurtma holati</TableHead>
                                                <TableHead>Tumandan</TableHead>
                                                <TableHead>Viloyatga</TableHead>
                                                <TableHead>Tumandan jo‘natuvchi</TableHead>
                                                <TableHead>Viloyatda qabul qiluvchi</TableHead>
                                                <TableHead>Tasdiqlangan sana</TableHead>
                                            </>
                                        ) : (
                                            <>
                                                <TableHead>Kirish №</TableHead>
                                                <TableHead>Kirish sanasi</TableHead>
                                                <TableHead>Buyurtma holati</TableHead>
                                                <TableHead>Viloyatdan</TableHead>
                                                <TableHead>Tumanga</TableHead>
                                                <TableHead>Viloyatdan jo‘natuvchi</TableHead>
                                                <TableHead>Tumanda qabul qiluvchi</TableHead>
                                                <TableHead>Tasdiqlangan sana</TableHead>
                                            </>
                                        )}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredData.map((item, index) => {
                                        const documentStyle = getDocumentStyling(
                                            item.is_approved
                                        );
                                        const StatusIcon = documentStyle.icon;
                                        return (
                                            <TableRow
                                                key={`${index}`}
                                                onClick={() => handleDocumentClick(item.id)}
                                                className={getRowStyling(item)}
                                            >
                                                <TableCell className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <StatusIcon
                                                            className={`w-5 h-5 ${documentStyle.iconColor} transition-all duration-200`}
                                                        />
                                                        <span
                                                            className={`font-bold hover:underline transition-all duration-300 cursor-pointer ${documentStyle.color}`}
                                                        >
                                                            {item.exit_number}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-3 px-4">
                                                    {item.exit_date.split("T").join("  ")}
                                                </TableCell>
                                                <TableCell className="text-slate-700 py-3 px-4">{item.application_status_district}</TableCell>
                                                <TableCell className="text-slate-700 py-3 px-4">{item.from_district}</TableCell>
                                                <TableCell className="text-slate-700 py-3 px-4">{item.to_region}</TableCell>
                                                <TableCell className="py-3 px-4">{item.sender_from_district}</TableCell>
                                                <TableCell className="text-slate-700 py-3 px-4">{item.recipient_region}</TableCell>
                                                <TableCell className="text-slate-700 py-3 px-4">{item.confirmation_date}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Enhanced Professional Pagination */}
                        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-600">
                                        Jami: <span className="font-medium text-slate-900">{totalItems?.count}</span> ta Buyurtma
                                    </span>
                                    <span className="text-slate-300">|</span>
                                    <span className="text-sm text-slate-600">
                                        Ko'rsatilmoqda: <span className="font-medium text-slate-900">{startIndex + 1}</span>-<span className="font-medium text-slate-900">{Math.min(endIndex, totalItems?.count ?? 0)}</span>
                                    </span>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToFirstPage}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-[#1E56A0]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToPreviousPage}
                                        disabled={currentPage === 1}
                                        className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-[#1E56A0]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    {getPageNumbers().map((pageNum) => (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(pageNum)}
                                            className={`h-8 w-8 p-0 transition-all duration-200 ${currentPage === pageNum
                                                ? 'bg-[#1E56A0] text-white hover:bg-[#1E56A0]/90 shadow-sm'
                                                : 'border-slate-300 text-slate-600 hover:bg-[#1E56A0]/70'
                                                }`}
                                        >
                                            {pageNum}
                                        </Button>
                                    ))}

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToNextPage}
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-[#1E56A0]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={goToLastPage}
                                        disabled={currentPage === totalPages}
                                        className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-[#1E56A0]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DistrictOrder;