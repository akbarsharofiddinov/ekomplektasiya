import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";

import {
  Plus,
  RefreshCw,
  Printer,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { axiosAPI } from "@/services/axiosAPI";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { ProductInputForm } from "@/components";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { setInputList } from "@/store/productSlice/productSlice";


type FilterStatus = "all" | "approved" | "rejected" | "pending";

const ProductInput: React.FC = () => {
  // const [searchValue, setSearchValue] = useState("");
  const [mockData, setMockData] = useState<ProductInputData[]>([]);
  const [filteredData, setFilteredData] = useState<ProductInputData[]>([]);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("rejected");
  // const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  // const [toDate, setToDate] = useState<Date | undefined>(undefined);
  // const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  // const [isToDateOpen, setIsToDateOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // CTRL+F yoki ⌘+F ishlashi uchun useEffect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + F (Windows/Linux) yoki Meta(Command) + F (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        // agar ref mavjud bo'lsa, fokuslaymiz; agar yo'q bo'lsa, DOM orqali ham topamiz
        const inputEl = searchInputRef.current ?? document.getElementById("global-search") as HTMLInputElement | null;
        inputEl?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Qidiruv funksiyasi (diqqat: nomni bir xil ishlating)
  const handleSearch = (value: string) => {
    setSearchValue(value);

    const search = value.trim().toLowerCase();
    if (search === "") {
      // bo'sh qidiruv — faqat status bo'yicha apply qilish yoki barcha ma'lumotni qayta tiklash
      applyFilters(statusFilter);
      return;
    }

    const filtered = mockData.filter((item) => {
      return [
        item.number,
        item.date,
        item.region,
        item.warehouse,
        item.type_goods,
        item.user,
        item.responsible_person,
      ].some((field) =>
        String(field ?? "").toLowerCase().includes(search)
      );
    });

    const finalFiltered =
      statusFilter === "all"
        ? filtered
        : filtered.filter(
          (item) =>
            item.is_approved === (statusFilter === "approved") ||
            (statusFilter === "rejected" && item.is_approved === false)
        );

    setFilteredData(finalFiltered);
  };



  // Get counts for each status
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    approved: 0,
    rejected: 0,
    length: 0,
  });

  // CreateInput state
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  // Calculate pagination - Fix: Use statusCounts.all instead of local calculation
  const totalItems = statusCounts.all;
  const totalPages = Math.ceil((statusFilter === "all" ? totalItems : statusFilter === "approved" ? statusCounts.approved : statusCounts.rejected) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const navigate = useNavigate();
  const { id } = useParams();

  // Redux
  const dispatch = useAppDispatch();
  const { inputsList } = useAppSelector((state) => state.product);

  // Apply filters (search + status + date range)
  const applyFilters = (statusVal: FilterStatus) => {
    let filtered = mockData;

    // Apply search filter
    // if (searchVal.trim() !== "") {
    //   filtered = filtered.filter((item) =>
    //     Object.values(item).some((field) =>
    //       field.toString().toLowerCase().includes(searchVal.toLowerCase())
    //     )
    //   );
    // }

    // Apply status filter
    if (statusVal !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.is_approved === (statusVal === "approved") ||
          (statusVal === "rejected" && item.is_approved === false)
      );
    }





    // Apply date range filter
    // if (fromDate && toDate) {
    //   filtered = filtered.filter((item) => {
    //     const itemDate = new Date(item.date);
    //     return itemDate >= fromDate && itemDate <= toDate;
    //   });
    // } else if (fromDate) {
    //   filtered = filtered.filter((item) => {
    //     const itemDate = new Date(item.date);
    //     return itemDate >= fromDate;
    //   });
    // } else if (toDate) {
    //   filtered = filtered.filter((item) => {
    //     const itemDate = new Date(item.date);
    //     return itemDate <= toDate;
    //   });
    // }

    setFilteredData(filtered);
    // Don't reset currentPage here if we're just filtering - only reset for status changes
  };

  // Generate PDF for printing
  const handlePrintPDF = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Tovarlar Kirimi Hisoboti</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1E56A0;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #1E56A0;
              margin: 0;
              font-size: 24px;
            }
            .date-range {
              margin: 15px 0;
              padding: 10px;
              background-color: #f8f9fa;
              border-radius: 5px;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #1E56A0; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-KOMPLEKTATSIYA</h1>
            <h2>Tovarlar Kirimi Hisoboti</h2>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Hujjat №</th>
                <th>Sana</th>
                <th>Viloyat</th>
                <th>Ombor</th>
                <th>Tovar kirimi turi</th>
                <th>Foydalanuvchi</th>
                <th>M.J.Sh</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
        .map(
          (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.number}</td>
                  <td>${item.date.split("T").join(" | ")}</td>
                  <td>${item.region}</td>
                  <td>${item.warehouse}</td>
                  <td>${item.type_goods}</td>
                  <td>${item.user}</td>
                  <td>${item.responsible_person}</td>
                </tr>
              `
        )
        .join("")}
            </tbody>
          </table>
          
          <div class="footer">
            <p>Jami: ${filteredData.length} ta yozuv</p>
            <p>Chop etilgan: ${new Date().toLocaleDateString(
          "uz-UZ"
        )} ${new Date().toLocaleTimeString("uz-UZ")}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Filter data based on search
  // const handleSearch = (value: string) => {
  //   setSearchValue(value);
  //   applyFilters(value, statusFilter);
  // };

  // Filter data based on status
  const handleStatusFilter = (status: FilterStatus) => {
    setStatusFilter(status);
    setCurrentPage(1); // Reset to first page on status change
    applyFilters(status);
  };

  const handleDocumentClick = (id: string) => {
    navigate("details/" + id);
  };

  // Pagination handlers - Fixed implementation
  const goToFirstPage = () => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  };

  const goToLastPage = () => {
    if (currentPage !== totalPages) {
      setCurrentPage(totalPages);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Get row styling based on status - with left border indicator
  const getRowStyling = (status: boolean) => {
    const baseStyles =
      "border-b border-slate-100 cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50";

    if (status) {
      return `${baseStyles} border-l-4 border-l-emerald-500`;
    } else {
      return `${baseStyles} border-l-4 border-l-red-500`;
    }
  };

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

  // API Requests - Fixed offset calculation
  const getInputProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Fix: Calculate proper offset
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await axiosAPI.get(`receipts/list/?limit=${itemsPerPage}&offset=${offset}&is_approved=${statusFilter === 'approved' ? 'true' : statusFilter === 'rejected' ? 'false' : ''}`);

      if (response.status === 200) {
        dispatch(setInputList(response.data.results));
        setStatusCounts(prev => ({
          ...prev,
          all: response.data.count,
          approved: response.data.approved,
          rejected: response.data.unapproved,
          length: response.data.count,
        }));
      }
    } catch (error) {
      console.log('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, dispatch]);

  useEffect(() => {
    getInputProducts();
  }, [getInputProducts]);

  useEffect(() => {
    setFilteredData(inputsList);
    setMockData(inputsList);
  }, [inputsList]);

  useEffect(() => {
    // Only apply initial filter when mockData changes, not on every render
    if (mockData.length > 0) {
      applyFilters(statusFilter);
    }
  }, [mockData]);

  useEffect(() => {
    handleStatusFilter("rejected");
  }, []);

  return (
    <>
      {id ? (
        <Outlet />
      ) : (
        <>
          {/* Create Form Modal */}
          {isCreateFormModalOpen ? (
            // Modal
            <div>
              {/* Inner */}
              <div
                className="bg-white rounded-lg shadow-md p-6 overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsCreateFormModalOpen(false);
                    }}
                    className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="w-1 h-8 bg-gradient-to-b from-[#1E56A0] to-[#1E56A0]/80 rounded-full"></div>
                  {/* Top */}
                  <div>
                    <h2 className="text-2xl font-bold">Yangi tovar kirim</h2>
                    <p className="text-gray-600">
                      Yangi tovar kirim ma'lumotlarini kiriting
                    </p>
                  </div>
                </div>

                <ProductInputForm
                  setIsCreateFormModalOpen={setIsCreateFormModalOpen}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-700">
              {/* Professional Status Filter with Action Buttons */}
              <div className="animate-in slide-in-from-top-4 fade-in duration-600">
                <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    {/* Status Filter Tabs - Left Side */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleStatusFilter("all")}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === "all"
                          ? "bg-slate-100 text-slate-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                          }`}
                      >
                        <span>Barchasi</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === "all"
                            ? "bg-slate-200 text-slate-700"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {statusCounts.all}
                        </span>
                      </button>

                      <button
                        onClick={() => handleStatusFilter("approved")}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === "approved"
                          ? "bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200"
                          : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                      >
                        <span>Tasdiqlangan</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {statusCounts.approved}
                        </span>
                      </button>

                      <button
                        onClick={() => handleStatusFilter("rejected")}
                        className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === "rejected"
                          ? "bg-red-50 text-red-800 shadow-sm border border-red-200"
                          : "text-slate-600 hover:text-red-700 hover:bg-red-50"
                          }`}
                      >
                        <span>Tasdiqlanmagan</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          {statusCounts.rejected}
                        </span>
                      </button>
                    </div>

                    {/* Action Buttons - Right Side */}
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      <Button
                        variant="default"
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-[#1E56A0]/90 hover:to-[#1E56A0] text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                        onClick={() => {
                          setIsCreateFormModalOpen(true);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Yaratish
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={loading}
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105 active:scale-[0.9]"
                        onClick={() => {
                          const refreshIcon = document.getElementById('refreshIcon');
                          if (refreshIcon) {
                            refreshIcon.classList.add('rotate-animation');
                            setTimeout(() => {
                              refreshIcon.classList.remove('rotate-animation');
                            }, 1000);
                          }
                          getInputProducts();
                        }}
                      >
                        <RefreshCw id="refreshIcon" className={`w-4 h-4 mr-1 transition-transform duration-1000 ${loading ? 'animate-spin' : ''}`} />
                        {loading ? 'Yuklanmoqda...' : 'Yangilash'}
                        <style>{`
                      .rotate-animation {
                        animation: rotate 400ms linear;
                      }
                      @keyframes rotate {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(180deg); }
                      }
                      `}</style>
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105"
                        onClick={handlePrintPDF}
                      >
                        <Printer className="w-4 h-4 mr-1" />
                        Chop etish
                      </Button>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          type="text"
                          placeholder="Qidirish (Ctrl+F)"
                          ref={searchInputRef} // 🟢 muhim joy
                          value={searchValue}
                          onChange={(e) => handleSearch(e.target.value)}
                          className="w-64 h-8 pl-9 text-sm border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    Ma'lumotlar yuklanmoqda...
                  </div>
                </div>
              )}

              {/* Table with Status-Based Row Colors */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-100">
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          Hujjat №
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          Sana
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          Viloyat
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          Ombor
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          Tovar kirimi turi
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          Foydalanuvchi
                        </TableHead>
                        <TableHead className="text-slate-700 font-semibold py-3 px-4">
                          M.J.Sh
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!loading && filteredData.length > 0 ? (
                        filteredData.map((item, index) => {
                          const documentStyle = getDocumentStyling(
                            item.is_approved
                          );
                          const StatusIcon = documentStyle.icon;

                          return (
                            <TableRow
                              key={`${item.id}-${index}`}
                              className={getRowStyling(item.is_approved)}
                              onClick={() => handleDocumentClick(item.id)}
                            >
                              <TableCell className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <StatusIcon
                                    className={`w-5 h-5 ${documentStyle.iconColor} transition-all duration-200`}
                                  />
                                  <span
                                    className={`font-bold hover:underline transition-all duration-300 cursor-pointer ${documentStyle.color}`}
                                  >
                                    {item.number}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="text-slate-700 py-3 px-4">
                                {item.date.split("T").join(" | ")}
                              </TableCell>
                              <TableCell className="text-slate-700 py-3 px-4">
                                {item.region}
                              </TableCell>
                              <TableCell className="text-slate-700 py-3 px-4">
                                {item.warehouse}
                              </TableCell>
                              <TableCell className="py-3 px-4">
                                {item.type_goods ? (
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5 transition-all duration-300 hover:bg-blue-100 hover:scale-105"
                                  >
                                    {item.type_goods}
                                  </Badge>
                                ) : null}
                              </TableCell>
                              <TableCell className="text-slate-700 py-3 px-4">
                                {item.user}
                              </TableCell>
                              <TableCell className="text-slate-700 py-3 px-4">
                                {item.responsible_person}
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : !loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            Hech qanday ma'lumot topilmadi
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </TableBody>
                  </Table>
                </div>

                {/* Professional Creative Pagination */}
                {!loading && totalPages >= 1 && (
                  <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                          Jami: <span className="font-medium text-slate-900">{totalItems}</span> ta transfer
                        </span>
                        <span className="text-slate-300">|</span>
                        <span className="text-sm text-slate-600">
                          Ko'rsatilmoqda: <span className="font-medium text-slate-900">{startIndex + 1}</span>-<span className="font-medium text-slate-900">{endIndex}</span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToFirstPage}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                          className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                              : 'border-slate-300 text-slate-600 hover:bg-slate-100'
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
                          className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToLastPage}
                          disabled={currentPage === totalPages}
                          className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default React.memo(ProductInput);
