/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Input } from '@/components/UI/input';
import { Plus, RefreshCw, Printer, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, CheckCircle, XCircle, Clock } from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { setWarehouseTransfers } from '@/store/transferSlice/transferSlice';
import { WarehouseTransferForm } from '@/components';
import { Outlet, useNavigate, useParams, useSearchParams  } from 'react-router-dom';
import { setRegions } from '@/store/infoSlice/infoSlice';

type FilterStatus = 'all' | 'approved_accepted' | 'approved_not_accepted' | 'not_approved';

const WarehouseTransfer: React.FC = () => {
  const [filteredData, setFilteredData] = useState<Transfer[]>([]);
  const [mockData, setMockData] = useState<{
    approved: number;
    count: number;
    count_accepted: number;
    count_approval: number;
    limit: number;
    offset: number;
    unapproved: number;
    results: Transfer[];
  }>({
    approved: 0,
    count: 0,
    count_accepted: 0,
    count_approval: 0,
    limit: 0,
    offset: 0,
    unapproved: 0,
    results: [],
  });
  const searchInputRef = useRef<HTMLInputElement>(null);

  // ⬇️ DEFAULT: Tasdiqlanmagan
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('not_approved');

  // Create Transfer modal state
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [searchValue, setSearchValue] = useState("");

  // Ctrl + F bosilganda inputga fokus berish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
    const search = value.toLowerCase().trim();

    let filtered = warehouse_transfers.filter((item) => {
      return (
        item.number?.toLowerCase().includes(search) ||
        item.date?.toLowerCase().includes(search) ||
        item.from_warehouse?.toLowerCase().includes(search) ||
        item.to_warehouse?.toLowerCase().includes(search) ||
        item.transfer_type?.toLowerCase().includes(search) ||
        item.user?.toLowerCase().includes(search) ||
        item.to_responsible_person?.toLowerCase().includes(search)
      );
    });

    // statusFilterni ham inobatga olamiz
    if (statusFilter !== "all") {
      filtered = filtered.filter((item) => {
        switch (statusFilter) {
          case "approved_accepted":
            return item.is_approved && item.is_accepted;
          case "approved_not_accepted":
            return item.is_approved && !item.is_accepted;
          case "not_approved":
            return !item.is_approved;
          default:
            return true;
        }
      });
    }

    setFilteredData(filtered);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 14;

  // Redux
  const dispatch = useAppDispatch()
  const { warehouse_transfers } = useAppSelector(state => state.transferSlice)

  // Calculate pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Apply filters (status only — search alohida handleSearch’da)
  const applyFilters = (statusVal: FilterStatus) => {
    let filtered = warehouse_transfers;

    if (statusVal !== 'all') {
      filtered = filtered.filter(item => {
        switch (statusVal) {
          case 'approved_accepted':
            return item.is_approved && item.is_accepted;
          case 'approved_not_accepted':
            return item.is_approved && !item.is_accepted;
          case 'not_approved':
            return !item.is_approved;
          default:
            return true;
        }
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  };

  // Print
  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Ombordan Omborga Transfer Hisoboti</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1E56A0; padding-bottom: 15px; }
          .header h1 { color: #1E56A0; margin: 0; font-size: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #1E56A0; color: white; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .footer { margin-top: 30px; text-align: center; font-size: 10px; color: #666; }
          .status-approved-accepted { color: #10b981; font-weight: bold; }
          .status-approved-not-accepted { color: #f59e0b; font-weight: bold; }
          .status-not-approved { color: #ef4444; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>E-KOMPLEKTATSIYA</h1>
          <h2>Ombordan Omborga Transfer Hisoboti</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Hujjat №</th>
              <th>Sana</th>
              <th>Yuboruvchi ombor</th>
              <th>Qabul qiluvchi ombor</th>
              <th>Transfer turi</th>
              <th>Holat</th>
              <th>Foydalanuvchi</th>
              <th>M.J.Sh</th>
            </tr>
          </thead>
          <tbody>
            ${filteredData.map((item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.number}</td>
                <td>${item.date.split('T').join(" ")}</td>
                <td>${item.from_responsible_person}</td>
                <td>${item.to_responsible_person}</td>
                <td>${item.transfer_type}</td>
                <td class="status-${item.is_approved && item.is_accepted ? 'approved-accepted' :
        item.is_approved && !item.is_accepted ? 'approved-not-accepted' : 'not-approved'}">
                  ${item.is_approved && item.is_accepted ? 'Tasdiqlangan va Qabul qilingan' :
        item.is_approved && !item.is_accepted ? 'Tasdiqlangan, Kutilmoqda' : 'Tasdiqlanmagan'}
                </td>
                <td>${item.user}</td>
                <td>${item.to_responsible_person}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          <p>Jami: ${filteredData.length} ta transfer</p>
          <p>Chop etilgan: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ')}</p>
        </div>
      </body>
    </html>
  `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // API Requests
  const getWarehouseTransfers = async () => {
    try {
      const response = await axiosAPI.get(`transfers/list/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}`);
      dispatch(setWarehouseTransfers(response.data.results));
      // ❗ filteredData'ni bu yerda to'g'ridan-to'g'ri set qilmaymiz — quyidagi effect filterlaydi
      setMockData(response.data);
      setTotalItems(response.data.count);
    } catch (error) {
      console.error('Error fetching warehouse transfers:', error);
    }
  };

  useEffect(() => {
    getWarehouseTransfers();
  }, [currentPage]);

  // Status o'zgarsa yoki ro'yxat yangilansa — avtomatik filter qo'llanadi
  useEffect(() => {
    applyFilters(statusFilter);
  }, [statusFilter, warehouse_transfers]);

  // Filter data based on status (button click)
  const handleStatusFilter = (status: FilterStatus) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const navigate = useNavigate();
  const { id } = useParams()

  const handleDocumentClick = (documentNumber: string) => {
    navigate(`details/${documentNumber}`)
  };

  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Get row styling based on status - with left border indicator
  const getRowStyling = (isApproved: boolean, isAccepted: boolean) => {
    const baseStyles = "border-b border-slate-100 cursor-pointer transition-all duration-200 bg-white hover:bg-slate-50";

    if (isApproved && isAccepted) {
      return `${baseStyles} border-l-4 border-l-emerald-500`;
    } else if (isApproved && !isAccepted) {
      return `${baseStyles} border-l-4 border-l-amber-500`;
    } else {
      return `${baseStyles} border-l-4 border-l-red-500`;
    }
  };

  // Get document number styling and icon based on status
  const getDocumentStyling = (isApproved: boolean, isAccepted: boolean) => {
    if (isApproved && isAccepted) {
      return {
        color: 'text-emerald-600 hover:text-emerald-700',
        icon: CheckCircle,
        iconColor: 'text-emerald-500'
      };
    } else if (isApproved && !isAccepted) {
      return {
        color: 'text-amber-600 hover:text-amber-700',
        icon: Clock,
        iconColor: 'text-amber-500'
      };
    } else {
      return {
        color: 'text-red-600 hover:text-red-700',
        icon: XCircle,
        iconColor: 'text-red-500'
      };
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Regions
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

  // Statuslar soni
  const statusCounts = {
    all: mockData.count,
    approved_accepted: mockData.count_accepted,
    approved_not_accepted: mockData.count_approval,
    not_approved: mockData.unapproved,
  };

  // ⬇️ URL bilan sinxronlash (default tab = not_approved)
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (!searchParams.get("tab")) {
      const p = new URLSearchParams(searchParams);
      p.set("tab", "not_approved");
      setSearchParams(p, { replace: true });
    }
  }, []);
  useEffect(() => {
    const tab = (searchParams.get("tab") as FilterStatus) || "not_approved";
    if (tab !== statusFilter) setStatusFilter(tab);
  }, [searchParams]);

  const activeTab = searchParams.get("tab") ?? "not_approved"; // (agar kerak bo'lsa ishlatasiz)

  return (
    <>
      {isCreateFormModalOpen ? (
        <>
          <WarehouseTransferForm isCreateFormModalOpen={isCreateFormModalOpen} setIsCreateFormModalOpen={setIsCreateFormModalOpen} />
        </>
      ) : id ? (
        <Outlet />
      ) : (
        <div className="space-y-4 animate-in fade-in duration-700">
          {/* Professional Status Filter with Action Buttons */}
          <div className="animate-in slide-in-from-top-4 fade-in duration-600">
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
              <div className="flex items-center justify-between">
                {/* Status Filter Tabs - Left Side */}
                <div className="flex gap-1">

                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'all'
                      ? 'bg-slate-100 text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <span>Barchasi</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'all'
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-slate-100 text-slate-600'
                      }`}>
                      {statusCounts.all}
                    </span>
                  </button>

                  {/* Green - Approved and Accepted */}
                  <button
                    onClick={() => setStatusFilter('approved_accepted')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'approved_accepted'
                      ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                  >
                    <span>Tasdiqlangan</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'approved_accepted'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-600'
                      }`}>
                      {statusCounts.approved_accepted}
                    </span>
                  </button>

                  {/* Yellow - Approved but not Accepted */}
                  <button
                    onClick={() => setStatusFilter('approved_not_accepted')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'approved_not_accepted'
                      ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200'
                      : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                  >
                    <span>Kutilmoqda</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'approved_not_accepted'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                      }`}>
                      {statusCounts.approved_not_accepted}
                    </span>
                  </button>

                  {/* Red - Not Approved */}
                  <button
                    onClick={() => setStatusFilter('not_approved')}
                    className={`flex items-center space-x-2 px-4 py-2.5 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'not_approved'
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
                </div>

                {/* Action Buttons - Right Side */}
                <div className="flex items-center gap-2">
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
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md hover:text-slate-600 transition-all duration-300 transform hover:scale-105"
                    onClick={() => {
                      getWarehouseTransfers();
                    }}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Yangilash
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105"
                    onClick={handlePrintPDF}
                  >
                    <Printer className="w-4 h-4 mr-1" />
                    Chop etish
                  </Button>

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
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
          </div>

          {/* Table with Status-Based Row Colors */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-100">
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">Hujjat №</TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">Sana</TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">Yuboruvchi ombor</TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">Qabul qiluvchi ombor</TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">Transfer turi</TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">Foydalanuvchi</TableHead>
                    <TableHead className="text-slate-700 font-semibold py-3 px-4">M.J.Sh</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((item, index) => {
                    const documentStyle = getDocumentStyling(item.is_approved, item.is_accepted);
                    const StatusIcon = documentStyle.icon;

                    return (
                      <TableRow
                        key={`${item.number}-${index}`}
                        className={getRowStyling(item.is_approved, item.is_accepted)}
                        onClick={() => handleDocumentClick(item.id)}
                      >
                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`w-5 h-5 ${documentStyle.iconColor} transition-all duration-200`} />
                            <span className={`font-bold hover:underline transition-all duration-300 cursor-pointer ${documentStyle.color}`}>
                              {item.number}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">{item.date.split("T").join(" ")}</TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">{item.from_warehouse}</TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">{item.to_warehouse}</TableCell>

                        <TableCell className="py-3 px-4">
                          {item.transfer_type ? (
                            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-2 py-0.5 transition-all duration-300 hover:bg-purple-100 hover:scale-105">
                              {item.transfer_type}
                            </Badge>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">{item.user}</TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">{item.to_responsible_person}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
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
  );
}

export default WarehouseTransfer;
