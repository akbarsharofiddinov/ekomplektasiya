/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
// import { Badge } from '@/components/UI/badge';
import { Button } from '@/components/UI/button';
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/UI/popover';
import { Input } from '@/components/UI/input';
import { Plus, RefreshCw, Calendar as Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useAppDispatch } from '@/store/hooks/hooks';
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
  sender_from_republic: string;
  recipient_republic: string;
  application_status_republic: string;
}

interface RegionFilter {
  region: string;
  count: number;
}


type FilterStatus = 'all' | 'approved' | 'approved_not_accepted' | 'not_approved' | "Canceled";

const RepublicOrder: React.FC = () => {
  const [data, setData] = useState<DocumentInfo[]>([]); // ✅ API dan kelgan asl ma'lumotlar
  const [filteredData, setFilteredData] = useState<DocumentInfo[]>([]);
  const [region_filter, setRegionFilter] = useState<RegionFilter[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("");

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
    // filter_by_regions: RegionFilter[];
    // results: DocumentInfo[];
  }>({
    count: 0,
    limit: itemsPerPage,
    offset: 0,
    // filter_by_regions: [],
    // results: [],
  });

  const [searchValue] = useState("");

  // Redux
  const dispatch = useAppDispatch()
  // const { warehouse_transfers } = useAppSelector(state => state.transferSlice)

  // Calculate pagination
  const totalPages = Math.ceil(totalItems.count / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;


  // API Requests
  const getRegionOrdersList = async () => {
    try {
      let url = `republic-orders/list/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}&type_document_for_filter=${orderType === "outgoing" ? encodeURIComponent("Вилоятга") : encodeURIComponent("Вилоятдан")}`;

      if (selectedRegion && selectedRegion !== 'Barchasi') {
        url += `&from_region=${selectedRegion}`;
      }

      const response = await axiosAPI.get(url);
      setData(response.data.results); // ✅ Asl ma'lumotlarni saqlaymiz
      setFilteredData(response.data.results); // ✅ Ko'rsatiladigan ma'lumotlar
      setRegionFilter(response.data.filter_by_regions);
      setTotalItems(response.data);
    } catch (error) {
      console.error('Error fetching warehouse transfers:', error);
    }
  };

  const handleDocumentClick = (id: string) => {
    navigate("order-details/" + id);
  };

  useEffect(() => {
    getRegionOrdersList();
  }, [orderType, currentPage, selectedRegion]);


  const navigate = useNavigate();
  const { id } = useParams()

  // 🔹 ViewMode bo‘yicha filter
  // useEffect(() => {
  //   let filtered = data;
  //   if (orderType === "outgoing") {
  //     filtered = data.filter(
  //       (item) => item.type_document_for_filter === "Вилоятга"
  //     );
  //   } else {
  //     filtered = data.filter(
  //       (item) => item.type_document_for_filter === "Вилоятдан"
  //     );
  //   }

  //   // 🔸 Search qo‘llanadi
  //   if (searchValue.trim() !== "") {
  //     const query = searchValue.toLowerCase();
  //     filtered = filtered.filter(
  //       (item) =>
  //         item.exit_number?.toLowerCase().includes(query) ||
  //         item.reception_number?.toLowerCase().includes(query) ||
  //         item.from_district?.toLowerCase().includes(query) ||
  //         item.to_region?.toLowerCase().includes(query) ||
  //         item.application_status_district?.toLowerCase().includes(query) ||
  //         item.from_region?.toLowerCase().includes(query) ||
  //         item.sender_from_republic?.toLowerCase().includes(query) ||
  //         item.recipient_republic?.toLowerCase().includes(query)
  //     );
  //   }

  //   setFilteredData(filtered);
  //   setCurrentPage(1);
  // }, [orderType, searchValue, data]);


  // Pagination handlers
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToPreviousPage = () => setCurrentPage(Math.max(1, currentPage - 1));
  const goToNextPage = () => setCurrentPage(Math.min(totalPages, currentPage + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 4;

    // totalPages kam bo'lsa, maxVisiblePages dan kichik qilib olamiz
    const visiblePages = Math.min(maxVisiblePages, totalPages);

    let startPage = Math.max(1, currentPage - Math.floor(visiblePages / 2));
    let endPage = startPage + visiblePages - 1;

    // endPage totalPages dan oshmasin
    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - visiblePages + 1);
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
  const { Option } = Select;

  const handleChange = (value) => {
    setSelectedRegion(value || "");
    setCurrentPage(1);

    getRegionOrdersList();
  };

  useEffect(() => {
    let filtered = data;

    if (statusFilter === 'approved') {
      filtered = data.filter((item) => item.is_approved === true);
    } else if (statusFilter === 'not_approved') {
      filtered = data.filter((item) => item.is_approved === false);
    } else if (statusFilter === 'Canceled') {
      filtered = data.filter((item) => item.application_status_republic === "Bekor qilingan");
    }

    setFilteredData(filtered);
  }, [statusFilter, data]);


  // Get counts for each status
  const statusCounts = {
    all: totalItems.count || 0,
    approved: totalItems.approved || 0,
    not_approved: totalItems.unapproved || 0,
    cancelled: totalItems.cancelled || 0,
    seen: totalItems.seen || 0,
    unseen: totalItems.unseen || 0,
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
              <h1 className='text-2xl text-black pb-4'>Respublika bo'yicha buyurtma</h1>

              <div className="w-full flex items-center gap-30">
                {/* Status Filter Tabs - Left Side */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`flex items-center space-x-1 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'all'
                      ? 'bg-slate-100 text-slate-900'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                  >
                    <span>Barchasi</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-700">
                      {statusCounts.all}
                    </span>
                  </button>

                  {/* Green - Approved and Accepted */}
                  <button
                    onClick={() => setStatusFilter('approved')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                  >
                    <span>Tasdiqlangan</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-700">
                      {statusCounts.approved}
                    </span>
                  </button>

                  {/* Red - Not Approved */}
                  <button
                    onClick={() => setStatusFilter('not_approved')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'not_approved'
                      ? 'bg-red-50 text-red-800 border border-red-200'
                      : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                  >
                    <span>Tasdiqlanmagan</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                      {statusCounts.not_approved}
                    </span>
                  </button>

                  <button
                    onClick={() => setStatusFilter('Canceled')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'Canceled'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                  >
                    <span>Bekor qilingan</span>
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700">
                      {statusCounts.cancelled}
                    </span>
                  </button>

                  {/* Yellow - Approved but not Accepted */}
                  <button
                    onClick={() => setStatusFilter('approved_not_accepted')}
                    className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-all duration-300 font-medium text-sm ${statusFilter === 'approved_not_accepted'
                      ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200'
                      : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                  >
                    <span>Kurilmagan</span>
                    <span className={`px-2 py-0.5 text-xs font-medium ${statusFilter === 'approved_not_accepted'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                      }`}>
                      {/* {statusCounts.approved_not_accepted} */}
                    </span>
                  </button>
                </div>
                <div className="w-full flex items-center gap-3">
                  <div className='w-full'>
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
                  <div className='w-full'>
                    <Select
                      value={selectedRegion || ""}
                      onChange={handleChange}
                      allowClear
                      placeholder="Barcha hujjatlar"
                      className="w-[100%]"
                      showSearch
                      optionFilterProp="children"
                      popupClassName="rounded-xl shadow-md"
                    >
                      <Option key="all" value="">
                        <span className="text-gray-600">Barcha hujjatlar</span>
                      </Option>
                      {region_filter.map((item, index) => (
                        <Option key={index} value={item.region}>
                          <div className="flex justify-between items-center">
                            <span>{item.region}</span>
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
                  </div>
                </div>

                {/* Action Buttons - Right Side */}

              </div>
            </div>
          </div>
          <div className="bg-white py-3 flex justify-between">
            <div className='flex items-center gap-3'>
              <Button className='cursor-pointer'>
                <Plus></Plus>
                Yaratish
              </Button>

              <Button className='cursor-pointer'>
                <RefreshCw></RefreshCw>
                Yangilash
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Qidirish (Ctrl+F)"
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
                      <TableHead>Viloyat{orderType === "outgoing" ? "ga" : "dan"}</TableHead>
                      <TableHead>{orderType === "outgoing" ? "Respublikadan" : "Viloyatdan"} jo'natuvchi</TableHead>
                      <TableHead>{orderType === "outgoing" ? "Viloyatda" : "Respublikadan"} qabul qiluvchi</TableHead>
                      <TableHead>Buyurtma holati</TableHead>
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
                        {selectedRegion ? (
                          <div>
                            {selectedRegion} {" "}
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
                    filteredData.map((item, index) => (
                      <TableRow
                        key={index}
                        onClick={() => handleDocumentClick(item.id)}
                      >
                        <TableCell className="py-3 px-4">{item.exit_number}</TableCell>
                        <TableCell className="py-3 px-4">
                          {new Date(item.exit_date)
                            .toLocaleString("uz-UZ", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                            .replace(",", ". ")}
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">
                          {item.from_region}
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">
                          {item.sender_from_region}
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">
                          {item.recipient_republic}
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">
                          {item.application_status_republic}
                        </TableCell>
                        <TableCell className="text-slate-700 py-3 px-4">
                          {item.confirmation_date}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>

              </Table>
            </div>

            {/* Enhanced Professional Pagination */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Jami: <span className="font-medium text-slate-900">{totalItems.count}</span> ta transfer
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

export default RepublicOrder;