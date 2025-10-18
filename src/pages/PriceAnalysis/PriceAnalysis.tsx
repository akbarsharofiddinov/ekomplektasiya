import { Input } from '@/components/UI/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table'
import { Button, Modal } from 'antd'
import { CheckCircle2, Plus, RefreshCw, Search } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const PriceAnalysis: React.FC = () => {
  // States =========================
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isCreateFormModalOpen, setIsCreateFormModalOpen] = useState<boolean>(false);

  // Search =========================
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    const lower = value.toLowerCase();

    // const filtered = filteredData.filter((item) =>
    //   Object.values(item).some(
    //     (val) =>
    //       val &&
    //       val.toString().toLowerCase().includes(lower)
    //   )
    // );

    // setFilteredData(filtered);
  };


  // API Fetch requests =====================
  const getDistrictOrderList = async () => {
    try {
      // const response = await axiosAPI.get(`district-orders/list/?limit=${itemsPerPage}&offset=${(currentPage - 1) * itemsPerPage}&type_document_for_filter=${districtOrderType === "outgoing" ? encodeURIComponent("Тумандан") : encodeURIComponent("Вилоятдан")}`);
      // setFilteredData(response.data.results);
      // setData(response.data.results);
      // setTotalItems(response.data);
    } catch (error) {
      console.error('Error fetching warehouse transfers:', error);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    await getDistrictOrderList();
    setLoading(false);
  };

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

  return (
    <>
      <section className='min-h-[calc(100vh-150px)] p-6 bg-white'>
        {/* Top */}
        <div className='flex items-center justify-between'>
          {/* left */}
          <div className='flex items-center gap-3'>
            <Button className='cursor-pointer' onClick={() => {
              setIsCreateFormModalOpen(true)
            }}>
              <Plus />
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

          {/* Search box */}
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

        {/* Table */}
        <div className="bg-white mt-6 rounded-xl border border-slate-100 shadow-sm overflow-hidden transform transition-all hover:shadow-lg animate-in slide-in-from-bottom-4 fade-in duration-700">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 border-b border-slate-100">
                  <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                    №
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                    Sana
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                    Nomi
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                    Xodim
                  </TableHead>
                  <TableHead className="text-slate-700 font-semibold py-3 px-4 text-center">
                    Shakllangan
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    1
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    2025-09-15 6:55:27 PM
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Kislorod
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Ishroilov Shoxrux Shavkatovich
                  </TableCell>
                  <TableCell className='flex items-center justify-center text-emerald-500 py-3 px-4 border-r-1'>
                    <CheckCircle2 />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    1
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    2025-09-15 6:55:27 PM
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Kislorod
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Ishroilov Shoxrux Shavkatovich
                  </TableCell>
                  <TableCell className='flex items-center justify-center text-emerald-500 py-3 px-4 border-r-1'>
                    <CheckCircle2 />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    1
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    2025-09-15 6:55:27 PM
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Kislorod
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Ishroilov Shoxrux Shavkatovich
                  </TableCell>
                  <TableCell className='flex items-center justify-center text-emerald-500 py-3 px-4 border-r-1'>
                    <CheckCircle2 />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    1
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    2025-09-15 6:55:27 PM
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Kislorod
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Ishroilov Shoxrux Shavkatovich
                  </TableCell>
                  <TableCell className='flex items-center justify-center text-emerald-500 py-3 px-4 border-r-1'>
                    <CheckCircle2 />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    1
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    2025-09-15 6:55:27 PM
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Kislorod
                  </TableCell>
                  <TableCell className='text-center text-slate-700 py-3 px-4 border-r-1'>
                    Ishroilov Shoxrux Shavkatovich
                  </TableCell>
                  <TableCell className='flex items-center justify-center text-emerald-500 py-3 px-4 border-r-1'>
                    <CheckCircle2 />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {isCreateFormModalOpen && (
        <></>
      )}
    </>
  )
}

export default PriceAnalysis