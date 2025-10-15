/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  X,
  Printer,
  Barcode as Barco,
  Save,
  MessageCircle,
  Search,
  RefreshCcw,
  CircleCheckBig,
  Trash,
  Plus,
  Trash2,
} from "lucide-react";
import Barcode from "react-barcode";
import { Button } from "@/components/UI/button";
import { Input } from "@/components/UI/input";
import { Label } from "@/components/UI/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/UI/table";
import { Badge } from "@/components/UI/badge";
import { axiosAPI } from "@/services/axiosAPI";
import { useNavigate, useParams } from "react-router-dom";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker, Select } from "antd";
import dayjs from "dayjs";
import DeleteAlertDialog from "@/components/DeleteAlertDialog";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import {
  removeFromListByID,
  setProductModels,
  setProducts,
  setProductSizes,
  setProductTypes,
} from "@/store/productSlice/productSlice";
import {
  setCounterParties,
  setDistricts,
  setRegions,
  setResponsiblePersons,
  setTypesOfGoods,
  setWarehouses,
} from "@/store/infoSlice/infoSlice";
import { useAppSelector } from "@/store/hooks/hooks";
// import PrintPage from "../ProductIn/PrintPage";
// import PrintPage from "./pages/Products/ProductIn/PrintPage";
// import PrintPage from "../PrintPage";
import PrintPage from "./PrintPage";


const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

interface ProductItem {
  row_number: number;
  bar_code: string;
  product_code: string;
  product: { id: string; name: string };
  model: { id: string; name: string };
  product_type: { id: string; name: string };
  size: { id: string; name: string };
  date_party: string;
  price: number;
  quantity: number;
  unit: { id: string; name: string };
  summa: number;
}

interface IDocumentData {
  id: string;
  counterparty: { id: string; name: string };
  date: string;
  is_approved: boolean;
  number: string;
  products: ProductItem[];
  responsible_person: { id: string; name: string };
  type_goods: { id: string; name: string };
  warehouse: { id: string; name: string };
  region: { id: string; name: string };
}

interface IWarehouse {
  id: string;
  name: string;
}
interface ICounterParty {
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

const defaultProduct: ProductItem = {
  row_number: 0,
  bar_code: "",
  product_code: "",
  product: { id: "", name: "" },
  model: { id: "", name: "" },
  product_type: { id: "", name: "" },
  size: { id: "", name: "" },
  date_party: "",
  price: 0,
  quantity: 0,
  unit: { id: "", name: "" },
  summa: 0,
};

const ProductInputDetailPage: React.FC = () => {

  const [showPrint, setShowPrint] = useState(false);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [documentData, setDocumentData] = useState<IDocumentData | null>({
    id: "",
    counterparty: { id: "", name: "" },
    date: "",
    is_approved: false,
    number: "",
    products: [],
    responsible_person: { id: "", name: "" },
    type_goods: { id: "", name: "" },
    warehouse: { id: "", name: "" },
    region: { id: "", name: "" },
  });
  const [mockData, setMockData] = useState<IDocumentData | null>(null);
  const [dataChanged, setDataChanged] = useState(false);
  const [openBarCodeModal, setOpenBarCodeModal] = useState("");
  const [alertDialog, setAlertDialog] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();

  // Store data
  const { products, product_types, product_models, product_sizes } =
    useAppSelector((state) => state.product);
  const {
    regions,
    districts,
    warehouses,
    counterparties,
    typesOfGoods,
    responsible_person: responsiblePersons,
  } = useAppSelector((state) => state.info);

  const totalAmount = documentData?.products.reduce(
    (sum, item) => sum + item.summa,
    0
  );


  // API: Header lists
  const getRegionsList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("regions/list/?order_by=2");
      if (response.status === 200) {
        dispatch(setRegions(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getDistrictsList = useCallback(async () => {
    try {
      // if region is needed here, use documentData?.region.id
      const regionId = documentData?.region.id ?? "";
      if (!regionId) return;
      const response = await axiosAPI.get(`districts/list/?region=${regionId}&order_by=2`);
      if (response.status === 200) dispatch(setDistricts(response.data));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, documentData?.region.id]);

  const getWarehousesList = useCallback(async () => {
    // Uses region and district if available, else fetch all
    try {
      const regionId = documentData?.region.id ?? "";
      const districtId = districts.find(() => true)?.id ?? ""; // fallback
      const url =
        regionId && districtId
          ? `warehouses/list/?region=${regionId}&district=${districtId}`
          : `warehouses/list/`;
      const response = await axiosAPI.get(url);
      if (response.status === 200) {
        dispatch(setWarehouses(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, documentData?.region.id, districts]);

  const getCounterPartiesList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("counterparties/list");
      if (response.status === 200) {
        dispatch(setCounterParties(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getTypeOfGoodsList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("type_input/ ");
      if (response.status === 200) {
        dispatch(setTypesOfGoods(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getResponsiblePersonList = useCallback(async () => {
    const whId = documentData?.warehouse.id ?? "";
    try {
      if (!whId) {
        dispatch(setResponsiblePersons([]));
        return;
      }
      const response = await axiosAPI.get(
        `warehouses/responsible_person/${whId}`
      );
      if (response.status === 200) {
        const list: IResponsiblePerson[] = response.data;
        dispatch(setResponsiblePersons(list));
        // Auto-select if only one in list
        if (list.length === 1) {
          setDocumentData((prev) =>
            prev
              ? {
                ...prev,
                responsible_person: { id: list[0].id, name: list[0].name },
              }
              : prev
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, documentData?.warehouse.id]);

  // API: Detail
  // const getInputProductsDetail = useCallback(async () => {
  //   try {
  //     const response = await axiosAPI.get(`/receipts/detail/${id}`);
  //     if (response.status === 200) {
  //       const doc: IDocumentData = response.data[0];
  //       setDocumentData(doc);
  //       setMockData(doc);
  //       setSelectedItems([]);
  //       setDataChanged(false);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, [id]);

  const getInputProductsDetail = useCallback(async () => {
    try {
      setIsRefreshing(true); // animatsiyani yoqamiz
      const response = await axiosAPI.get(`/receipts/detail/${id}`);

      if (response.status === 200) {
        const doc = response.data[0];
        setDocumentData(doc);
        setMockData(doc);
        setSelectedItems([]);
        setDataChanged(false);
        console.log("✅ Ma'lumot yangilandi:", doc);
      }
    } catch (error) {
      console.error("❌ API error:", error);
    } finally {
      // 0.8 sekunddan so‘ng animatsiyani o‘chir
      setTimeout(() => setIsRefreshing(false), 800);
    }
  }, [id]);

  // API: Delete
  const handleDeleteProductInput = async (inputID: string) => {
    try {
      const response = await axiosAPI.delete(`/receipts/delete/${inputID}`);
      if (response.status === 200) {
        setDocumentData(null);
        dispatch(removeFromListByID(inputID));
        toast("Kirim muvaffaqiyatli o'chirildi", { type: "success" });
        navigate(-1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // API: Update (Edit)
  const handleUpdateReceipt = async () => {
    if (!documentData) return;
    setSaving(true);
    try {
      const payload = {
        id: documentData.id,
        date: dayjs(documentData.date).format(DATE_FORMAT),
        is_approved: documentData.is_approved,
        number: documentData.number,
        counterparty: documentData.counterparty.id,
        responsible_person: documentData.responsible_person.id,
        type_goods: documentData.type_goods.id,
        warehouse: documentData.warehouse.id,
        region: documentData.region.id,
        products: documentData.products.map((p, idx) => ({
          row_number: p.row_number || idx + 1,
          bar_code: p.bar_code,
          product_code: p.product_code,
          product: p.product.id,
          model: p.model.id,
          product_type: p.product_type.id,
          size: p.size.id,
          date_party: p.date_party
            ? dayjs(p.date_party).format(DATE_FORMAT)
            : "",
          price: p.price,
          quantity: p.quantity,
          unit: p.unit.id,
          summa: p.price * p.quantity,
        })),
      };

      const response = await axiosAPI.post(
        `receipts/update/${documentData.id}`,
        payload
      );
      if (response.status === 200) {
        toast("O'zgarishlar saqlandi", { type: "success" });
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

  // Handle generate barcode
  const handleGenerateBarcode = async (data: {
    region: string;
    products: { product_code: string; row_number: number }[];
  }) => {
    if (data.products.length > 0) {
      try {
        const response = await axiosAPI.post("receipts/bar_codes", data);
        if (response.status === 200) {
          toast(
            "Shtrix kod muvofaqqiyatli yaratildi. Saqlash uchun pastdagi 'Saqlash' tugmasini bosing",
            {
              type: "success",
              autoClose: 8000,
            }
          );
          const updatedProducts = documentData?.products.map((prod) => {
            const matchedBarcode = response.data.find(
              (bc: {
                product_code: string;
                row_number: number;
                bar_code: string;
              }) =>
                bc.product_code === prod.product_code &&
                bc.row_number === prod.row_number
            );
            return matchedBarcode
              ? { ...prod, bar_code: matchedBarcode.bar_code }
              : prod;
          });
          setDocumentData((prev) => {
            return prev ? { ...prev, products: updatedProducts || [] } : prev;
          });
          setDataChanged(true);
        }
      } catch (error: any) {
        console.log(error);
        toast(error.response.data.error, { type: "error" });
      }
    } else {
      toast("Hujjatda hech qanday mahsulot yo'q", { type: "warning" });
    }
    if (data.region === "") {
      toast("Hudud tanlanmagan", { type: "warning" });
    }
  };

  // API - Products
  const getProductsList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("products/list");
      if (response.status === 200) dispatch(setProducts(response.data.results));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getProductTypesList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("product_types/list");
      if (response.status === 200) dispatch(setProductTypes(response.data));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getProductModelsList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("models/list");
      if (response.status === 200) dispatch(setProductModels(response.data));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getProductSizesList = useCallback(async () => {
    try {
      const response = await axiosAPI.get("sizes/list");
      if (response.status === 200) dispatch(setProductSizes(response.data));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Handle approve input product
  const handleApproveInput = async () => {
    if (!documentData) return;
    setSaving(true);
    try {
      const response = await axiosAPI.post(
        `/receipts/confirmation/${documentData.id}`
      );
      if (response.status === 200) {
        toast("Kirim hujjati muvaffaqiyatli tasdiqlandi", { type: "success" });
        setMockData(documentData);
        setDataChanged(false);
      }
    } catch (error) {
      console.log(error);
      toast("Tasdiqlashda xatolik yuz berdi", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (documentData && documentData.products) {
      setLocalProducts(documentData.products);
    }
  }, [documentData]);

  useEffect(() => {
    console.log("localProducts:", localProducts);
  }, [localProducts]);

  // Effects
  useEffect(() => {
    getInputProductsDetail();
  }, [id, getInputProductsDetail]);

  useEffect(() => {
    if (regions.length === 0) getRegionsList();
  }, [regions.length, getRegionsList]);

  useEffect(() => {
    getDistrictsList();
  }, [getDistrictsList]);

  useEffect(() => {
    getWarehousesList();
  }, [getWarehousesList]);

  useEffect(() => {
    getCounterPartiesList();
  }, [getCounterPartiesList]);

  useEffect(() => {
    getTypeOfGoodsList();
  }, [getTypeOfGoodsList]);

  // Refresh responsible persons when warehouse changes
  useEffect(() => {
    getResponsiblePersonList();
  }, [getResponsiblePersonList]);

  useEffect(() => {
    if (products.length === 0) getProductsList();
    if (product_types.length === 0) getProductTypesList();
    if (product_models.length === 0) getProductModelsList();
    if (product_sizes.length === 0) getProductSizesList();
  }, [
    getProductsList,
    getProductTypesList,
    getProductModelsList,
    getProductSizesList,
    products.length,
    product_types.length,
    product_models.length,
    product_sizes.length,
  ]);

  // Detect changes
  useEffect(() => {
    const changed = JSON.stringify(documentData) !== JSON.stringify(mockData);
    setDataChanged(changed);
  }, [documentData, mockData]);

  // Helpers
  const updateHeaderField = <K extends keyof IDocumentData>(
    key: K,
    value: any
  ) => {
    setDocumentData((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const updateProductField = (
    index: number,
    updater: (prod: ProductItem) => ProductItem
  ) => {
    setDocumentData((prev) => {
      if (!prev) return prev;
      const nextProducts = prev.products.map((p, i) =>
        i === index ? updater({ ...p }) : p
      );
      return { ...prev, products: nextProducts };
    });
  };

  const recalcSum = (product: ProductItem) => {
    product.summa =
      (Number(product.price) || 0) * (Number(product.quantity) || 0);
    return product;
  };

  const handleDeleteProduct = (index: number) => {
    setDocumentData((prev) => {
      if (!prev) return prev;
      const nextProducts = prev.products.filter((_, i) => i !== index);
      return { ...prev, products: nextProducts };
    });
  };

  // Ensure current doc's warehouse appears as an option even if list is filtered
  const warehouseOptions: IWarehouse[] = useMemo(() => {
    const list = [...warehouses];
    if (
      documentData?.warehouse.id &&
      !list.some((w) => w.id === documentData.warehouse.id)
    ) {
      list.unshift({
        id: documentData.warehouse.id,
        name: documentData.warehouse.name,
        number: 0,
        region: "",
        district: "",
        for_district: false,
        for_central: false,
      });
    }
    return list;
  }, [warehouses, documentData?.warehouse.id, documentData?.warehouse.name]);

  return (
    <>
      <div className="bg-slate-50 flex animate-in fade-in duration-500">
        {/* Main Content */}
        <div className="w-full flex flex-col">
          {/* Header */}
          <div className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    Tovarlar kirimi {documentData?.number} dan{" "}
                    {documentData?.date
                      ? documentData.date.split("T").join(" | ")
                      : ""}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Tovarlar kirimi hujjati tafsilotlari
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Yonida Tasdiqlandi yozuvi */}
                {documentData?.is_approved ? (
                  <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 border border-emerald-200">
                    Tasdiqlangan
                  </Badge>
                ) : dataChanged ? (
                  <Badge className="bg-amber-100 text-amber-700 px-3 py-1 border border-amber-200">
                    O'zgartirishlar kiritildi
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 px-3 py-1 border border-slate-200">
                    Tasdiqlanmagan
                  </Badge>
                )}
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={getInputProductsDetail}
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105 active:scale-95"
                >
                  <RefreshCcw
                    id="refreshIcon"
                    className="w-4 h-4 mr-1 transition-transform duration-1000"
                  />
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
                  onClick={getInputProductsDetail}
                  disabled={isRefreshing} // bosib turganda disable qilamiz
                  className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all border bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 border-slate-300 text-slate-700 hover:border-slate-400 shadow-sm hover:shadow-md duration-300 transform hover:scale-105 active:scale-95"
                >
                  <RefreshCcw
                    id="refreshIcon"
                    className={`w-4 h-4 mr-1 transition-transform duration-700 ${isRefreshing ? "rotate-180" : ""
                      }`}
                  />
                  {isRefreshing ? "Yangilanmoqda..." : "Yangilash"}
                </Button>

              </div>

            </div>
          </div>

          {/* Document Information - Editable */}
          <div className="bg-white border-b border-slate-200 mb-2">
            <Accordion defaultExpanded>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
              >
                <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Hujjati tafsilotlari</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {/* Number */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Hujjat №
                    </Label>
                    <Input
                      disabled
                      value={documentData?.number || ""}
                      onChange={(e) =>
                        updateHeaderField("number", e.target.value)
                      }
                      className="h-9 text-sm border-slate-200 focus:border-[#1E56A0] focus:ring-1 focus:ring-[#1E56A0]/20 transition-all"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Sana
                    </Label>
                    <DatePicker
                      disabled={documentData?.is_approved}
                      value={
                        documentData?.date
                          ? dayjs(documentData.date)
                          : undefined
                      }
                      showTime={{ format: "HH:mm:ss" }}
                      format={DATE_FORMAT}
                      onChange={(value) =>
                        updateHeaderField(
                          "date",
                          value ? value.format(DATE_FORMAT) : ""
                        )
                      }
                      className="h-9 text-sm w-full border-slate-200 focus:border-[#1E56A0] focus:ring-1 focus:ring-[#1E56A0]/20 transition-all"
                    />
                  </div>

                  {/* Region (Select) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Viloyat
                    </Label>
                    <Select
                      disabled={documentData?.is_approved}
                      value={documentData?.region.id || undefined}
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

                  {/* Warehouse (Select) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Ombor
                    </Label>
                    <Select
                      disabled={documentData?.is_approved}
                      value={documentData?.warehouse.id || undefined}
                      onChange={(value: string) => {
                        const w = warehouseOptions.find(
                          (wh) => wh.id === value
                        );
                        updateHeaderField("warehouse", {
                          id: value,
                          name: w?.name || "",
                        });
                        // Reset and refetch responsible persons
                        updateHeaderField("responsible_person", {
                          id: "",
                          name: "",
                        });
                      }}
                      onDropdownVisibleChange={(open) => {
                        if (open) getWarehousesList();
                      }}
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                      options={warehouseOptions.map((w) => ({
                        value: w.id,
                        label: w.name,
                      }))}
                      placeholder="Omborni tanlang"
                    />
                  </div>

                  {/* Counterparty (Select) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Kontragent
                    </Label>
                    <Select
                      disabled={documentData?.is_approved}
                      value={documentData?.counterparty.id || undefined}
                      onChange={(value: string) => {
                        const c = counterparties.find(
                          (cp: { id: string }) => cp.id === value
                        );
                        updateHeaderField("counterparty", {
                          id: value,
                          name: c?.name || "",
                        });
                      }}
                      onDropdownVisibleChange={(open) => {
                        if (open) getCounterPartiesList();
                      }}
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                      options={counterparties.map((c: ICounterParty) => ({
                        value: c.id,
                        label: c.name,
                      }))}
                      placeholder="Kontragent tanlang"
                    />
                  </div>

                  {/* Responsible Person (Select) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      M.J.Sh
                    </Label>
                    <Select
                      disabled={
                        documentData?.is_approved || !documentData?.warehouse.id
                      }
                      value={documentData?.responsible_person.id || undefined}
                      onChange={(value: string) => {
                        const r = responsiblePersons.find(
                          (rp: { id: string }) => rp.id === value
                        );
                        updateHeaderField("responsible_person", {
                          id: value,
                          name: r?.name || "",
                        });
                      }}
                      onDropdownVisibleChange={(open) => {
                        if (open) getResponsiblePersonList();
                      }}
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                      options={responsiblePersons.map(
                        (r: IResponsiblePerson) => ({
                          value: r.id,
                          label: r.name,
                        })
                      )}
                      placeholder="Mas'ul shaxsni tanlang"
                    />
                  </div>

                  {/* Type of goods (Select) */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-slate-600 tracking-wide">
                      Tovar kirim turi
                    </Label>
                    <Select
                      disabled={documentData?.is_approved}
                      value={documentData?.type_goods?.name || undefined}
                      onChange={(value: string) => {
                        const t = typesOfGoods.find((tg) => tg.id === value);
                        updateHeaderField("type_goods", {
                          id: value,
                          name: t?.name || "",
                        });
                      }}
                      onDropdownVisibleChange={(open) => {
                        if (open) getTypeOfGoodsList();
                      }}
                      className="w-full"
                      showSearch
                      optionFilterProp="label"
                      options={typesOfGoods.map((t: ITypeOfGoods) => ({
                        value: t.id,
                        label: t.name,
                      }))}
                      placeholder="Kirim turini tanlang"
                    />

                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          </div>

          {/* Action Buttons Bar */}
          <div className="bg-white border-b border-slate-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* Add product */}
                {!documentData?.is_approved && (
                  <Button
                    size="sm"
                    className="gap-2 bg-[#1E56A0] hover:bg-[#1E56A0]/90 text-white"
                    onClick={() => {
                      setDocumentData((prev) =>
                        prev
                          ? {
                            ...prev,
                            products: [
                              {
                                ...defaultProduct,
                                row_number: prev.products.length + 1,
                              },
                              ...prev.products,
                            ],
                          }
                          : prev
                      );
                    }}
                    disabled={documentData?.is_approved}
                  >
                    <Plus className="w-4 h-4" />
                    Tovar qo'shish
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={documentData?.is_approved}
                  className="gap-2 border-slate-200 
             disabled:bg-slate-200 disabled:text-slate-500 
             disabled:cursor-not-allowed disabled:hover:bg-slate-200"
                  onClick={() => {
                    handleGenerateBarcode({
                      region: documentData?.region?.id || "",
                      products:
                        documentData?.products?.map((p) => ({
                          product_code: p.product_code,
                          row_number: p.row_number,
                        })) || [],
                    });
                  }}
                >
                  <Barco className="w-4 h-4" />
                  Shtrix kod
                </Button>

                <Button
                  onClick={() => setShowPrint(true)}
                  variant="outline"
                  size="sm"
                  className="gap-2 border-slate-200"
                >
                  <Printer className="w-4 h-4" />
                  Chop etish
                </Button>

              </div>

              {showPrint && (
                <PrintPage
                  products={localProducts}
                  onClose={() => setShowPrint(false)}
                />
              )}

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Qidirish (Ctrl+F)"
                    className="w-64 h-8 pl-9 text-sm border-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="min-h-[40vh] bg-white">
            <div className="p-6">

              {/* Products Table (Editable) */}
              <div className="border border-slate-200 rounded-lg shadow-sm overflow-x-auto overflow-y-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="p-3 text-center">№</TableHead>
                      <TableHead className="p-3 text-center">
                        Shtrix kod raqam
                      </TableHead>
                      <TableHead className="p-3 text-center">
                        Shtrix kod
                      </TableHead>
                      <TableHead className="p-3 text-center">
                        Tovar kodi
                      </TableHead>
                      <TableHead className="p-3 text-center">
                        Tovar nomi
                      </TableHead>
                      <TableHead className="p-3 text-center">
                        Tovar turi
                      </TableHead>
                      <TableHead className="p-3 text-center">Model</TableHead>
                      <TableHead className="p-3 text-center">O‘lcham</TableHead>
                      <TableHead className="p-3 text-center">
                        Partiya sanasi
                      </TableHead>
                      <TableHead className="p-3 text-center">Soni</TableHead>
                      <TableHead className="p-3 text-center">Narx</TableHead>
                      <TableHead className="p-3 text-center">Summa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(documentData?.products) && documentData.products.map((item, index) => (
                      <TableRow
                        key={index}
                        className={`hover:bg-slate-50 transition-colors group ${selectedItems.includes(item.product_code)
                          ? "bg-blue-50 border-l-4 border-l-blue-500"
                          : ""
                          }`}
                      >

                        <TableCell className="p-3 text-center">
                          {index + 1}
                        </TableCell>

                        <TableCell className="p-3 text-center">
                          {/* Shtrix kod raqami */}
                          {item.bar_code && (
                            <p className="text-xs text-slate-600 mt-1 select-none">
                              {item.bar_code}
                            </p>
                          )}
                        </TableCell>


                        {/* Barcode */}
                        <TableCell className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">

                            <div
                              className="w-12 h-6 bg-slate-100 border border-slate-300 rounded flex items-center justify-center"
                              onClick={() => setOpenBarCodeModal(item.bar_code || "")}
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

                        {/* Product code */}
                        <TableCell className="p-3 text-center">
                          <Input
                            disabled
                            value={item.product_code}
                            className="h-8 text-sm w-40 border-slate-200"
                            placeholder="Tovar kodi"
                          />
                        </TableCell>

                        {/* Product name */}
                        <TableCell className="p-3 text-center">
                          <Select
                            disabled={documentData?.is_approved}
                            value={item.product?.name || ""}
                            placeholder="Tovar tanlang"
                            className="min-w-[150px] max-w-[250px]"
                            onChange={(value) => {
                              const selected = products.find(p => p.id === value);
                              updateProductField(index, (p) => {
                                p.product = { id: value, name: selected?.name || "" };
                                return p;
                              });
                            }}
                          >
                            {products?.map((product) => (
                              <Select.Option key={product.id} value={product.id}>
                                {product.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </TableCell>


                        {/* Product type */}
                        <TableCell className="p-3 text-center">
                          <Select
                            disabled={documentData?.is_approved}
                            value={item.product_type?.name || ""}  // ✅ id ishlatamiz
                            placeholder="Tovar turini tanlang"
                            className="min-w-[150px]"
                            onChange={(value: string) => {
                              const selected = product_types.find((t) => t.id === value);
                              updateProductField(index, (p) => {
                                p.product_type = selected
                                  ? { id: selected.id, name: selected.name }
                                  : { id: value, name: "" };
                                return p;
                              });
                            }}
                          >
                            {product_types.map((type) => (
                              <Select.Option key={type.id} value={type.id}>
                                {type.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </TableCell>

                        {/* Model */}
                        <TableCell className="p-3 text-center">
                          <Select
                            disabled={documentData?.is_approved}
                            value={item.model?.id || ""} // ✅ id ishlatyapmiz
                            placeholder="Model tanlang"
                            className="min-w-[150px]"
                            onChange={(value: string) => {
                              const selected = product_models.find((m) => m.id === value);
                              updateProductField(index, (p) => {
                                p.model = selected
                                  ? { id: selected.id, name: selected.name }
                                  : { id: value, name: "" };
                                return p;
                              });
                            }}
                          >
                            {product_models.map((model) => (
                              <Select.Option key={model.id} value={model.id}>
                                {model.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </TableCell>

                        {/* O‘lcham */}
                        <TableCell className="p-3 text-center">
                          <Select
                            disabled={documentData?.is_approved}
                            value={item.size?.id || ""} // ✅ id ishlatyapmiz
                            placeholder="O‘lcham"
                            className="min-w-[120px]"
                            onChange={(value: string) => {
                              const selected = product_sizes.find((s) => s.id === value);
                              updateProductField(index, (p) => {
                                p.size = selected
                                  ? { id: selected.id, name: selected.name }
                                  : { id: value, name: "" };
                                return p;
                              });
                            }}
                          >
                            {product_sizes.map((size) => (
                              <Select.Option key={size.id} value={size.id}>
                                {size.name}
                              </Select.Option>
                            ))}
                          </Select>
                        </TableCell>

                        {/* Date party */}
                        <TableCell className="p-3 text-center">
                          <DatePicker
                            disabled={documentData?.is_approved}
                            value={
                              item.date_party
                                ? dayjs(item.date_party)
                                : undefined
                            }
                            showTime={{ format: "HH:mm:ss" }}
                            format={DATE_FORMAT}
                            onChange={(val) =>
                              updateProductField(index, (p) => {
                                p.date_party = val
                                  ? val.format(DATE_FORMAT)
                                  : "";
                                return p;
                              })
                            }
                            className="h-8 text-sm w-56"
                          />
                        </TableCell>

                        {/* Quantity */}
                        <TableCell className="p-3 text-center">
                          <Input
                            type="number"
                            disabled={documentData?.is_approved}
                            value={item.quantity}
                            onChange={(e) =>
                              updateProductField(index, (p) => {
                                p.quantity = Number(e.target.value || 0);
                                return recalcSum(p);
                              })
                            }
                            className="h-8 text-sm w-28 bg-white border-slate-200"
                            min={0}
                            placeholder="Soni"
                          />
                        </TableCell>

                        {/* Price */}
                        <TableCell className="p-3 text-center">
                          <Input
                            type="number"
                            disabled={documentData?.is_approved}
                            value={item.price}
                            onChange={(e) =>
                              updateProductField(index, (p) => {
                                p.price = Number(e.target.value || 0);
                                return recalcSum(p);
                              })
                            }
                            className="h-8 text-sm w-32 bg-white border-slate-200"
                            min={0}
                            placeholder="Narx"
                          />
                        </TableCell>

                        {/* Summa */}
                        <TableCell className="text-slate-800 font-medium text-sm p-3 text-center">
                          <div className="text-right">
                            <div className="text-slate-800 font-semibold text-sm">
                              {(item.summa || 0).toLocaleString()} UZS
                            </div>
                          </div>
                        </TableCell>

                        {/* Delete button */}
                        {!documentData?.is_approved && (
                          <TableCell className="p-3 text-center">
                            <Button className="bg-red-500 hover:bg-red-400"
                              onClick={() => handleDeleteProduct(index)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>)}
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
                      {documentData?.products.length || 0} ta
                    </div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-slate-600 font-medium">
                      Jami summa
                    </div>
                    <div className="text-2xl font-bold text-[#1E56A0]">
                      {(totalAmount || 0).toLocaleString()} UZS
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
                {documentData?.is_approved ? (
                  <Badge className="bg-emerald-100 text-emerald-700 px-3 py-1 border border-emerald-200">
                    Tasdiqlangan
                  </Badge>
                ) : dataChanged ? (
                  <Badge className="bg-amber-100 text-amber-700 px-3 py-1 border border-amber-200">
                    O'zgartirishlar kiritildi
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700 px-3 py-1 border border-slate-200">
                    Tasdiqlanmagan
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3">
                {!documentData?.is_approved && (
                  <>
                    <Button
                      className="bg-emerald-400 hover:bg-emerald-400/70 text-white gap-2"
                      onClick={handleApproveInput}
                    >
                      <CircleCheckBig className="w-4 h-4" />
                      Tasdiqlash
                    </Button>
                    <Button
                      className="bg-[#1E56A0] hover:bg-[#1E56A0]/90 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleUpdateReceipt}
                      disabled={!dataChanged || saving}
                    >
                      <Save className="w-4 h-4" />
                      {saving ? "Saqlanmoqda..." : "Saqlash"}
                    </Button>
                    <Button
                      className="bg-red-400 hover:bg-red-400/70 text-white gap-2"
                      onClick={() => setAlertDialog(true)}
                    >
                      <Trash className="w-4 h-4" />
                      O'chirish
                    </Button>

                  </>
                )}
              </div>
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

      {openBarCodeModal && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOpenBarCodeModal("")}>
          <div className="bg-white p-6 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
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
                displayValue={true}
              />
            ) : (
              <p className="text-sm text-slate-500">Shtrix kod mavjud emas.</p>
            )}
          </div>
        </div>
      )}

      {alertDialog && (
        <DeleteAlertDialog
          title="Ushbu tovarlar kirimini o'chirmoqchimisiz?"
          message="O'chirishni tasdiqlash uchun 'Tasdiqlash' tugmasini bosing. Agar bekor qilmoqchi bo'lsangiz, 'Bekor qilish' tugmasini bosing."
          confirmText="Tasdiqlash"
          cancelText="Bekor qilish"
          destructive
          onConfirm={() => handleDeleteProductInput(id + "")}
          onCancel={() => setAlertDialog(false)}
        />
      )}
    </>
  );
};

export default ProductInputDetailPage;
