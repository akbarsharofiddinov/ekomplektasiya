/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import { Plus, RefreshCw, Calendar as Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { CheckCircle,XCircle,} from "lucide-react";
// import { setWarehouseTransfers } from '@/store/transferSlice/transferSlice';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
// import { SearchOutlined } from '@ant-design/icons';
import { setRegions } from '@/store/infoSlice/infoSlice';
import { Select, Tag } from 'antd';

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

interface DistrictFilter {
  district: string;
  count: number;
}



type FilterStatus = 'all' | 'approved' | 'approved_not_accepted' | 'not_approved' | "Canceled";

const RegionOrder: React.FC = () => {
  const [data, setData] = useState<DocumentInfo[]>([]);
  // const [data] = useState<DocumentInfo[]>([]);
  const [filteredData, setFilteredData] = useState<DocumentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  // Filter districts list
  const [districts, setDistricts] = useState<DistrictFilter[]>([]);
  // Selected district for filtering
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);



  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // const [searchTerm, setSearchTerm] = useState("");
  // const searchInputRef = useRef<HTMLInputElement>(null);

  // order type
  const [orderType, setOrderType] = useState<"outgoing" | "incoming">("outgoing")

  const [statusFilter, setStatusFilter] = useState<FilterStatus>('not_approved');
  // const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  // const [toDate, setToDate] = useState<Date | undefined>(undefined);
  // const [isFromDateOpen, setIsFromDateOpen] = useState(false);
  // const [isToDateOpen, setIsToDateOpen] = useState(false);

  // Create Transfer modal state
  const [isCreateFormModalOpen] = useState(false);

  const [totalItems, setTotalItems] = useState<{
    count: number;
    limit: number;
    offset: number;
    results: DocumentInfo[];
  }>({
    count: 0,
    limit: itemsPerPage,
    offset: 0,
    results: [],
  });


  // Redux
  const dispatch = useAppDispatch()
  const { currentUserInfo } = useAppSelector(state => state.info);
  console.log(currentUserInfo)

  // Calculate pagination
  const totalPages = Math.ceil(totalItems.count / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;


  // API Requests
  const getRegionOrdersList = async () => {
    try {
      setLoading(true);
      if (selectedDistrict === "Viloyatdan") {
        const response = await axiosAPI.get(`region-orders/list/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}&type_document_for_filter=${orderType === "outgoing" ? encodeURIComponent("Вилоятдан") : encodeURIComponent("Тумандан")}&from_district=""`);
        const districtData = response.data.filter_by_districts || [];
        setDistricts(districtData);
        setFilteredData(response.data.results);
        setData(response.data.results);
        setTotalItems(response.data);
      }
      else {
        const response = await axiosAPI.get(`region-orders/list/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}&type_document_for_filter=${orderType === "outgoing" ? encodeURIComponent("Вилоятдан") : encodeURIComponent("Тумандан")}&from_district=${selectedDistrict}`);
        const districtData = response.data.filter_by_districts || [];
        setDistricts(districtData);
        setFilteredData(response.data.results);
        setData(response.data.results);
        setTotalItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching warehouse transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoadingRef(true);
    await getRegionOrdersList();
    setLoadingRef(false);
  };

  const handleDocumentClick = (id: string) => {
    navigate("order-details/" + id);
  };


  useEffect(() => {
    if (currentUserInfo) getRegionOrdersList()
  }, [orderType, currentPage, selectedDistrict]);



  // Filter function
  useEffect(() => {
    const filtered = data.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);


  const navigate = useNavigate();
  const { id } = useParams()

  useEffect(() => {
    let filtered = [...data];

    // 🔹 Order type bo‘yicha filter
    if (orderType === "outgoing") {
      filtered = filtered.filter(item => item.type_document_for_filter === "Вилоятдан");
    } else {
      filtered = filtered.filter(item => item.type_document_for_filter === "Тумандан");
    }


    // 🔸 Search qo‘llanadi
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(
        item =>
          item.reception_number?.toLowerCase().includes(query) ||
          item.exit_number?.toLowerCase().includes(query) ||
          item.from_district?.toLowerCase().includes(query) ||
          item.to_region?.toLowerCase().includes(query) ||
          item.application_status_district?.toLowerCase().includes(query) ||
          item.from_region?.toLowerCase().includes(query) ||
          item.to_district?.toLowerCase().includes(query)
      );
    }
    setFilteredData(filtered);
  }, [orderType, searchTerm, data]);

  useEffect(() => {
    const handleCtrlF = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleCtrlF);
    return () => window.removeEventListener('keydown', handleCtrlF);
  }, []);


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

  // Get counts for each status
  const statusCounts = {
    all: totalItems.count,
    approved: 0,
    not_approved: 0,
  };

  const { Option } = Select;

  const handleChange = (value) => {
    if (!value) {
      setSelectedDistrict("");
      setFilteredData(data); // Reset all data
    } else {
      setSelectedDistrict(value);
      const filtered = data.filter(
        (doc) => doc.application_status_district === value
      );
      setFilteredData(filtered);
    }
  };

  return (
    <>
      {isCreateFormModalOpen ? (
        <>
        </>
      ) : id ? (
        <Outlet />
      ) : (
        <div className="bg-white shadow-md p-4 rounded-md space-y-4 animate-in fade-in duration-700">
          {/* Professional Status Filter with Action Buttons */}
          <div className="animate-in slide-in-from-top-4 fade-in duration-600">
            <div className="rounded-lg">
              <h1 className='text-2xl text-black pb-4'>Viloyatlar bo'yicha buyurtma</h1>
              <div className="flex items-center justify-between gap-20">
                {/* Status Filter Tabs - Left Side */}
                <div className="flex flex-wrap gap-2">
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

                  {/* Green - Approved and Accepted */}
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

                  {/* Red - Not Approved */}
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
                      {/* {statusCounts.Canceled} */}
                    </span>
                  </button>

                  {/* Yellow - Approved but not Accepted */}
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
                      {/* {statusCounts.approved_not_accepted} */}
                    </span>
                  </button>
                </div>

                <div className='flex items-center gap-3'>

                  <div className='w-full'>
                    <Select
                      placeholder="tur"
                      value={orderType}
                      className='w-[200px]'
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

                  <div className="w-full flex items-center justify-between">
                    {loading ? (
                      <div className="text-center text-gray-500">Yuklanmoqda...</div>
                    ) : (
                      <Select
                        value={selectedDistrict || ""}
                        onChange={handleChange}
                        allowClear
                        placeholder="Barcha hujjatlar"
                        className="w-[200px]"
                        showSearch
                        optionFilterProp="children"
                        popupClassName="rounded-xl shadow-md"
                      >
                        <Option key="all" value="">
                          <span className="text-gray-600">Barcha hujjatlar</span>
                        </Option>
                        {districts.map((item, index) => (
                          <Option key={index} value={item.district}>
                            <div className="flex justify-between items-center">
                              <span>{item.district}</span>
                              <Tag
                                color={item.count > 0 ? "blue" : "default"}
                                style={{
                                  marginLeft: "auto",
                                  fontSize: "12px",
                                  borderRadius: "10px",
                                }}
                              >
                                {item.count}
                              </Tag>
                            </div>
                          </Option>
                        ))}
                      </Select>
                    )}
                  </div>

                </div>
              </div>
            </div>
          </div>


          <div className="bg-white py-3 flex justify-between">
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
                {loadingRef ? (
                  <RefreshCw className="animate-spin w-4 h-4 mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                {loadingRef ? "Yangilanmoqda..." : "Yangilash"}
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Qidirish (Ctrl+F)"
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 h-8 pl-9 text-sm border-slate-200"
              />
            </div>
          </div>

          {/* Table with Status-Based Row Colors */}
          <div className="overflow-hidden transform transition-all hover:shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <>
                      <TableHead>{orderType === "outgoing" ? "Chiqish" : "Kirish"} №</TableHead>
                      <TableHead>{orderType === "outgoing" ? "Chiqish" : "Kirish"} sanasi</TableHead>
                      <TableHead>Tuman{orderType === "outgoing" ? "ga" : "dan"}</TableHead>
                      <TableHead>Bo'limdan yuboruvchi</TableHead>
                      <TableHead>{orderType === "outgoing" ? "Viloyatdan" : "Tumandan"} jo'natuvchi</TableHead>
                      <TableHead>{orderType === "outgoing" ? "Tumanda" : "Viloyatda"} qabul qiluvchi</TableHead>
                      <TableHead>Viloyat buyurtma holati</TableHead>
                      <TableHead>Tasdiqlangan sana</TableHead>
                    </>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                       <TableCell
                          colSpan={8}
                          className="text-center font-semibold text-xl py-6 text-gray-900"
                        >
                          {selectedDistrict ? (
                            <div>
                              {selectedDistrict} tumanida{" "}
                              {orderType === "outgoing" ? (
                                <p className="text-red-600 inline">Chiqish</p>
                              ) : (
                                <p className="text-green-600 inline">Kirish</p>
                              )}{" "}
                              hujjat mavjud emas
                            </div>
                          ) : (
                            "Hujjatlar mavjud emas"
                          )}
                        </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, index) => {
                      const documentStyle = getDocumentStyling(item.is_approved);
                      const StatusIcon = documentStyle.icon;

                      return (
                        <TableRow
                          key={`${index}`}
                          onClick={() => handleDocumentClick(item.id)}
                          className="hover:bg-slate-50 transition-all duration-200"
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
                          <TableCell className="text-slate-700 py-3 px-4">
                            {item.application_status_district}
                          </TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">
                            {item.from_district}
                          </TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">
                            {item.to_region}
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            {item.sender_from_district}
                          </TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">
                            {item.recipient_region}
                          </TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">
                            {item.confirmation_date}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>

              </Table>
            </div>

            {/* Enhanced Professional Pagination */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Jami: <span className="font-medium text-slate-900">{totalItems.count}</span> ta Buyurtma
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-600">
                    Ko'rsatilmoqda: <span className="font-medium text-slate-900">{startIndex + 1}</span>-<span className="font-medium text-slate-900">{Math.min(endIndex, totalItems.count)}</span>
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

export default RegionOrder;