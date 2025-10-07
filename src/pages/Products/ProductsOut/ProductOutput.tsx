/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useRef } from "react";
// import { FilterPanel } from "./FilterPanel";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Search } from "lucide-react";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/UI/popover";
import { Badge } from "@/components/UI/badge";
import { Button } from "@/components/UI/button";
import { axiosAPI } from "@/services/axiosAPI";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { CheckCircle, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, Printer, RefreshCw, X, XCircle } from "lucide-react";
// import { Input } from "antd";

import { ProductOutputForm } from "@/components";
import { Input } from "@/components/UI/input";



interface ProductOutputData {
  id: string;
  date: string;
  number: string;
  region: string;
  warehouse: string;
  district: string;
  responsible_person: string;
  is_approved: boolean;
  user: string;
}

type FilterStatus = "all" | "approved" | "rejected" | "pending";

const ProductOutput: React.FC = () => {
  // const [searchValue, setSearchValue] = useState("");
  const [filteredData, setFilteredData] = useState<ProductOutputData[]>([]);
  const [mockData, setMockData] = useState<ProductOutputData[]>([]);
  // const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  setToDate("" as unknown as Date | undefined); // toDate faqat o'qish uchun
  // const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("rejected");
  // const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // CreateInput state
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);

  // Calculate pagination
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPageData = filteredData.slice(startIndex, endIndex);

  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);


  const navigate = useNavigate();
  const { id } = useParams()


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        const inputEl =
          searchInputRef.current ||
          (document.getElementById("product-search-input") as HTMLInputElement);
        inputEl?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const search = value.toLowerCase().trim();

    let filtered = mockData.filter((item) => {
      return (
        item.number?.toLowerCase().includes(search) ||
        item.date?.toLowerCase().includes(search) ||
        item.region?.toLowerCase().includes(search) ||
        item.warehouse?.toLowerCase().includes(search) ||
        item.responsible_person?.toLowerCase().includes(search) ||
        item.user?.toLowerCase().includes(search)
      );
    });

    // Status filter ham qo‘llanadi
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.is_approved === (statusFilter === "approved") ||
          (statusFilter === "rejected" && item.is_approved === false)
      );
    }

    setFilteredData(filtered);
  };

  // Apply filters (search + status + date range)
  const applyFilters = (statusVal: FilterStatus) => {
    let filtered = mockData;

    if (statusVal !== "all") {
      filtered = filtered.filter(
        (item) =>
          item.is_approved === (statusVal === "approved") ||
          (statusVal === "rejected" && item.is_approved === false)
      );
    }



    // // Apply date range filter
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
    setCurrentPage(1); // Reset to first page when filtering
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
                <th>M.J.Sh</th>
                <th>Tovar holati</th>
                <th>Foydalanuvchi</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData
        .map(
          (item, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${item.id}</td>
                  <td>${item.date}</td>
                  <td>${item.region}</td>
                  <td>${item.warehouse}</td>
                  <td>${item.responsible_person}</td>
                  <td>${item.is_approved ? "Tasdiqlangan" : "Tasdiqlanmagan"}</td>
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

  // Filter data based on status
  const handleStatusFilter = (status: FilterStatus) => {
    setStatusFilter(status);
    applyFilters(status);
  };


  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () =>
    setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToPage = (page: number) => setCurrentPage(page);

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

  const statusCounts = {
    all: mockData.length,
    approved: mockData.filter((item) => item.is_approved).length,
    rejected: mockData.filter((item) => !item.is_approved).length,
    length: mockData.length,
  };


  // API Requests

  const getProductOutputData = async () => {
    try {
      const response = await axiosAPI.get("write-offs/list/");
      if (response.status === 200) {
        setFilteredData(response.data.results);
        setMockData(response.data.results);
      }
    } catch (error) {
      console.error("Error fetching product output data:", error);
    }
  };

  useEffect(() => {
    getProductOutputData();
  }, []);

  useEffect(() => {
    applyFilters(statusFilter);
  }, [toDate]);

  useEffect(() => {
    handleStatusFilter("rejected");
  }, []);

  return (
    <>
      {id ? (
        <Outlet />
      ) : (
        <>

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
                    <h2 className="text-2xl font-bold">Yangi tovar chiqim</h2>
                    <p className="text-gray-600">
                      Yangi tovar chiqim ma'lumotlarini kiriting
                    </p>
                  </div>
                </div>

                <ProductOutputForm setIsCreateFormModalOpen={setIsCreateFormModalOpen} />
              </div>
            </div>
          ) : (
            <div className="space-y-2 animate-in fade-in duration-700">

              <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
                <div className="flex items-center justify-between">
                  {/* Status Filter Tabs - Left Side */}
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
                      variant="destructive"
                      size="sm"
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105 active:scale-[0.9]"
                      onClick={() => {
                        const refreshIcon = document.getElementById('refreshIcon');
                        if (refreshIcon) {
                          refreshIcon.classList.add('rotate-animation');
                          setTimeout(() => {
                            refreshIcon.classList.remove('rotate-animation');
                          }, 1000);
                        }
                        getProductOutputData();
                      }}
                    >
                      <RefreshCw id="refreshIcon" className="w-4 h-4 mr-1 transition-transform duration-1000" />
                      Yangilash
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
                        id="product-search-input"
                        ref={searchInputRef}
                        type="text"
                        placeholder="Qidirish (Ctrl+F)"
                        value={searchValue}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="w-64 h-8 pl-9 text-sm border-slate-200"
                      />
                    </div>
                  </div>
                </div>
              </div>



              <div className="bg-white rounded-xl border border-gray-100 shadow-sm mt-6 overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
                <div className="px-3 py-2 border-b border-gray-100 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#111827] transition-colors duration-300">
                      Tovarlar chiqimi ro'yxati
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-blue-50 text-blue-700 border-blue-100 px-2 py-0.5 transition-all duration-300 hover:scale-105"
                      >
                        Jami: {filteredData.length} ta
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
                  <div className="overflow-x-auto"  >
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50 border-b border-gray-100">
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            Hujjat №
                          </TableHead>
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            Sana
                          </TableHead>
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            Viloyatlar
                          </TableHead>
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            Ombor
                          </TableHead>
                          {/* <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                  Tumanlar
                </TableHead> */}
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            Tovar holati
                          </TableHead>
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            Foydalanuvchi
                          </TableHead>
                          <TableHead className="text-slate-700 font-semibold py-2 px-3 text-left transition-colors duration-300">
                            M.J.Sh
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentPageData.map((item, index) => {
                          const documentStyle = getDocumentStyling(
                            item.is_approved
                          );
                          const StatusIcon = documentStyle.icon;

                          return (
                            <TableRow
                              key={`${item.number}-${index}`}
                              className={`border-b border-gray-50 hover:bg-slate-50/50 transition-all duration-300 hover:shadow-sm transform animate-in fade-in ${index % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                                }`}
                              style={{ animationDelay: `${index * 50}ms` }}
                              onClick={() => {
                                navigate(`details/${item.id}`);
                              }}
                            >
                              <TableCell className="py-3 px-3">
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
                              <TableCell className="text-slate-700 font-medium py-2 px-3 transition-colors duration-300">
                                {item.date.split("T").join(" | ")}
                              </TableCell>
                              <TableCell className="py-2 px-3">
                                <Badge
                                  variant="outline"
                                  className="bg-purple-50 text-purple-700 border-purple-200 px-2 py-0.5 transition-all duration-300 hover:bg-purple-100 hover:scale-105"
                                >
                                  {item.region}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-700 py-2 px-3 transition-colors duration-300">
                                {item.warehouse}
                              </TableCell>
                              {/* <TableCell className="text-slate-700 py-2 px-3 transition-colors duration-300">
                    {item.district}
                  </TableCell> */}
                              <TableCell className="py-2 px-3">
                                <Badge
                                  className={`border-0 shadow-sm px-2 py-0.5 transition-all duration-300 hover:shadow-md hover:scale-105 ${item.is_approved
                                    ? "bg-green-50 text-green-700"
                                    : "bg-yellow-50 text-yellow-700"
                                    }`}
                                >
                                  {item.is_approved
                                    ? "Tasdiqlangan"
                                    : "Tasdiqlanmagan"}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-slate-700 py-2 px-3 transition-colors duration-300">
                                {item.user}
                              </TableCell>
                              <TableCell className="text-slate-700 max-w-48 truncate py-2 px-3 transition-colors duration-300">
                                {item.responsible_person}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* Professional Creative Pagination */}
                <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">
                        Jami: <span className="font-medium text-slate-900">{totalItems}</span> ta transfer
                      </span>
                      <span className="text-slate-300">|</span>
                      <span className="text-sm text-slate-600">
                        Ko'rsatilmoqda: <span className="font-medium text-slate-900">{startIndex + 1}</span>-<span className="font-medium text-slate-900">{Math.min(endIndex, totalItems)}</span>
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
              </div>
            </div>
          )}




        </>
      )}
    </>
  );
}

export default ProductOutput;