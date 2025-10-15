import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { Button } from '@/components/UI/button';
import { Input } from '@/components/UI/input';
import {
  Plus, RefreshCw, Search, // FIX: Calendar as Search -> Search
  ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  CheckCircle, XCircle,
} from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { Outlet, useNavigate, useParams } from 'react-router-dom';
import { setRegions } from '@/store/infoSlice/infoSlice';
import { message, Select, Tag } from 'antd';
import { RegionOrderForm } from '@/components';
import { setOrderTypes, setProductModels, setProductSizes, setProductTypes, setProductUnits } from '@/store/productSlice/productSlice';

interface DocumentInfo {
  id: string;
  type_document_for_filter: string; // "Вилоятдан" | "Тумандан"
  application_status_district: string; // "Bekor qilingan" va h.k.
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

type FilterStatus = 'all' | 'approved' | 'approved_not_accepted' | 'not_approved' | 'Canceled';

interface RegionOrdersResponse {
  count: number;
  limit: number;
  offset: number;
  approved?: number;
  unapproved?: number;
  cancelled?: number;
  unseen?: number;
  results: DocumentInfo[];
  filter_by_districts?: DistrictFilter[];
}

const itemsPerPage = 10;

const RegionOrder: React.FC = () => {
  const [data, setData] = useState<DocumentInfo[]>([]);
  const [filteredData, setFilteredData] = useState<DocumentInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [districts, setDistricts] = useState<DistrictFilter[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingRef, setLoadingRef] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [orderType, setOrderType] = useState<'outgoing' | 'incoming'>('outgoing');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState(false);
  const [totalItems, setTotalItems] = useState<{ count: number; limit: number; offset: number; results: DocumentInfo[] }>({
    count: 0,
    limit: itemsPerPage,
    offset: 0,
    results: [],
  });
  // FIX: statusCounts endi backenddan to‘g‘ridan-to‘g‘ri olinadi
  const [statusCounts, setStatusCounts] = useState<{
    all: number;
    approved: number;
    not_approved: number;           // maps to backend "unapproved"
    Canceled: number;               // maps to backend "cancelled"
    approved_not_accepted: number;  // maps to backend "unseen"
  }>({
    all: 0,
    approved: 0,
    not_approved: 0,
    Canceled: 0,
    approved_not_accepted: 0,
  });
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const dispatch = useAppDispatch();
  const { currentUserInfo } = useAppSelector((state) => state.info);

  const totalPages = Math.ceil(totalItems.count / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const navigate = useNavigate();
  const { id } = useParams();

  const getRegionOrdersList = useCallback(async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        limit: String(itemsPerPage),
        offset: String((currentPage - 1) * itemsPerPage),
        type_document_for_filter: orderType === 'outgoing' ? 'Вилоятдан' : 'Тумандан',
      });

      // FIX: tumanni faqat queryga qo‘shamiz (local filter emas)
      if (selectedDistrict) params.append('from_district', selectedDistrict);

      const response = await axiosAPI.get<RegionOrdersResponse>(`region-orders/list/?${params.toString()}`);
      const res = response.data;

      setDistricts(res.filter_by_districts ?? []);
      setData(res.results ?? []);

      // totalItems — pagination ko'rsatkichlari
      setTotalItems({
        count: res.count ?? 0,
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage,
        results: res.results ?? [],
      });

      // FIX: backend statistikalarini xaritlash
      setStatusCounts({
        all: res.count ?? 0,
        approved: res.approved ?? 0,
        not_approved: res.unapproved ?? 0,
        Canceled: res.cancelled ?? 0,
        approved_not_accepted: res.unseen ?? 0,
      });
    } catch (error) {
      console.error('Error fetching region orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, orderType, selectedDistrict]);

  const handleRefresh = async () => {
    setLoadingRef(true);
    await getRegionOrdersList();
    setLoadingRef(false);
  };

  const handleDocumentClick = (docId: string) => {
    navigate('order-details/' + docId);
  };

  useEffect(() => {
    if (currentUserInfo) getRegionOrdersList();
  }, [getRegionOrdersList, currentUserInfo]);

  // FIX: Bitta yagona filtrlash pipeline (status + orderType + search)
  const filteredRows = useMemo(() => {
    let rows = [...data];

    // Order type bo‘yicha (server ham filtrlab keladi, lekin xavfsizligi uchun clientda ham)
    const requiredType = orderType === 'outgoing' ? 'Вилоятдан' : 'Тумандан';
    rows = rows.filter((r) => r.type_document_for_filter === requiredType);

    // Status bo‘yicha
    switch (statusFilter) {
      case 'approved':
        rows = rows.filter((r) => r.is_approved === true && r.application_status_district !== 'Bekor qilingan');
        break;
      case 'not_approved':
        rows = rows.filter((r) => r.is_approved === false);
        break;
      case 'approved_not_accepted': // unseen
        rows = rows.filter((r) => r.is_seen === false && r.application_status_district !== 'Bekor qilingan');
        break;
      case 'Canceled':
        rows = rows.filter((r) => r.application_status_district === 'Bekor qilingan');
        break;
      case 'all':
      default:
        break;
    }

    // Qidiruv
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      rows = rows.filter((item) =>
        [
          item.reception_number,
          item.exit_number,
          item.from_district,
          item.to_region,
          item.application_status_district,
          item.from_region,
          item.to_district,
          item.sender_from_district,
          item.recipient_region,
        ]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      );
    }

    return rows;
  }, [data, orderType, statusFilter, searchTerm]);

  // filteredData faqat mana shu manbadan keladi
  useEffect(() => {
    setFilteredData(filteredRows);
  }, [filteredRows]);

  // CTRL+F shartli fokus
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
  const goToPreviousPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToPage = (page: number) => setCurrentPage(page);

  // Page numbers
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) pages.push(i);
    return pages;
  };

  const handleStatusFilter = (status: FilterStatus) => {
    setStatusFilter(status);
    // FIX: endi alohida setFilteredData qilmaymiz — pipeline o‘zi yangilanadi
  };

  const getDocumentStyling = (status: boolean) => {
    if (status) {
      return {
        color: 'text-emerald-600 hover:text-emerald-700',
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
      };
    }
    return {
      color: 'text-red-600 hover:text-red-700',
      icon: XCircle,
      iconColor: 'text-red-500',
    };
  };

  // Regions
  const getRegionsList = useCallback(async () => {
    try {
      const response = await axiosAPI.get('regions/list/?order_by=2');
      if (response.status === 200) {
        dispatch(setRegions(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  useEffect(() => {
    getRegionsList();
  }, [getRegionsList]);

  // Dictlarni yuklash
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [orderTypeRes, productTypeRes, sizeRes, unitRes, modelRes] =
          await Promise.all([
            axiosAPI.get("/enumerations/order_types"),
            axiosAPI.get("/product_types/list", { params: { limit: 200 } }),
            axiosAPI.get("/sizes/list"),
            axiosAPI.get("/units/list"),
            axiosAPI.get("/models/list", { params: { limit: 200 } }), // <— model mustaqil
          ]);

        if (!mounted) return;
        dispatch(setOrderTypes(orderTypeRes.data))
        dispatch(setProductTypes(productTypeRes.data))
        dispatch(setProductSizes(sizeRes.data))
        dispatch(setProductUnits(unitRes.data))
        dispatch(setProductModels(modelRes.data))
      } catch (err) {
        console.error(err);
        message.error("Ma’lumotlarni yuklashda xatolik!");
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dispatch]);

  const { Option } = Select;

  // FIX: tumanni tanlash faqat query holatini o‘zgartiradi
  const handleChange = (value: string | undefined) => {
    setSelectedDistrict(value || '');
    setCurrentPage(1);
  };

  return (
    <>

      {isCreateFormModalOpen ? (
        <>
          <RegionOrderForm setIsCreateFormModalOpen={setIsCreateFormModalOpen} />
        </>
      ) : id ? (
        <Outlet />
      ) : (
        <div className="bg-white shadow-md p-4 rounded-md space-y-4 animate-in fade-in duration-700">
          <div className="animate-in slide-in-from-top-4 fade-in duration-600">
            <div className="rounded-lg">
              <h1 className="text-2xl text-black pb-4">Viloyatlar bo'yicha buyurtma</h1>

              <div className="flex items-center justify-between gap-20">
                {/* Status tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusFilter('all')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                  >
                    <span>Barchasi</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'all' ? 'bg-slate-200 text-slate-800' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {statusCounts.all}
                    </span>
                  </button>

                  <button
                    onClick={() => handleStatusFilter('approved')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'approved'
                      ? 'bg-emerald-50 text-emerald-800 shadow-sm border border-emerald-200'
                      : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                      }`}
                  >
                    <span>Tasdiqlangan</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {statusCounts.approved}
                    </span>
                  </button>

                  <button
                    onClick={() => handleStatusFilter('not_approved')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'not_approved'
                      ? 'bg-red-50 text-red-800 shadow-sm border border-red-200'
                      : 'text-slate-600 hover:text-red-700 hover:bg-red-50'
                      }`}
                  >
                    <span>Tasdiqlanmagan</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'not_approved' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
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
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'Canceled' ? 'bg-slate-300 text-slate-900' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {statusCounts.Canceled}
                    </span>
                  </button>

                  <button
                    onClick={() => handleStatusFilter('approved_not_accepted')}
                    className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${statusFilter === 'approved_not_accepted'
                      ? 'bg-amber-50 text-amber-800 shadow-sm border border-amber-200'
                      : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
                      }`}
                  >
                    <span>Ko'rilmagan</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusFilter === 'approved_not_accepted' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                        }`}
                    >
                      {statusCounts.approved_not_accepted}
                    </span>
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-full">
                    <Select
                      placeholder="tur"
                      value={orderType}
                      className="w-[200px]"
                      options={[
                        { value: 'outgoing', label: 'Chiquvchi xabarlar' },
                        { value: 'incoming', label: 'Kiruvchi xabarlar' },
                      ]}
                      onChange={(value) => setOrderType(value as 'incoming' | 'outgoing')}
                    />
                  </div>

                  <div className="w-full flex items-center justify-between">
                    {loading ? (
                      <div className="text-center text-gray-500">Yuklanmoqda...</div>
                    ) : (
                      <Select
                        value={selectedDistrict || ''}
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
                                color={item.count > 0 ? 'blue' : 'default'}
                                style={{
                                  marginLeft: 'auto',
                                  fontSize: '12px',
                                  borderRadius: '10px',
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

          {/* Actions & search */}
          <div className="bg-white py-3 flex justify-between">
            <div className="flex items-center gap-3">
              <Button className="cursor-pointer" onClick={() => setIsCreateFormModalOpen(true)}>
                <Plus />
                Yaratish
              </Button>

              <Button className="cursor-pointer" onClick={handleRefresh} disabled={loading}>
                {loadingRef ? <RefreshCw className="animate-spin w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                {loadingRef ? 'Yangilanmoqda...' : 'Yangilash'}
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

          {/* Table */}
          <div className="overflow-hidden transform transition-all hover:shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-700">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 border-b border-slate-200">
                    <>
                      <TableHead>{orderType === 'outgoing' ? 'Chiqish' : 'Kirish'} №</TableHead>
                      <TableHead>{orderType === 'outgoing' ? 'Chiqish' : 'Kirish'} sanasi</TableHead>
                      <TableHead>Tuman{orderType === 'outgoing' ? 'ga' : 'dan'}</TableHead>
                      <TableHead>Bo'limdan yuboruvchi</TableHead>
                      <TableHead>{orderType === 'outgoing' ? 'Viloyatdan' : 'Tumandan'} jo'natuvchi</TableHead>
                      <TableHead>{orderType === 'outgoing' ? 'Tumanda' : 'Viloyatda'} qabul qiluvchi</TableHead>
                      <TableHead>Viloyat buyurtma holati</TableHead>
                      <TableHead>Tasdiqlangan sana</TableHead>
                    </>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center font-semibold text-xl py-6 text-gray-900">
                        {selectedDistrict ? `${selectedDistrict} tumanida hujjat mavjud emas ?` : 'Hujjatlar mavjud emas'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item, index) => {
                      const documentStyle = getDocumentStyling(item.is_approved);
                      const StatusIcon = documentStyle.icon;

                      return (
                        <TableRow
                          key={`${item.id}-${index}`}
                          onClick={() => handleDocumentClick(item.id)}
                          className="hover:bg-slate-50 transition-all duration-200"
                        >
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <StatusIcon className={`w-5 h-5 ${documentStyle.iconColor} transition-all duration-200`} />
                              <span className={`font-bold hover:underline transition-all duration-300 cursor-pointer ${documentStyle.color}`}>
                                {item.exit_number}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">{item.exit_date ? item.exit_date.split('T').join('  ') : ''}</TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">{item.application_status_district}</TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">{item.from_district}</TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">{item.to_region}</TableCell>
                          <TableCell className="py-3 px-4">{item.sender_from_district}</TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">{item.recipient_region}</TableCell>
                          <TableCell className="text-slate-700 py-3 px-4">{item.confirmation_date}</TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="border-t border-slate-100 px-6 py-4 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">
                    Jami: <span className="font-medium text-slate-900">{totalItems.count}</span> ta Buyurtma
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-sm text-slate-600">
                    Ko'rsatilmoqda:{' '}
                    <span className="font-medium text-slate-900">{totalItems.count === 0 ? 0 : startIndex + 1}</span>-
                    <span className="font-medium text-slate-900">{Math.min(endIndex, totalItems.count)}</span>
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
                      variant={currentPage === pageNum ? 'default' : 'outline'}
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
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="h-8 w-8 p-0 border-slate-300 text-slate-600 hover:bg-[#1E56A0]/70 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages || totalPages === 0}
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
};

export default RegionOrder;
