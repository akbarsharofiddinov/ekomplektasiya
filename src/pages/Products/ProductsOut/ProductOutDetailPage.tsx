/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  X,
  Printer,
  Save,
  MessageCircle,
  Search,
  CircleCheckBig,
  Trash2,
  Plus,
  RefreshCcw,
} from "lucide-react";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import Barcode from "react-barcode";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Badge } from "@/components/UI/badge";
// import { Checkbox } from "@/components/UI/checkbox";
import { axiosAPI } from "@/services/axiosAPI";
import { useNavigate, useParams } from "react-router-dom";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { toast } from "react-toastify";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteAlertDialog from "@/components/DeleteAlertDialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import { removeFromListByID } from "@/store/productSlice/productSlice";
import SelectRemainsModal from "@/components/CreateForms/SelectRemainsModal";
import { setRegions } from "@/store/infoSlice/infoSlice";


type ProductProperties = {
  id: string;
  name: string;
}

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

interface ProductItem {
  row_number: number;
  bar_code: string;
  product: ProductProperties;
  model: ProductProperties;
  product_type: ProductProperties;
  size: ProductProperties;
  unit: ProductProperties;
  product_code: string;
  price: number;
  quantity: number;
  summa: number;
}

interface IDocumentData {
  id: string;
  date: string;
  is_approved: boolean;
  number: string;
  product_status: { id: string; name: string };
  products: ProductItem[];
  district: { id: string; name: string }
  responsible_person: { id: string; name: string } | null;
  type_output: { id: string; name: string };
  warehouse: { id: string; name: string };
  region: { id: string; name: string };
}

interface IWarehouse {
  id: string;
  name: string;
}
interface ITypeOfGoods {
  id: string;
  name: string;
}
interface IResponsiblePerson {
  id: string;
  name: string;
}

const ProductOutDetailPage: React.FC = () => {
  const { id: documentNumber } = useParams();

  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [documentData, setDocumentData] = useState<IDocumentData | null>(null);
  const [mockData, setMockData] = useState<IDocumentData | null>(null);
  const [dataChanged, setDataChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alertDialog, setAlertDialog] = useState(false);
  const [openSelectRemaindersModal, setOpenSelectRemaindersModal] =
    useState<boolean>(false);

  // Options from API
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);

  const [remainders, setRemainders] = useState<ProductRemainder[]>([]);
  const [selectedRemaindersList, setSelectedRemaindersList] = useState<ProductRemainder[]>([]);


  const [openBarCodeModal, setOpenBarCodeModal] = useState("");
  const [typesOfGoods, setTypesOfGoods] = useState<ITypeOfGoods[]>([]);
  const [responsiblePersons, setResponsiblePersons] = useState<
    IResponsiblePerson[]
  >([]);

  const navigate = useNavigate();

  // Redux
  const dispatch = useAppDispatch()
  const { regions } = useAppSelector(state => state.info)

  // Helpers to render labels for IDs
  // const getWarehouseName = useCallback(
  //   (id?: string) => warehouses.find((w) => w.id === id)?.name || "",
  //   [warehouses]
  // );
  // const getCounterpartyName = useCallback(
  //   (id?: string) => counterParties.find((c) => c.id === id)?.name || "",
  //   [counterParties]
  // );
  // const getResponsibleName = useCallback(
  //   (id?: string) => responsiblePersons.find((r) => r.id === id)?.name || "",
  //   [responsiblePersons]
  // );
  // const getTypeGoodsName = useCallback(
  //   (id?: string) => typesOfGoods.find((t) => t.id === id)?.name || "",
  //   [typesOfGoods]
  // );

  // const handleSelectItem = (itemId: string) => {
  //   setSelectedItems((prev) =>
  //     prev.includes(itemId)
  //       ? prev.filter((id) => id !== itemId)
  //       : [...prev, itemId]
  //   );
  // };

  // Helpers
  const updateHeaderField = <K extends keyof IDocumentData>(
    key: K,
    value: any
  ) => {
    setDocumentData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };


  const getWarehousesList = useCallback(async () => {
    try {
      const res = await axiosAPI.get("warehouses/list/");
      if (res.status === 200) setWarehouses(res.data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const getTypeOfGoodsList = useCallback(async () => {
    try {
      // If you have another endpoint for OUT types, adjust here
      const res = await axiosAPI.get("type_outputs/list/");
      if (res.status === 200) setTypesOfGoods(res.data);
    } catch (e) {
      console.log(e);
    }
  }, []);

  const getResponsiblePersonList = useCallback(
    async (warehouseId?: string) => {
      const whId = warehouseId || documentData?.warehouse || "";
      if (!whId) {
        setResponsiblePersons([]);
        return;
      }
      try {
        const res = await axiosAPI.get(`warehouses/responsible_person/${whId}`);
        if (res.status === 200) {
          const list: IResponsiblePerson[] = res.data;
          setResponsiblePersons(list);
          // Auto-select if only one
          if (list.length === 1) {
            setDocumentData((prev) =>
              prev ? { ...prev, responsible_person: list[0] } : prev
            );
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    [documentData?.warehouse]
  );

  // API: Detail
  const getWriteOffDetail = useCallback(async () => {
    try {
      const response = await axiosAPI.get(
        `/write-offs/detail/${documentNumber}`
      );
      if (response.status === 200) {
        const doc: IDocumentData = response.data[0];
        setDocumentData(doc);
        setMockData(doc);
        setDataChanged(false);
      }
    } catch (error) {
      console.log(error);
    }
  }, [documentNumber]);


  const handleDeleteProductInput = async (inputID: string) => {
    try {

      const response = await axiosAPI.delete(`/write-offs/delete/${inputID}`);
      if (response.status === 200) {
        setDocumentData(null);
        dispatch(removeFromListByID(inputID));
        toast("Kirim muvaffaqiyatli o'chirildi", { type: "success" });
        navigate(-1);
      }
    } catch (error: any) {
      toast(error?.response?.data?.error || "Xatolik yuz berdi", { type: "error" });
    } finally {
      setAlertDialog(false)
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true); // 🔄 Icon aylanadi
      await getWriteOffDetail(); // 🔁 Ma’lumotni qayta chaqiramiz
    } catch (err) {
      console.error("Yangilashda xatolik:", err);
    } finally {
      // ⏳ Kichik kechikish bilan spinnerni to‘xtatamiz
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  async function getRemainders() {
    try {
      const response = await axiosAPI.post("remainders/warehouses/", {
        warehouse: documentData?.warehouse.id,
        date: documentData?.date,
      });

      setRemainders(response.data);
    } catch (error) {
      console.error("Xatolik:", error);
    }
  }


  const getRegionsList = useCallback(async () => {
    if (regions.length > 0) return;
    try {
      const response = await axiosAPI.get("regions/list/?order_by=2");
      if (response.status === 200) {
        dispatch(setRegions(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, regions.length]);

  // API: Update (Edit)
  const handleUpdateWriteOff = useCallback(async () => {
    if (!documentData) return;
    setSaving(true);
    try {
      const payload = {
        id: documentData.id,
        number: documentData.number,
        date: documentData.date
          ? dayjs(documentData.date).format(DATE_FORMAT)
          : "",
        warehouse: documentData.warehouse.id,
        responsible_person: documentData.responsible_person?.id,
        type_output: documentData.type_output.id,
        region: documentData.region.id,
        district: documentData.district.id,
        products: documentData.products.map(product => ({ ...product, product: product.product.id, model: product.model.id, product_type: product.product_type.id, size: product.size.id, unit: product.unit.id })),
        product_status: documentData.product_status.id
      };
      const res = await axiosAPI.post(
        `/write-offs/update/${documentData.id}`,
        payload
      );
      if (res.status === 200) {
        toast("O'zgarishlar saqlandi", { type: "success" });
        setMockData(documentData);
        setDataChanged(false);
      }
    } catch (e) {
      console.log(e);
      toast("Saqlashda xatolik", { type: "error" });
    } finally {
      setSaving(false);
    }
  }, [documentData]);

  useEffect(() => {
    if (documentData?.date && documentData.warehouse.name) getRemainders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentData?.date, documentData?.warehouse])

  // Handle approve input product
  const handleApproveInput = async () => {
    if (!documentData) return;
    setSaving(true);
    try {
      const response = await axiosAPI.post(
        `/write-offs/confirmation/${documentData.id}`,
        {
          ...documentData,
          warehouse: documentData.warehouse.id,
          region: documentData.region.id,
          responsible_person: documentData.responsible_person?.id,
          type_output: documentData.type_output.id,
        }
      );
      if (response.status === 200) {
        toast("Kirim muvaffaqiyatli tasdiqlandi", { type: "success" });
        setMockData(documentData);
        setDataChanged(false);
      }
    } catch (error: any) {
      console.log(error);
      toast(error.response.data.error, { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Effects: initial loads
  useEffect(() => {
    getWriteOffDetail();
  }, [getWriteOffDetail]);

  useEffect(() => {
    if (documentData?.products) {
      const documentDataSelectedRemainders = documentData.products
        .map(prod => {
          const matchedRemainder = remainders.find(rem => rem.product_code === prod.product_code);
          return matchedRemainder;
        })
        .filter((remainder): remainder is ProductRemainder => remainder !== undefined);

      setSelectedRemaindersList(documentDataSelectedRemainders);
    }
  }, [documentData?.products, remainders]);

  useEffect(() => {
    getWarehousesList();
    getTypeOfGoodsList();
  }, [getWarehousesList, getTypeOfGoodsList]);

  // Reload responsible persons when warehouse changes
  useEffect(() => {
    if (documentData?.warehouse)
      getResponsiblePersonList(documentData.warehouse.id);
  }, [documentData?.warehouse, getResponsiblePersonList]);

  // Detect changes
  useEffect(() => {
    const changed = JSON.stringify(documentData) !== JSON.stringify(mockData);
    setDataChanged(changed);
  }, [documentData, mockData]);

  // Ensure current selections are visible even if not in fetched lists
  const warehouseOptions = useMemo(() => {
    const list = [...warehouses];
    if (
      documentData?.warehouse &&
      !list.some((w) => w.id === documentData.warehouse.id)
    ) {
      list.unshift({
        id: documentData?.warehouse.id,
        name: documentData?.warehouse.name,
      });
    }
    return list;
  }, [warehouses, documentData?.warehouse]);

  const typeGoodsOptions = useMemo(() => {
    const list = [...typesOfGoods];
    if (
      documentData?.type_output &&
      !list.some((t) => t.id === documentData.type_output.id)
    ) {
      list.unshift({
        id: documentData?.type_output.id,
        name: documentData?.type_output.name,
      });
    }
    return list;
  }, [typesOfGoods, documentData?.type_output]);

  const responsibleOptions = useMemo(() => {
    const list = [...responsiblePersons];
    if (
      documentData?.responsible_person &&
      !list.some((r) => r.id === documentData.responsible_person?.id)
    ) {
      list.unshift({
        id: documentData?.responsible_person.id,
        name: documentData?.responsible_person.name,
      });
    }
    return list;
  }, [responsiblePersons, documentData?.responsible_person]);

  useEffect(() => {
    // Map ProductRemainder objects to ProductItem objects
    const mappedProducts: ProductItem[] = selectedRemaindersList.map((remainder, index) => ({
      row_number: index + 1,
      bar_code: remainder.bar_code || '',
      product: remainder.product,
      model: remainder.model || { id: '', name: '' },
      product_type: remainder.product_type || { id: '', name: '' },
      size: remainder.size || { id: '', name: '' },
      unit: remainder.unit || { id: '', name: '' },
      product_code: remainder.product_code || '',
      price: remainder.price || 0,
      quantity: remainder.remaining_quantity || 1,

      summa: (remainder.price || 0) * (remainder.remaining_quantity || 1)
    }));

    setDocumentData(prev => prev ? { ...prev, products: mappedProducts } : prev);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRemaindersList.length]);

  return (
    <>
      <div className="min-h-screen bg-slate-50 flex animate-in fade-in duration-500">
        {/* Main Content */}
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    navigate(-1);
                  }}
                  className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Tovarlar chiqim {documentData?.number} dan {""}
                    {documentData?.date
                      ? dayjs(documentData.date).format(DATE_FORMAT)
                      : ""}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Tovarlar chiqim hujjati tafsilotlari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={`px-3 py-1 border ${documentData?.is_approved
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}
                >
                  {documentData?.is_approved ? "Tasdiqlangan" : "Tasdiqlanmagan"}
                </Badge>

                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={getWriteOffDetail}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105 active:scale-95"
                >
                  <RefreshCcw id="refreshIcon" className="w-4 h-4 mr-1 transition-transform duration-1000 rotate-animation" />
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
                </Button> */}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105 active:scale-95"
                >
                  <RefreshCcw
                    id="refreshIcon"
                    className={`w-4 h-4 mr-1 transition-transform duration-700 ${isRefreshing ? "animate-spin" : ""
                      }`}
                  />
                  Yangilash
                </Button>

              </div>
            </div>
          </div>

          {/* Document Information */}
          <div className="bg-white border-b border-slate-200 py-4">
            <Accordion defaultExpanded className="shadow-none before:hidden">
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
                <Typography>Tovarlar chiqim hujjati tafsilotlari</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Number */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Hujjat №
                    </Label>
                    <Input
                      value={documentData?.number}
                      disabled
                      className="h-9 text-sm border-slate-200 focus:border-[#1E56A0] focus:ring-1 focus:ring-[#1E56A0]/20 transition-all"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Sana
                    </Label>
                    <DatePicker
                      disabled={documentData?.is_approved}
                      value={
                        documentData?.date ? dayjs(documentData.date) : undefined
                      }
                      onChange={(v: Dayjs | null) =>
                        setDocumentData((prev) =>
                          prev
                            ? { ...prev, date: v ? v.format(DATE_FORMAT) : "" }
                            : prev
                        )
                      }
                      showTime={{ format: "HH:mm:ss" }}
                      format={DATE_FORMAT}
                      className="w-full h-9"
                    />
                  </div>

                  {/* Region (Select) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Viloyat
                    </Label>
                    <Select
                      disabled={documentData?.is_approved}
                      value={documentData?.region.name}
                      onChange={(value: string) => {
                        const r = regions.find((reg) => reg.id === value);
                        updateHeaderField("region", {
                          id: value,
                          name: r?.name || "",
                        });
                      }}
                      onDropdownVisibleChange={(open) => {
                        if (open) getRegionsList();
                      }}
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                      options={regions.map((r) => ({
                        value: r.id,
                        label: r.name,
                      }))}
                      placeholder="Region tanlang"
                    />
                  </div>

                  {/* Warehouse */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Ombor
                    </Label>
                    <Select
                      value={documentData?.warehouse.id || undefined}
                      placeholder="Omborni tanlang"
                      className="w-full"
                      disabled={documentData?.is_approved}
                      showSearch
                      optionFilterProp="label"
                      options={warehouseOptions.map((w) => ({
                        value: w.id,
                        label: w.name,
                      }))}
                      onDropdownVisibleChange={(open) => {
                        if (open) getWarehousesList();
                      }}
                      onChange={(value: string) => {
                        setDocumentData((prev) =>
                          prev
                            ? { ...prev, warehouse: { id: value, name: warehouseOptions.find(w => w.id === value)?.name || "" }, responsible_person: null }
                            : prev
                        );
                      }}
                    />
                  </div>

                  {/* Responsible person */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Javobgar xodim
                    </Label>
                    <Select
                      value={documentData?.responsible_person?.id || undefined}
                      placeholder="Mas'ul shaxsni tanlang"
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                      disabled={documentData?.is_approved || !documentData?.warehouse}
                      options={responsibleOptions.map((r) => ({
                        value: r.id,
                        label: r.name,
                      }))}
                      onDropdownVisibleChange={(open) => {
                        if (open) getResponsiblePersonList(documentData?.warehouse.id);
                      }}
                      onChange={(value: string) => {
                        setDocumentData((prev) =>
                          prev ? { ...prev, responsible_person: { id: value, name: responsibleOptions.find(r => r.id === value)?.name || "" } } : prev
                        );
                      }}
                    />
                  </div>

                  {/* Type of goods */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Tovar chiqim turi
                    </Label>
                    <Select
                      value={documentData?.type_output.id || undefined}
                      placeholder="Chiqim turini tanlang"
                      className="w-full"
                      disabled={documentData?.is_approved}
                      showSearch
                      optionFilterProp="label"
                      // options={typeGoodsOptions.map((t) => ({
                      //   value: t.id,
                      //   label: t.name,
                      // }))}
                      onDropdownVisibleChange={(open) => {
                        if (open) getTypeOfGoodsList();
                      }}
                      onChange={(value: string) => {
                        setDocumentData((prev) =>
                          prev ? { ...prev, type_output: { id: value, name: typeGoodsOptions.find(t => t.id === value)?.name || "" } } : prev
                        );
                      }}
                    >
                      {typeGoodsOptions.map((t) => t.id && <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}
                    </Select>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>

          {/* Action Buttons Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {!documentData?.is_approved && (
                  <>
                    {/* Add product */}
                    <Button
                      size="sm"
                      className="gap-2 bg-[#1E56A0] hover:bg-[#1E56A0]/90 text-white cursor-pointer"
                      onClick={() => {
                        if (documentData?.warehouse && documentData?.date) { setOpenSelectRemaindersModal(true) }
                        else {
                          toast("Iltimos, avval ombor va sanani tanlang", { type: "warning" });
                        }
                      }}
                    >
                      <Plus className="w-4 h-4" />
                      Tovar qo'shish
                    </Button>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Chop etish
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Qidirish (Ctrl+F)"
                    className="w-64 h-8 pl-9 text-sm border-slate-200 focus:border-[#1E56A0] focus:ring-1 focus:ring-[#1E56A0]/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="flex-1 bg-white">
            <div className="p-6">
              {/* Products Table */}
              <div className="border border-slate-200 rounded-lg overflow-x-auto shadow-sm">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="text-slate-700 font-semibold p-3">
                        №
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Shtrix kod raqam
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Shtrix kod
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Tovar nomi
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Model
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Partiya sanasi
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        O'lcham
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Soni
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Narx
                      </TableHead>
                      <TableHead className="text-slate-700 font-semibold p-3">
                        Summa
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documentData?.products.map((item, index) => (
                      <TableRow
                        key={index}
                        className={`hover:bg-slate-50 transition-colors group ${selectedItems.includes(item.bar_code)
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                          }`}
                      >
                        <TableCell className="text-slate-800 font-medium p-3">
                          {index + 1}
                        </TableCell>

                        {/* Shtrix kod raqami */}
                        <TableCell className="p-3 text-center">
                          {item.bar_code && (
                            <p className="text-xs text-slate-600 mt-1 select-none">
                              {item.bar_code}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="w-12 h-6 bg-slate-100 border border-slate-300 rounded flex items-center justify-center">
                            <div
                              className="w-12 h-6 bg-slate-100 border border-slate-300 rounded flex items-center justify-center"
                              onClick={() => {
                                setOpenBarCodeModal(item.bar_code)
                              }}
                            >
                              <div className="w-8 h-3 bg-slate-300 rounded-sm flex items-center justify-center cursor-pointer">
                                {item.bar_code ? (
                                  <Barcode
                                    value={item.bar_code}
                                    className="w-8 h-8"
                                  />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <span className="text-[#1E56A0] font-semibold hover:text-[#1E56A0]/80 transition-colors cursor-pointer text-sm">
                            {item.product.name}
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs p-3">
                          <div
                            className="text-sm text-slate-800 truncate"
                            title={item.model.name}
                          >
                            {item.model.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm p-3">
                          {documentData.date?.split("T")[0]}
                        </TableCell>
                        <TableCell className="text-slate-700 text-sm p-3">
                          {item.size.name}
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="flex items-center gap-1">
                            <span className="text-slate-500 text-sm">
                              {item.quantity.toLocaleString()}
                            </span>
                            <span className="text-sm text-slate-500">
                              {item.unit.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-800 font-medium text-sm p-3">
                          {item.price.toLocaleString()}
                        </TableCell>
                        <TableCell className="p-3">
                          <div className="text-right">
                            <div className="text-slate-800 font-semibold text-sm">
                              {(item.price * item.quantity).toLocaleString()} UZS
                            </div>
                          </div>
                        </TableCell>
                        {!documentData?.is_approved && (
                          <TableCell className="p-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-8 h-8 p-0 text-red-500 hover:text-red-600 transition-opacity hover:bg-red-50"
                              onClick={() => {
                                if (!documentData) return;
                                const filtered = documentData.products.filter((_, i) => i !== index);
                                setDocumentData({ ...documentData, products: filtered });
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Summary */}
              <div className="mt-6 bg-gradient-to-r from-slate-50 to-slate-100/50 rounded-lg p-6 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-sm text-slate-600 font-medium">
                      Jami tovarlar soni
                    </div>
                    <div className="text-2xl font-bold text-slate-900">
                      {documentData?.products.length} ta
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-slate-600 font-medium">
                      Jami summa
                    </div>
                    <div className="text-2xl font-bold text-[#1E56A0]">
                      {documentData?.products.reduce((acc, item) => acc + item.price * item.quantity, 0)?.toLocaleString()} UZS
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Footer Actions */}
          <div className="bg-white border-t border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  className={`px-3 py-1 border  ${documentData?.is_approved
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                    : "bg-amber-100 text-amber-700 border-amber-200"
                    }`}
                >
                  {documentData?.is_approved ? "Tasdiqlangan" : "Tasdiqlanmagan"}
                </Badge>
              </div>

              {/* Faqat Tasdiqlanmagan bo‘lsa tugmalar ko‘rinadi */}
              {!documentData?.is_approved && (
                <div className="flex items-center gap-3 ">
                  <Button
                    className="bg-emerald-400 hover:bg-emerald-400/70 text-white gap-2 cursor-pointer"
                    onClick={handleApproveInput}
                  >
                    <CircleCheckBig className="w-4 h-4" />
                    Tasdiqlash
                  </Button>

                  <Button
                    className={`${dataChanged
                      ? "bg-[#1E56A0] hover:bg-[#1E56A0]/90"
                      : "bg-gray-400"
                      } text-white gap-2 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
                    disabled={!dataChanged || saving}
                    onClick={handleUpdateWriteOff}
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                  </Button>

                  <Button
                    className="bg-red-400 hover:bg-red-400/70 text-white gap-2 cursor-pointer"
                    onClick={() => setAlertDialog(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    O‘chirish
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 bg-white border-l border-slate-200 flex flex-col shadow-sm animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-slate-800">Chat</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <div className="text-center text-slate-500 mt-8">
                <MessageCircle className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                <p className="text-sm">Chat hali boshlanmagan</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200">
              <div className="flex gap-2">
                <Input
                  placeholder="Xabar yozing..."
                  className="flex-1 text-sm border-slate-200 focus:border-[#1E56A0] focus:ring-1 focus:ring-[#1E56A0]/20"
                />
                <Button
                  size="sm"
                  className="bg-[#1E56A0] hover:bg-[#1E56A0]/90 transition-colors"
                >
                  Yuborish
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {alertDialog && (
        <DeleteAlertDialog
          title="Ushbu tovarlar kirimini o'chirmoqchimisiz?"
          message="O'chirishni tasdiqlash uchun 'Tasdiqlash' tugmasini bosing. Agar bekor qilmoqchi bo'lsangiz, 'Bekor qilish' tugmasini bosing."
          confirmText="Tasdiqlash"
          cancelText="Bekor qilish"
          destructive
          onConfirm={() => handleDeleteProductInput(documentNumber + "")}
          onCancel={() => setAlertDialog(false)}
        />
      )}

      {openSelectRemaindersModal && (
        <SelectRemainsModal
          remainders={remainders}
          setSelectedRemaindersList={setSelectedRemaindersList}
          selectedRemaindersList={selectedRemaindersList}
          onClose={() => setOpenSelectRemaindersModal(false)}
        />
      )}

      {openBarCodeModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOpenBarCodeModal("")}>
          <div className="bg-white p-6 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 text-3xl right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setOpenBarCodeModal("")}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Shtrix kod</h2>
            {documentData?.products.length ? (
              <Barcode
                value={openBarCodeModal}
                format="CODE128"
                width={3}
                height={150}
              />
            ) : (
              <p className="text-sm text-slate-500">Shtrix kod mavjud emas.</p>
            )}
          </div>
        </div>
      )}
    </>


  )
}



export default ProductOutDetailPage;
