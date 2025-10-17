/* eslint-disable react/no-unknown-property */
import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, InputNumber, Select, Spin, message } from "antd";
import { Plus, Search, Trash2 } from "lucide-react";
import { axiosAPI } from "@/services/axiosAPI";
import { useAppSelector } from "@/store/hooks/hooks";
import { toast } from "react-toastify";

// ===== Types =====
type IDName = { id: string; name: string };
type ID = string;

interface ProductRow {
  raw_number: number;
  product: string;
  model: string;
  product_type: string;
  size: string;
  unit: string;
  quantity: number;
  order_type: string;
  description: string;
}

interface FormDataType {
  exit_date: string;
  user: string;
  description: string;
  products: ProductRow[],
  executors: {
    executor: string;
    status: string;
  }[]
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
  model: "",
  product_type: "",
  size: "",
  unit: "",
  quantity: 1,
  order_type: "",
  description: "",
}

// Backend POST endpoint (o'zingizniki bilan almashtiring kerak bo'lsa)
const CREATE_ENDPOINT = "/district-orders/create/";

const OrderWIndow: React.FC = () => {
  // Global spravochniklar
  const [formData, setFormData] = useState<FormDataType>(initialFormData);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [executors, setExecutors] = useState<any[]>([]);

  const { currentUserInfo } = useAppSelector(state => state.info);
  const { order_types, product_models, product_sizes, product_types, product_units } = useAppSelector(state => state.product)

  // Qidiruv
  const [search, setSearch] = useState("");

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
    raw_number: string,
    key: K,
    value: ProductRow[K]
  ) => {

    console.log(`Row: ${raw_number}, Key: ${key}, Value: ${value}`);

    const findProduct = formData.products.find(p => p.raw_number === Number(raw_number));
    if (findProduct) {
      const updatedProduct = { ...findProduct, [key]: value };
      setFormData(prev => ({
        ...prev,
        products: prev.products.map(p => p.raw_number === Number(raw_number) ? updatedProduct : p)
      }))
    }
  }

  // 🔹 Hodimlar ro'yxatini olish
  const fetchEmployees = async () => {
    try {
      const response = await axiosAPI.get("employees/list");
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
    if (!formData.products.length) errs.push("Kamida bitta tovar qatori kerak.");


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

  // Qidiruv bo'yicha ko‘rinadigan qatorlar
  const visibleRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return formData.products;
    return formData.products.filter(
      (r) =>
        r.product?.toLowerCase().includes(q) ||
        r.description?.toLowerCase().includes(q)
    );
  }, [search]);

  const handleSave = async () => {
    try {
      // 🔹 Validatsiya
      const errors = validate();
      if (errors.length > 0) {
        message.error(errors.join("\n"));
        return;
      }

      // 🔹 Foydalanuvchi ID (agar kerak bo‘lsa)
      const userId = currentUserInfo?.id || "";

      // 🔹 Yuboriladigan data
      const payload = {
        exit_date: formData.exit_date,
        user: userId,
        description: formData.description || "",
        products: formData.products.map((p) => ({
          raw_number: p.raw_number,
          product: p.product, // bu joyda product ID bo‘lsa, ID yuboramiz
          model: p.model,
          product_type: p.product_type,
          size: p.size,
          unit: p.unit,
          quantity: p.quantity,
          order_type: p.order_type, // 🔹 endi id yuboradi
          description: p.description || "",
        })),
        executors: executors.map((ex) => ({
          executor: ex.id, // faqat ID yuboriladi
        })),
      };

      console.log("📦 Payload:", payload);

      // 🔹 Backendga yuborish
      const response = await axiosAPI.post(CREATE_ENDPOINT, payload);

      if (response.status === 200 || response.status === 201) {
        toast.success("Buyurtma muvaffaqiyatli yaratildi!");
        // Forma tozalash
        setFormData(initialFormData);
        setExecutors([]);
      } else {
        toast.error("Xatolik yuz berdi!");
      }
    } catch (error: any) {
      console.error("❌ Saqlashda xatolik:", error);
      toast.error(error.response?.data?.message || "Saqlashda xatolik yuz berdi");
    }
  };



  return (
    <>
      <div className="min-h-screen py-2 px-2 bg-white">
        <div className="max-w-8xl mx-auto bg-white">
          {/* Header – hozircha bo'sh, keyin to'ldiriladi */}
          <div className="bg-white overflow-hidden">
            <div className="flex items-center justify-between p-4">
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
            <div className="bg-transparent rounded-md flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <Button className="cursor-pointer" onClick={addRow}>
                  <Plus />
                  Kiritish
                </Button>
                <Button className="cursor-pointer">Qoldiqlar</Button>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Qidirish (Ctrl+F)"
                  className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl mb-6 overflow-x-auto">
              <div className="min-w-[1000px]">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2">
                    <tr>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        №
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        Buyurtma turi
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        Tovar nomi
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        Tovar turi
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        Model
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        O'lcham
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        O'lchov birligi
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        Soni
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        Izoh
                      </th>
                      <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700">
                        -
                      </th>
                    </tr>
                  </thead>

                  <tbody className="bg-[#f2f2f2b6]">
                    {formData.products.length ? (
                      formData.products.map((r) => {
                        const index = formData.products.findIndex(
                          (x) => x.raw_number === r.raw_number
                        );
                        return (
                          <tr
                            key={(r.raw_number + index) + ""}
                            className="hover:bg-indigo-50 transition-colors"
                          >
                            <td className="px-3 py-3 text-sm text-gray-900 font-medium">
                              {r.raw_number}
                            </td>

                            <td className="px-3 py-3">
                              <Select
                                className="w-36"
                                placeholder="Tanlang"
                                allowClear
                                showSearch
                                value={r.order_type}
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
                            <div className="w-40">
                              <td className="px-3 py-3">
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
                            </div>

                            <td className="px-3 py-3">
                              <Select
                                className="w-46"
                                placeholder="Tovar turi"
                                allowClear
                                showSearch
                                value={r.product_type}
                                onChange={(v) =>
                                  updateRow(
                                    r.raw_number + "",
                                    "product_type",
                                    v as ID
                                  )
                                }
                                options={product_types.map((o) => ({
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

                            <td className="px-3 py-3">
                              <Select
                                className="w-50"
                                placeholder="Model"
                                allowClear
                                showSearch
                                value={r.model}
                                onChange={(v) =>
                                  updateRow(r.raw_number + "", "model", v as ID)
                                }
                                options={product_models.map((o) => ({
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

                            <td className="px-3 py-3">
                              <Select
                                className="w-36"
                                placeholder="O‘lcham"
                                allowClear
                                showSearch
                                value={r.size}
                                onChange={(v) =>
                                  updateRow(r.raw_number + "", "size", v as ID)
                                }
                                options={product_sizes.map((o) => ({
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

                            <td className="px-3 py-3">
                              <Select
                                className="w-36"
                                placeholder="O‘lchov birligi"
                                allowClear
                                showSearch
                                value={r.unit}
                                onChange={(v) =>
                                  updateRow(r.raw_number + "", "unit", v as ID)
                                }
                                options={product_units.map((o) => ({
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

                            <td className="px-3 py-3 text-right">
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

                            <div className="w-44">
                              <td className="px-3 py-3">
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
                            </div>

                            <td className="px-3 py-3 text-right">
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

          {/* ===== Imzolovchilar ro'yxati (skelet) ===== */}
          <div>
            <div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
              <div className="flex items-center gap-3">
                <Button
                  className='cursor-pointer'
                  onClick={() => {
                    fetchEmployees();
                    setShowEmployeeModal(true);
                  }}
                >
                  <Plus />
                  Kiritish
                </Button>
                <Button className="cursor-pointer">Yuborish</Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Qidirish (Ctrl+F)"
                  className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
                />
              </div>
            </div>

            <div className="bg-white rounded-xl mb-6 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b-2">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        №
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Xabar holati
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Imzolovchi xodim
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Lavozim
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Imzolash holati
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                        Sana
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {executors.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-gray-500">
                          Hozircha imzolovchilar mavjud emas
                        </td>
                      </tr>
                    ) : (
                      executors.map((ex, i) => (
                        <tr key={i} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm">{i + 1}</td>
                          <td className="px-4 py-2 text-sm">{ex.name}</td>
                          <td className="px-4 py-2 text-sm">{ex.position}</td>
                          <td className="px-4 py-2 text-sm text-blue-600"></td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="primary" onClick={handleSave}>
              Saqlash
            </Button>
          </div>
        </div>
      </div>

      {/* 🟣 Hodim tanlash modali */}
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
                      <th className="text-center px-4 py-2 text-sm font-semibold">Tanlash</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.map((emp, index) => (
                      <tr
                        key={index}
                        className={`hover:bg-blue-50 transition ${selectedEmployee?.id === emp.id ? "bg-blue-100" : ""
                          }`}
                      >
                        <td className="px-4 py-2 text-sm text-gray-800">{emp.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-800">{emp.position}</td>
                        <td className="px-4 py-2 text-center">
                          <input
                            type="radio"
                            checked={selectedEmployee?.id === emp.id}
                            onChange={() => setSelectedEmployee(emp)}
                          />
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-800"></td>
                        <td className="px-4 py-2 text-sm text-gray-800"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="flex justify-end mt-5">
              <Button
                type="primary"
                onClick={() => {
                  if (selectedEmployee) {
                    setExecutors((prev) => [
                      ...prev,
                      {
                        id: selectedEmployee.id,
                        name: selectedEmployee.name,
                        position: selectedEmployee.position || "—",
                      },
                    ]);
                    setShowEmployeeModal(false);
                    setSelectedEmployee(null);
                  } else {
                    message.warning("Iltimos, hodimni tanlang!");
                  }
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
