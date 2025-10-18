/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import { Button, Input, InputNumber, Popconfirm, Select, message } from "antd";
import { FilePlus2, Pencil, Plus, Trash2 } from "lucide-react";
import { axiosAPI } from "@/services/axiosAPI";
import { useAppSelector } from "@/store/hooks/hooks";
import { DownloadOutlined, EyeOutlined, FileExcelOutlined, FileImageOutlined, FilePdfOutlined, FileTextOutlined, FileWordOutlined } from "@ant-design/icons";
import FieldModal from "@/components/modal/FieldModal";
import FileDropZone from "@/components/FileDropZone";
import TextArea from "antd/es/input/TextArea";
import { toast } from "react-toastify";

// ===== Types =====
type ID = string;

interface ProductRow {
  raw_number: number;
  product: string;
  model: {
    id: string;
    name: string;
    name_uz: string;
    product_type: string;
  };
  product_type: {
    id: string;
    name: string;
    name_uz: string;
  };
  size: {
    id: string;
    name: string;
    name_uz: string;
    product_type: string;
    model: string;
  };
  unit: {
    id: string;
    name: string;
    name_uz: string;
  };
  quantity: number;
  order_type: string;
  description: string;
}

interface FormDataType {
  exit_date: string;
  user: string;
  description: string;
  products: ProductRow[],
  executors: Executors[]
}

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

interface IDistrictOrderFormProps {
  setIsCreateFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setData: React.Dispatch<React.SetStateAction<DocumentInfo[]>>
}

const initialFormData = {
  exit_date: new Date().toISOString().split("T")[0],
  user: "",
  description: "",
  products: [],
  executors: []
}

const defaultProductRow = {
  product: "",
  product_type: { id: "", name: "", name_uz: "" },
  model: { id: "", name: "", name_uz: "", product_type: "" },
  size: { id: "", name: "", name_uz: "", product_type: "", model: "" },
  unit: { id: "", name: "", name_uz: "" },
  quantity: 1,
  order_type: "",
  description: "",
}

const CREATE_ENDPOINT = "/region-orders/create/";

type Executors = { id: string; name: string; number: number; position: string; region: string; district: string; executor_type:string;};

const OrderWIndow: React.FC<IDistrictOrderFormProps> = ({ setIsCreateFormModalOpen, setData }) => {
  // FormData
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  // yuqoriga qo'shing
  type FieldName = "product_type" | "model" | "size" | "unit" | "product";
  const [active, setActive] = useState<{ field: FieldName; row: number } | null>(null);
  const [documentID, setDocumentID] = useState("");

  // Employee
  const [employees, setEmployees] = useState<any[]>([]);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  // Document is Confirmed state
  const [documentNumber, setDocumentNumber] = useState("");
  const [documentConfirmed, setDocumentConfirmed] = useState(false);
  // Files
  const [files, setFiles] = useState<FileData[]>([]);
  const [messageFileURL, setMessageFileURL] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileUploadModal, setFileUploadModal] = useState(false);
  const [documentTypes, setDocumentTypes] = useState<IDimension[]>([]);
  const [documentFormData, setDocumentFormData] = useState<{
    selectedDocumentType: string;
    filename: string;
    extension: string;
    fileBinary: string;
  }>();
  // Redux
  const { currentUserInfo } = useAppSelector(state => state.info);
  const { order_types } = useAppSelector(state => state.product);
  const [executorType, setexecutorType] = useState<any[]>([]);
  
  console.log(order_types)


  const handleView = async (f: FileData) => {
    try {
      const docId = documentID;
      if (!docId) {
        toast("Hujjat aniqlanmadi.", { type: "error" });
        return;
      }
      // For others, fetch as blob and open in a new tab
      const res = await axiosAPI.get(`region-orders/${docId}/file/${f.raw_number}`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
      // Cleanup later
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (e) {
      console.error(e);
      toast("Faylni ko‘rsatib bo‘lmadi.", { type: "error" });
    }
  };

  const handleDownloadFile = async (f: FileData) => {
    try {
      const docId = documentID;
      if (!docId) {
        toast("Hujjat aniqlanmadi.", { type: "error" });
        return;
      }

      const res = await axiosAPI.get(`region-orders/${docId}/file/${f.raw_number}`, {
        responseType: "blob",
      });

      const blob = res.data as Blob;
      const url = URL.createObjectURL(blob);

      const fileName =
        f?.file_name ||
        `file-${String(f.raw_number)}${f?.extension ? `.${f.extension}` : ""}`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (e) {
      console.error(e);
      toast("Yuklab olishda xatolik.", { type: "error" });
    }
  };

  // Row helperlar
  const addRow = () => {
    setFormData(prev => ({ ...prev, products: [...prev.products, { raw_number: prev.products.length + 1, ...defaultProductRow }] }));
  }

  const removeRow = (row_number: string) =>
    setFormData((prev) => ({
      ...prev,
      products: prev.products.filter((r) => r.raw_number !== Number(row_number)),
    }));

  const updateRow = <K extends keyof ProductRow>(
    raw_number: string, // Har bir tovar uchun raw_number unikal
    key: K,
    value: ProductRow[K]
  ) => {
    const updatedProducts = formData.products.map((product) => {
      if (product.raw_number === Number(raw_number)) {
        return { ...product, [key]: value };
      }
      return product;
    });

    setFormData((prev) => ({
      ...prev,
      products: updatedProducts,
    }));
  };

  const getFileIcon = (fileName: any) => {
    const ext = fileName.split(".").pop().toLowerCase();

    switch (ext) {
      case "pdf":
        return { icon: <FilePdfOutlined />, color: "text-red-500", bg: "bg-red-50" };
      case "doc":
      case "docx":
        return { icon: <FileWordOutlined />, color: "text-blue-500", bg: "bg-blue-50" };
      case "xls":
      case "xlsx":
        return { icon: <FileExcelOutlined />, color: "text-green-500", bg: "bg-green-50" };
      case "jpg":
      case "jpeg":
      case "png":
        return { icon: <FileImageOutlined />, color: "text-yellow-500", bg: "bg-yellow-50" };
      default:
        return { icon: <FileTextOutlined />, color: "text-gray-500", bg: "bg-gray-100" };
    }
  };

  // 🔹 Hodimlar ro'yxatini olish
  const fetchEmployees = async () => {
      try {
        const response = await axiosAPI.get("employees/list");
        const type_response = await axiosAPI.get('enumerations/excuter_types');
        
        if (type_response.status === 200 && Array.isArray(type_response.data)) {
          setexecutorType(type_response.data);
        } else {
          setexecutorType([]);
        }
        
        if (response.status === 200 && Array.isArray(response.data.results)) {
          setEmployees(response.data.results);
        } else {
          setEmployees([]);
        }
      } catch (error) {
        console.error("Hodimlarni olishda xatolik:", error);
      }
    };

  // Validatsiya
  const validate = (): string[] => {
    const errs: string[] = [];
    if (!formData.products.length) errs.push("Kamida bitta tovar qatori kerak.")

    formData.products.forEach((r, i) => {
      const n = i + 1;
      if (!r.product?.trim()) errs.push(`#${n}: Tovar tanlanmagan`);
      if (!r.order_type) errs.push(`#${n}: Buyurtma turi tanlanmagan.`);
      if (!r.product_type) errs.push(`#${n}: Tovar turi tanlanmagan.`);
      if (!r.model) errs.push(`#${n}: Model tanlanmagan.`);
      if (!r.size) errs.push(`#${n}: O‘lcham tanlanmagan.`);
      if (!r.unit) errs.push(`#${n}: O‘lchov birligi tanlanmagan.`);
      if (!r.quantity || r.quantity <= 0) errs.push(`#${n}: Soni > 0 bo‘lsin.`);
    });

    return errs;
  };

  const getDistrictOrderFile = async (id: string) => {
    if (id) {
      try {
        const response = await axiosAPI.get(`region-orders/${id}/order-file`);
        if (response.status === 200) {
          setMessageFileURL(response.data.file_url)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

    const handleSaveData = async () => {
    const errors = validate();
    if (errors.length) {
      toast(errors.join("\n"), { type: "error" });
      return;
    }
  
    const userId = currentUserInfo?.id ?? "";
  
    const formattedExecutors = formData.executors.map((ex) => ({
      executor: ex.id,
      executor_type: ex.executor_type, 
    }));
  
    const payload = {
      exit_date: formData.exit_date,
      user: userId,
      description: formData.description || "",
      products: formData.products.map((p) => ({
        row_number: p.raw_number,
        product: p.product,
        model: p.model.id,
        product_type: p.product_type.id,
        size: p.size.id,
        unit: p.unit.id,
        quantity: p.quantity,
        order_type: p.order_type,
        description: p.description || "",
      })),
      executors: formattedExecutors,
    };
  
    try {
      const response = await axiosAPI.post(`/region-orders/update/${documentID}`, payload);
      if (response.status === 200) {
        setData(prev => [...prev, response.data])
        toast("Hujjat muvofaqqiyatli saqlandi", { type: "success" });
        setIsCreateFormModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const formatDate = (iso: string): string => {
    const date = new Date(iso);
    return date.toLocaleString("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

const handleCreateDefaultDocument = useCallback(async () => {
  const userId = currentUserInfo?.id;
  
  const formattedExecutors = formData.executors.map((ex) => ({
    executor: ex.id,
    executor_type: ex.executor_type,
  }));

  const payload = {
    exit_date: formData.exit_date,
    user: userId,
    description: formData.description || "",
    products: formData.products.map((p) => ({
      row_number: p.raw_number,
      product: p.product,
      model: p.model.id,
      product_type: p.product_type.id,
      size: p.size.id,
      unit: p.unit.id,
      quantity: p.quantity,
      order_type: p.order_type,
      description: p.description || "",
    })),
    executors: formattedExecutors, 
  };

  try {
    const response = await axiosAPI.post(CREATE_ENDPOINT, payload);
    const documentData = response.data;
    if (response.status === 200 && documentData.success) {
      console.log(documentData)
      setDocumentConfirmed(false);
      getDistrictOrderFile(documentData.document);
      setDocumentID(documentData.document);
    }
  } catch (error: any) {
    alert(error.response.data);
    setIsCreateFormModalOpen(false);
  }
}, [currentUserInfo?.id, formData.executors, formData.description, formData.exit_date, formData.products, setIsCreateFormModalOpen]);

  const getDocumentTypes = async () => {
    try {
      const response = await axiosAPI.get("enumerations/document_types");
      if (response.status === 200) {
        setDocumentTypes(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Handle file attach
  const handleFileAttach = async () => {
    // Params
    const params = {
      id: documentID,
      file_name: documentFormData?.filename,
      extension: documentFormData?.extension,
      file_type: documentFormData?.selectedDocumentType
    }
    try {
      const arrayBuffer = await file?.arrayBuffer();
      const binary = new Uint8Array(arrayBuffer!);
      const response = await axiosAPI.post(`region-orders/files/create`, binary, {
        params,
        headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
      })
      if (response.status === 200) {
        setFile(null);
        setDocumentFormData({} as {
          selectedDocumentType: string;
          filename: string;
          extension: string;
          fileBinary: string;
        });
        toast("Fayl muvaffaqiyatli yuklandi", { type: "success" });
      }
    } catch (error) {
      console.log(error)
    }
  };

  useEffect(() => {
    handleCreateDefaultDocument();
    // console.log("first")
    getDistrictOrderFile(documentID)
    getDocumentTypes()
  }, []);

  useEffect(() => {
    if (file) {
      setDocumentFormData(prev => ({ ...prev!, filename: file.name, extension: file.name.split('.').pop()! }))
      setFiles(prev => {
        const exists = prev.some(f => (f.file_name || "").toLowerCase() === file.name.toLowerCase());
        if (exists) {
          toast("Bu fayl allaqachon biriktirilgan", { type: "warning" });
          return prev;
        }
        return [...prev, {
          raw_number: (prev.length + 1) + "",
          user: currentUserInfo?.id || "",
          file_name: file.name,
          extension: file.name.split('.').pop()!,
          date: new Date().toISOString()
        }];
      })
    }
  }, [file]);

  return (
    <>
      <div className="min-h-screen py-2 px-2 bg-white">
        <div className="max-w-8xl mx-auto bg-white">
          {/* Header – hozircha bo'sh, keyin to'ldiriladi */}
          <div className="bg-white overflow-hidden flex items-center w-full">
            {documentConfirmed ? (
              <Button
                className="mr-6"
                onClick={() => setIsCreateFormModalOpen(false)}
              >
                <span className="text-2xl">&times;</span>
              </Button>
            ) : (
              <Popconfirm
                placement="bottomLeft"
                title={"Buyurtmani saqlashni xohlaysizmi?"}
                description={"Buyurtmani saqlash yoki bekor qilishni tanlang."}
                okText="Saqlash"
                cancelText="Bekor qilish"
                className="mr-6"
                onCancel={() => {
                  // Delete created document and get back
                  setIsCreateFormModalOpen(false)
                }}
                onConfirm={() => {
                  // Save created document and get back

                }}
              >
                <Button><span className="text-2xl">&times;</span></Button>
              </Popconfirm>
            )}
            <div className="w-full flex items-center justify-between p-4 border-l-2 pl-6">
              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Chiqish
                </p>
                <p className="text-md font-semibold text-gray-800"></p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Chiqish Sana
                </p>
                <p className="text-md font-semibold text-gray-800">
                  {new Date().toLocaleDateString("uz-UZ")}
                </p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Tumandan
                </p>
                <p>
                  {currentUserInfo?.district?.name || "—"}
                </p>
                <p className="text-md font-semibold text-gray-800"></p>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Viloyatga
                </p>
                <p>
                  {currentUserInfo?.region?.name || "—"}
                </p>
                <p className="text-md font-semibold text-gray-800"></p>
              </div>

              <div className="text-center border-gray-200">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">
                  Tumandan junatuvchi
                </p>
                <p className="text-md font-semibold text-gray-800">
                  {currentUserInfo?.name || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* ===== Tovarlar ro'yxati ===== */}
          <div>
            <Typography fontSize={"20px"} style={{ margin: "20px 0" }} fontWeight={600} color="#0f172b">
              Buyurtma uchun berilgan tovarlar ro‘yxati
            </Typography>

            <div className="bg-transparent rounded-md flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button className="cursor-pointer" onClick={addRow}>
                  <Plus size={18} />
                  Kiritish
                </Button>
                <Button className="cursor-pointer">Qoldiqlar</Button>
              </div>
            </div>

            <div className="bg-white rounded-xl mb-6 overflow-x-auto">
              <div className="min-w-[1000px]">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2">
                    <tr>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        №
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Buyurtma turi
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Tovar nomi
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Tovar turi
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Model
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        O'lcham
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        O'lchov birligi
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Soni
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        Izoh
                      </th>
                      <th className="px-3 py-3 text-center text-sm font-semibold text-gray-700">
                        -
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#f2f2f2b6]">
                    {formData.products.length ? (
                      formData.products.map((r) => {
                        return (
                          <tr
                            key={r.raw_number}
                            className="hover:bg-indigo-50 transition-colors"
                          >
                            <td className="px-3 py-3 text-sm text-gray-900 font-medium text-center">
                              {r.raw_number}
                            </td>

                            <td className="px-3 py-3">
                              <Select
                                className="w-full"
                                placeholder="Tanlang"
                                allowClear
                                showSearch
                                value={r.order_type || null}
                                onChange={(v) =>
                                  updateRow(r.raw_number + "", "order_type", v as ID)
                                }
                                options={order_types.map((o) => ({
                                  value: o.id,
                                  label: o.name,
                                }))}
                                filterOption={(input, option) =>
                                  (option?.label as string)
                                    ?.toLowerCase()
                                    .includes(input.toLowerCase())
                                }
                              />
                            </td>
                            <td className="px-3 py-3 w-40 text-center">
                              <Input
                                placeholder="Tovar nomi"
                                value={r.product}
                                onChange={(e) => {
                                  updateRow(
                                    r.raw_number + "",
                                    "product",
                                    e.target.value
                                  )
                                }}
                              />
                            </td>

                            {/* Product type */}
                            <td className="px-3 py-3 text-center">
                              <Button className="w-full" onClick={() => setActive({ field: "product_type", row: r.raw_number })}>
                                <span className={r.product_type ? "text-gray-800" : "text-gray-400"}>
                                  {r.product_type.id ? r.product_type.name_uz : "Tanlang"}
                                </span>
                              </Button>

                              {(active?.field === "product_type" && active.row === r.raw_number) && (
                                <FieldModal
                                  field_name="product_type"
                                  selectedItem={{ id: String(r.product_type || ""), name: "", name_uz: "" }}
                                  setSelectedItem={(newItem) => {
                                    if (!newItem) { setActive(null); return; } // bekor -> hech narsa qilmaymiz3
                                    setFormData(prev => ({
                                      ...prev,
                                      products: prev.products.map(p => p.raw_number === active.row
                                        ? { ...p, product_type: { id: newItem.id, name: newItem.name, name_uz: newItem.name_uz }, model: { id: "", name: "", name_uz: "", product_type: "" }, size: { id: "", name: "", name_uz: "", product_type: "", model: "" } }
                                        : p
                                      )
                                    }))
                                    setActive(null);
                                  }}
                                />
                              )}
                            </td>


                            {/* Model */}
                            <td className="px-3 py-3 text-center">
                              <Button className="w-full" onClick={() => setActive({ field: "model", row: r.raw_number })}>
                                <span className={r.model ? "text-gray-800" : "text-gray-400"}>
                                  {r.model.id ? r.model.name_uz : "Tanlang"}
                                </span>
                              </Button>

                              {active?.field === "model" && active.row === r.raw_number && (
                                <FieldModal
                                  field_name="model"
                                  selectedItem={{ id: String(r.model || ""), name: "", name_uz: "" }}
                                  // FILTRGA NOM EMAS, **ID** yuboring!
                                  selectedProductTypeId={r.product_type.name || ""}
                                  setSelectedItem={(newItem) => {
                                    if (!newItem) { setActive(null); return; }
                                    setFormData(prev => ({
                                      ...prev,
                                      products: prev.products.map(p => p.raw_number === active.row ? { ...p, model: { id: String(newItem.id), name: newItem.name, name_uz: newItem.name_uz, product_type: p.model.product_type }, size: { id: "", name: "", name_uz: "", product_type: "", model: "" } } : p),
                                    }))
                                    setActive(null);
                                  }}
                                />
                              )}
                            </td>

                            {/* Size */}
                            <td className="px-3 py-3 text-center">
                              <Button className="w-full" onClick={() => setActive({ field: "size", row: r.raw_number })}>
                                <span className={r.size ? "text-gray-800" : "text-gray-400"}>
                                  {r.size.id ? r.size.name : "Tanlang"}
                                </span>
                              </Button>

                              {active?.field === "size" && active.row === r.raw_number && (
                                <FieldModal
                                  field_name="size"
                                  selectedItem={{ id: String(r.size || ""), name: "", name_uz: "" }}
                                  // FILTRGA NOM EMAS, **ID** yuboring!
                                  selectedProductTypeId={r.product_type.name || ""}
                                  selectedModelId={r.model.name || ""}
                                  setSelectedItem={(newItem) => {
                                    console.log(active)
                                    if (!newItem) { setActive(null); return; }
                                    setFormData(prev => ({
                                      ...prev,
                                      products: prev.products.map(p => p.raw_number === active.row ? { ...p, size: { id: String(newItem.id), name: newItem.name, name_uz: newItem.name_uz, product_type: p.size.product_type, model: p.size.model } } : p),
                                    }))
                                    setActive(null);
                                  }}
                                />
                              )}
                            </td>

                            {/* Unit */}
                            <td className="px-3 py-3 text-center">
                              <Button className="w-full" onClick={() => setActive({ field: "unit", row: r.raw_number })}>
                                <span className={r.unit ? "text-gray-800" : "text-gray-400"}>
                                  {r.unit.id ? r.unit.name : "Tanlang"}
                                </span>
                              </Button>

                              {active?.field === "unit" && active.row === r.raw_number && (
                                <FieldModal
                                  field_name="unit"
                                  selectedItem={{ id: String(r.unit || ""), name: "", name_uz: "" }}
                                  setSelectedItem={(newItem) => {
                                    console.log(active)
                                    if (!newItem) { setActive(null); return; }
                                    setFormData(prev => ({
                                      ...prev,
                                      products: prev.products.map(p => p.raw_number === active.row
                                        ? { ...p, unit: { id: newItem.id, name: newItem.name, name_uz: newItem.name_uz } } : p
                                      )
                                    }))
                                    setActive(null);
                                  }}
                                />
                              )}
                            </td>

                            <td className="px-3 py-3 text-center">
                              <InputNumber
                                min={1}
                                className="w-24"
                                value={r.quantity}
                                onChange={(v) =>
                                  updateRow(
                                    r.raw_number + "",
                                    "quantity",
                                    Number(v || 0)
                                  )
                                }
                              />
                            </td>

                            <td className="px-3 py-3 text-center">
                              <Input
                                placeholder="Izoh"
                                value={r.description}
                                onChange={(e) =>
                                  updateRow(
                                    r.raw_number + "",
                                    "description",
                                    e.target.value
                                  )
                                }
                              />
                            </td>

                            <td className="px-3 py-3 text-center">
                              <Button
                                danger
                                onClick={() => removeRow(r.raw_number + "")}
                                icon={<Trash2 size={16} />}
                              >
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td className="px-4 py-2 text-red-500 text-lg font-semibold">Tovar tanlanmagan</td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* ===== Yuborilayotgan xat ===== */}
          <div className='flex border shadow-md max-w-[700px] px-6 py-4 rounded-lg'>
            <div className="flex items-center gap-4 mb-3 w-full">
              <div className={`text-5xl p-6 flex items-center justify-center rounded-full text-blue-500 bg-blue-50`}>
                <FileWordOutlined />
              </div>
              <div className="flex flex-col">
                <h4 className="text-gray-800 font-semibold text-xl truncate w-40">
                  {/* {file.file_name} */}
                  {file?.name || "Hujjat fayli"}
                </h4>
                <p className="text-lg">{currentUserInfo?.name}</p>
                <p className="text-gray-500 mt-1">{currentUserInfo?.type_user}</p>
              </div>
            </div>

            {/* 🔸 Action tugmalar */}
            <div className="flex flex-col gap-2 min-w-[150px]">
              <button
                onClick={() => {
                  const openWordURL = `ms-word:ofe|u|${messageFileURL}`;
                  const link = document.createElement("a");
                  link.href = openWordURL;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link)
                }}
                className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                title="Ko‘rish"
              >
                <span>Ko'rish</span>
                <EyeOutlined className="text-[24px]" />
              </button>
              <button
                onClick={() => {
                  const openWordURL = `ms-word:ofe|u|${messageFileURL}`;
                  const link = document.createElement("a");
                  link.href = openWordURL;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link)
                }}
                className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                title="Yuklab olish"
              >
                <span>O'zgartirish</span>
                <Pencil className="text-[24px]" />
              </button>
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = messageFileURL;
                  link.setAttribute('download', file?.name || 'file.docm');
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition flex items-center justify-between gap-4 bg-gray-100 px-2 cursor-pointer"
                title="Yuklab olish"
              >
                <span>Yuklab olish</span>
                <DownloadOutlined className="text-[24px]" />
              </button>
            </div>

          </div>

          {/* ===== Imzolovchilar ro'yxati (skelet) ===== */}
          <div className="mt-12">
            <Typography fontSize={"20px"} style={{ margin: "20px 0" }} fontWeight={600} color="#0f172b">
              Imzolovchilar ro‘yxati
            </Typography>

            <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
              <div className="flex items-center gap-3">
                <Button
                  className='cursor-pointer'
                  onClick={() => {
                    fetchEmployees();
                    setShowEmployeeModal(true);
                  }}
                >
                  <Plus size={18} />
                  Kiritish
                </Button>
                <Button className="cursor-pointer">Yuborish</Button>
              </div>
            </div>

            <div className="bg-white rounded-xl mb-6 overflow-x-auto">
              <div className="min-w-[1000px]">
                {/* Executors cards grid */}
                <div className="grid grid-cols-4 gap-6">
                  {formData.executors.length ? (
                    formData.executors.map((ex, index) => (
                      <div key={index} className="bg-white border shadow-xl p-4 rounded-xl flex flex-col gap-4 relative">
                        <button className="absolute right-0 top-0 text-xl bg-red-500 text-white w-[26px] flex items-center justify-center h-[26px] rounded-bl-md cursor-pointer"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              executors: prev.executors.filter((_, i) => i !== index)
                            }));
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                        {/* Top */}
                        <div className="flex justify-center gap-6" >
                          <p className="w-[35px] h-[35px] flex items-center justify-center bg-sky-400/20 rounded-full">{index + 1}</p>
                          <div>
                            <h2 className="text-lg font-semibold text-center">{ex.name}</h2>
                            <p className="text-center text-gray-500">{ex.position}</p>
                          </div>
                        </div>
                        <p>
                          <div className="flex items-center justify-between px-4 py-2 border-t">
                            <span className="text-sm text-gray-600">Viloyat:</span>
                            <span className="font-medium">{ex.region}</span>
                          </div>
                        </p>
                      </div>
                    ))
                  ) : (
                    <div>
                      <h2 className="text-2xl font-semibold text-center text-red-400">Imzolovchi yo'q</h2>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>

          {/* Attach document */}
          <div className='flex items-center justify-center gap-6 p-6'>
            {/* File Upload Button */}
            <button
              onClick={() => setFileUploadModal(true)}
              className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
            >
              <div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
                <FilePlus2 className='w-5 h-5' />
              </div>
              <span>Hujjat biriktirish</span>
            </button>

            {/* Text Area */}
            <div className='flex-1 max-w-md'>
              <TextArea
                placeholder='Qisqacha mazmun yozing...'
                className='rounded-xl border-2 border-gray-200 focus:border-blue-400 hover:border-gray-300 transition-colors shadow-sm'
                style={{ height: "120px" }}
              />
            </div>
          </div>

          {/* 🔸 3. FAYLLAR RO‘YXATI */}
          <div className="px-6 mb-6">
            <Typography fontSize={"20px"} style={{ margin: "20px 0" }} fontWeight={600} color="#0f172b">
              Biriktirilgan hujjatlar ro‘yxati
            </Typography>

            {files.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {files.map((file, index) => {
                  const { icon, color, bg } = getFileIcon(file.file_name);
                  return (
                    <div
                      key={index}
                      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-4 flex flex-col justify-between"
                    >
                      {/* 🔹 Exit number & Row number */}
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[13px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
                          {documentNumber}{file.date.split("T")[0] + " " + file.date.split("T")[1].split(".")[0]}
                          {file.raw_number}
                        </span>
                      </div>
                      <div className='flex'>

                        {/* 🔸 Fayl ma’lumotlari */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-3 rounded-lg ${bg}`}>
                            <div className={`${color} text-3xl`}>{icon}</div>
                          </div>
                          <div className="flex flex-col">
                            <h4 className="text-gray-800 font-semibold text-[12px] truncate w-40">
                              {file.file_name}
                            </h4>
                            {currentUserInfo?.name}
                            <p className="text-gray-500 text-[12px] mt-1">{formatDate(file.date)}</p>
                          </div>
                        </div>

                        {/* 🔸 Action tugmalar */}
                        <div className="flex flex-col gap-2">
                          <button
                            onClick={() => handleView(file)}
                            className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                            title="Ko‘rish"
                          >
                            <EyeOutlined className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="p-2 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
                            title="Yuklab olish"
                          >
                            <DownloadOutlined className="text-lg" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500">Hujjatlar yo‘q</p>
            )}
          </div>
          {fileUploadModal && (
            <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setFileUploadModal(false)}>
              <div className="bg-white rounded-lg p-6 w-96 flex flex-col" onClick={(e) => e.stopPropagation()}>
                {/* Top */}
                <div className='flex items-center justify-between mb-4 pb-2 border-b'>
                  <h2 className="text-xl font-semibold">Hujjat biriktirish</h2>
                  <button className='text-2xl' onClick={() => setFileUploadModal(false)}>&times;</button>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hujjat turi</label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Hujjat turini tanlang"
                    onChange={(value) => {
                      setDocumentFormData(prev => ({ ...prev!, selectedDocumentType: value }))
                    }}
                    options={documentTypes.map(docType => ({ value: docType.id, label: docType.name }))}
                  />
                </div>
                <div className="mb-4">
                  <FileDropZone file={file} setFile={setFile} />
                </div>

                <Button
                  className="bg-gray-100 p-2 rounded-lg text-sm cursor-pointer hover:bg-blue-400 hover:text-white ml-auto"
                  onClick={() => {
                    setFileUploadModal(false);
                    handleFileAttach()
                  }}>
                  Yuklash
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="primary" onClick={() => handleSaveData()}>
              Saqlash
            </Button>
          </div>
        </div>
      </div>

      {/* 🟣 Hodim tanlash modali (multiple selection) */}
      {showEmployeeModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setShowEmployeeModal(false)}
        >
          <div
            className="bg-white rounded-lg w-[600px] p-6 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3 mb-4">
              <h2 className="text-lg font-semibold">Imzolovchi hodimni tanlang</h2>
              <button
                className="text-xl font-bold hover:text-red-500"
                onClick={() => setShowEmployeeModal(false)}
              >
                ×
              </button>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {employees.length === 0 ? (
                <div className="text-center py-6 text-gray-500">Ma'lumot topilmadi</div>
              ) : (
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-2 text-sm font-semibold">F.I.Sh.</th>
                      <th className="text-left px-4 py-2 text-sm font-semibold">Lavozimi</th>
                      <th className="text-left px-4 py-2 text-sm font-semibold">Imzolovchi turi</th>
                      <th className="text-left px-4 py-2 text-sm font-semibold"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => {
                      const isChecked = formData.executors.some((e) => e.id === emp.id);
                      return (
                        <tr
                          key={index}
                          className={`hover:bg-blue-50 transition ${isChecked ? "bg-blue-100" : ""}`}
                        >
                          <td className="px-4 py-2 text-sm text-gray-800">{emp.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-800">{emp.position}</td>
                          <td>
                            <Select
                              placeholder="Imzolovchi turini tanlang"
                              value={
                                isChecked
                                  ? formData.executors.find((ex) => ex.id === emp.id)?.executor_type || undefined
                                  : emp.executor_type || undefined
                              }
                              onChange={(value) => {
                                const updatedEmployees = employees.map((e) =>
                                  e.id === emp.id ? { ...e, executor_type: value } : e
                                );
                                setEmployees(updatedEmployees);
                                if (isChecked) {
                                  setFormData((prev) => {
                                    const exists = prev.executors.some((ex) => ex.id === emp.id);
                                    if (exists) {
                                      return {
                                        ...prev,
                                        executors: prev.executors.map((ex) =>
                                          ex.id === emp.id ? { ...ex, executor_type: value } : ex
                                        ),
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        executors: [...prev.executors, { ...emp, executor_type: value }],
                                      };
                                    }
                                  });
                                }
                              }}
                              style={{ width: 200 }}
                            >
                              {executorType.map((type) => (
                                <Select.Option key={type.id} value={type.id}>
                                  {type.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </td>

                          <td className="px-4 py-2 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(ev) => {
                                if (ev.target.checked) {
                                  // add if not exists
                                  setFormData(prev => {
                                    if (prev.executors.some(e => e.id === emp.id)) return prev;
                                    return { ...prev, executors: [...prev.executors, emp] };
                                  });
                                } else {
                                  // remove
                                  setFormData(prev => ({ ...prev, executors: prev.executors.filter(e => e.id !== emp.id) }));
                                }
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end mt-5">
              <Button
                type="primary"
                onClick={() => {
                  if (formData.executors.length === 0) {
                    message.warning("Iltimos, kamida bitta hodimni tanlang!");
                    return;
                  }
                  setShowEmployeeModal(false);
                }}
              >
                Tanlash
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderWIndow;