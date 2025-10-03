/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import { DatePicker, Input, Select, type DatePickerProps } from "antd";
import React, { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { axiosAPI } from "@/services/axiosAPI";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import {
  setCounterParties,
  setDistricts,
  setRegions,
  setTypesOfGoods,
  setWarehouses,
} from "@/store/infoSlice/infoSlice";
import {
  setProductModels,
  setProducts,
  setProductSizes,
  setProductTypes,
} from "@/store/productSlice/productSlice";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/UI/button";
import CounterPartyForm from "./CounterPartyForm";
import Typography from "@mui/material/Typography";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../UI/table";
import { toast } from "react-toastify";

const DATE_FORMAT = "YYYY-MM-DD HH:mm:ss";

const defaultProduct: Product = {
  row_number: 0,
  bar_code: "",
  product_code: "",
  product: "",
  model: "",
  product_type: "",
  size: "",
  date_party: "",
  price: 0,
  quantity: 0,
  unit: "",
  summa: 0,
};

interface IProductInputFormProps {
  setIsCreateFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ProductInputForm: React.FC<IProductInputFormProps> = ({
  setIsCreateFormModalOpen,
}) => {
  // States
  const [dateValue, setDateValue] = useState<Dayjs | null>(dayjs());
  const [region, setRegion] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [warehouse, setWarehouse] = useState<string>("");
  const [selectedCounterParty, setSelectedCounterParty] =
    useState<string>("");
  const [createCounterPartyModal, setCreateCounterPartyModal] =
    useState<boolean>(false);
  const [responsiblePerson, setResponsiblePerson] = useState<
    IReponsiblePerson[]
  >([]);
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] =
    useState<string>("");
  const [formData, setFormData] = useState<OrderPayload>({
    date: dateValue?.format(DATE_FORMAT) + "",
    region,
    warehouse,
    counterparty: "",
    type_goods: "",
    responsible_person: "",
    is_approved: false,
    products: [],
  });
  // const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([]);

  // Redux
  const {
    regions,
    districts,
    warehouses,
    counterparties,
    typesOfGoods,
    currentCreatedCounterParty,
  } = useAppSelector((state) => state.info);
  const { product_types, products, product_models, product_sizes } =
    useAppSelector((state) => state.product);
  const dispatch = useAppDispatch();

  // Datepicker onChange
  const onChange: DatePickerProps["onChange"] = (value, dateString) => {
    setDateValue(value);
    setFormData((prev) => ({
      ...prev,
      date_party: value ? value.format(DATE_FORMAT) : "",
    }));
    console.log(dateString);
  };

  // Handle create product input form submit
  const handleCreateProductInput = async (data: OrderPayload) => {
    try {
      const response = await axiosAPI.post("receipts/create/", data);
      if (response.status === 200) {
        toast("Yangi tovar kirim yaratildi!", { type: "success" });
        setIsCreateFormModalOpen(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (dataToSubmit?: OrderPayload) => {
    const submitData = dataToSubmit || formData;
    handleCreateProductInput(submitData);
  };

  // API Requests
  // Get regions
  const getRegionsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("regions/list/?order_by=2");
      if (response.status === 200) {
        dispatch(setRegions(response.data));
        setDistrict("");
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // get districts
  const getDistrictsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get(`districts/list/?region=${region}&order_by=2`);
      if (response.status === 200) dispatch(setDistricts(response.data));
    } catch (error) {
      console.log(error);
    }
  }, [dispatch, region]);

  // get warehouses list with region and district name
  const getWarehousesList = React.useCallback(async () => {
    if ((region && district) || (region === "Худудгаз Комплектатция" || region === "Худудгазтаъминот")) {
      const url = `warehouses/list/?region=${region}&district=${district}&order_by=2`;
      try {
        const response = await axiosAPI.get(url);
        if (response.status === 200) {
          dispatch(setWarehouses(response.data));
        }
      } catch (error) {
        console.log(error);
      }
    }
  }, [region, district, dispatch]);

  // Get counter parties list
  const getCounterPartiesList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("counterparties/list");
      if (response.status === 200) {
        dispatch(setCounterParties(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Get type of goods list
  const getTypeOfGoodsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("type_input/ ");
      if (response.status === 200) {
        dispatch(setTypesOfGoods(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Get Responsible Person for warehouse
  const getResponsiblePersonList = React.useCallback(async () => {
    if (warehouse) {
      const currentWarehouse = warehouses.find((w) => w.name === warehouse);
      if (!currentWarehouse) {
        setResponsiblePerson([]);
        setSelectedResponsiblePerson("");
        setFormData((prev) => ({ ...prev, responsible_person: "" }));
        return;
      }

      const url = `warehouses/responsible_person/${currentWarehouse.id}`;

      try {
        const response = await axiosAPI.get(url);
        if (response.status === 200) {
          const list: IReponsiblePerson[] = response.data;
          setResponsiblePerson(list);

          if (list.length === 1) {
            setSelectedResponsiblePerson(list[0].name);
            setFormData((prev) => ({
              ...prev,
              responsible_person: list[0].id,
            }));
          } else {
            setSelectedResponsiblePerson("");
            setFormData((prev) => ({ ...prev, responsible_person: "" }));
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      setResponsiblePerson([]);
      setSelectedResponsiblePerson("");
      setFormData((prev) => ({ ...prev, responsible_person: "" }));
    }
  }, [warehouse, warehouses]);

  // API - Products ================================
  // Get products list
  const getProductsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("products/list");
      if (response.status === 200) {
        dispatch(setProducts(response.data.results));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  const getProductTypesList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("product_types/list");
      if (response.status === 200) {
        dispatch(setProductTypes(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Get product models list
  const getProductModelsList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("models/list");
      if (response.status === 200) {
        dispatch(setProductModels(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Get product sizes list
  const getProductSizesList = React.useCallback(async () => {
    try {
      const response = await axiosAPI.get("sizes/list");
      if (response.status === 200) {
        dispatch(setProductSizes(response.data));
      }
    } catch (error) {
      console.log(error);
    }
  }, [dispatch]);

  // Effects
  useEffect(() => {
    if (regions.length === 0) getRegionsList();
  }, [regions, getRegionsList, districts, getDistrictsList]);

  useEffect(() => {
    if (region) getDistrictsList();
  }, [region, getDistrictsList]);

  useEffect(() => {
    if ((region && district) || region === "Худудгазтаъминот" || region === "Худудгаз Комплектатция") getWarehousesList();
  }, [district, getWarehousesList, region]);

  useEffect(() => {
    getCounterPartiesList();
  }, [getCounterPartiesList, createCounterPartyModal]);

  useEffect(() => {
    getTypeOfGoodsList();
  }, [getTypeOfGoodsList]);

  useEffect(() => {
    getResponsiblePersonList();
  }, [warehouse, getResponsiblePersonList]);

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

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      counterparty: currentCreatedCounterParty
        ? currentCreatedCounterParty.id
        : "",
    }));
  }, [currentCreatedCounterParty]);

  return (
    <>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col gap-6 h-full mt-6"
      >
        {/* Form fields */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-6">
          {/* Date field */}
          <div className="flex flex-col">
            <label className="mb-1">Sana</label>
            <DatePicker
              showTime={{ format: "HH:mm:ss" }}
              value={dateValue}
              onChange={onChange}
              format={DATE_FORMAT}
              className="z-10"
            />
          </div>

          {/* Region */}
          <div className="flex flex-col">
            <label className="mb-1">Viloyat</label>
            <Select
              placeholder="Viloyat tanlang"
              showSearch
              value={region || undefined}
              onChange={(value) => {
                setRegion(value);
                setDistrict("");
                setWarehouse("");
                setResponsiblePerson([]);
                setSelectedResponsiblePerson("");
                setFormData((prev) => ({
                  ...prev,
                  region: regions.find((r) => r.name === value)?.id || "",
                  district: "",
                  warehouse: "",
                  responsible_person: "",
                }));
              }}
            >
              {regions.map((region) => (
                <Select.Option key={region.id} value={region.name}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* District */}
          <div className="flex flex-col">
            <label className="mb-1">Tuman</label>
            <Select
              placeholder="Tumanni tanlang"
              showSearch
              disabled={!region || region === "Худудгаз Комплектатция" || region === "Худудгазтаъминот"}
              value={district || undefined}
              onChange={(value) => {
                setDistrict(value);
                setWarehouse("");
                setResponsiblePerson([]);
                setSelectedResponsiblePerson("");
                setFormData((prev) => ({
                  ...prev,
                  district: districts.find((d) => d.name === value)?.id || "",
                  warehouse: "",
                  responsible_person: "",
                }));
              }}
            >
              {districts.map((district) => (
                <Select.Option key={district.id} value={district.name}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Warehouse */}
          <div className="flex flex-col">
            <label className="mb-1">Ombor</label>
            <Select
              placeholder="Omborni tanlang"
              disabled={warehouses.length === 0}
              value={warehouse || undefined}
              onChange={(value) => {
                setWarehouse(value);
                setResponsiblePerson([]);
                setSelectedResponsiblePerson("");
                setFormData((prev) => ({
                  ...prev,
                  warehouse: warehouses.find((w) => w.name === value)?.id || "",
                  responsible_person: "",
                }));
              }}
            >
              {warehouses.map((warehouse) => (
                <Select.Option key={warehouse.id} value={warehouse.name}>
                  {warehouse.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* CounterParty */}
          <div className="flex flex-col relative">
            <label className="mb-1">Kontragent</label>
            <Select
              placeholder="Kontragent tanlang"
              showSearch
              value={
                selectedCounterParty
                  ? selectedCounterParty
                  : currentCreatedCounterParty
                    ? currentCreatedCounterParty.name
                    : undefined
              }
              onChange={(value) => {
                const findCounterParty = counterparties.find(
                  (c) => c.name === value
                );
                if (findCounterParty) {
                  setSelectedCounterParty(value);
                  setFormData((prev) => ({
                    ...prev,
                    counterparty: findCounterParty.id,
                  }));
                } else {
                  setCreateCounterPartyModal(true);
                }
              }}
            >
              <Button
                className="bg-gray-200"
                onClick={() => setCreateCounterPartyModal(true)}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>
                    <Plus size={17} />
                  </span>
                  <span>Kontragent yaratish</span>
                </div>
              </Button>
              {counterparties.map((counterparty, index) => (
                <Select.Option key={index} value={counterparty.name}>
                  {counterparty.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Type of Goods */}
          <div className="flex flex-col">
            <label className="mb-1">Tovar kirim turi</label>
            <Select
              placeholder="Tovar turini tanlang"
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  type_goods:
                    typesOfGoods.find((t) => t.name === value)?.id || "",
                }));
              }}
            >
              {typesOfGoods.map((type, index) => (
                <Select.Option key={index} value={type.name}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Responsible Person */}
          <div className="flex flex-col">
            <label className="mb-1">Moddiy mas'ul shaxs</label>
            <Select
              placeholder="Mas'ul shaxsni tanlang"
              value={selectedResponsiblePerson || undefined}
              onChange={(value) => {
                setSelectedResponsiblePerson(value);
                setFormData((prev) => ({
                  ...prev,
                  responsible_person:
                    responsiblePerson.find((p) => p.name === value)?.id || "",
                }));
              }}
            >
              {responsiblePerson.map((person) => (
                <Select.Option key={person.id} value={person.name}>
                  {person.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>

        {/* Products section */}
        <div className="border-t pt-4 flex flex-col items-start gap-4 relative">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setFormData((prev) => ({
                ...prev,
                products: [
                  ...prev.products,
                  { ...defaultProduct, row_number: prev.products.length + 1 },
                ],
              }));
            }}
          >
            Tovar qo'shish
          </button>
          {formData.products.length ? (
            <div className="border w-full border-slate-200 rounded-lg shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      №
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Modeli
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Turi
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      O'lchami
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Tovar
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Miqdori
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Narxi UZS
                    </TableHead>
                    <TableHead className="text-slate-700 font-semibold p-3 text-center">
                      Summa
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.products.map((product, index) => (
                    <TableRow key={index} className="even:bg-slate-50">
                      <TableCell className="text-slate-700 font-medium p-3 text-center">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium p-3">
                        {/* Product models */}
                        <Select
                          showSearch
                          className="w-full"
                          placeholder="Modelni tanlang"
                          onChange={(value) => {
                            const selectedModel = product_models.find(
                              (m) => m.name === value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index
                                  ? { ...p, model: selectedModel?.id! }
                                  : p
                              ),
                            }));
                          }}
                        >
                          {product_models.map((model) => (
                            <Select.Option key={model.id} value={model.name}>
                              {model.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </TableCell>
                      {/* Product Type */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        <Select
                          showSearch
                          className="w-full"
                          placeholder="Tovar turini tanlang"
                          onChange={(value) => {
                            const selectedType = product_types.find(
                              (t) => t.name === value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index
                                  ? { ...p, product_type: selectedType?.id! }
                                  : p
                              ),
                            }));
                          }}
                        >
                          {product_types.map((type) => (
                            <Select.Option key={type.id} value={type.name}>
                              {type.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </TableCell>
                      {/* Product size */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        <Select
                          showSearch
                          className="w-full"
                          placeholder="O'lchamini tanlang"
                          onChange={(value) => {
                            const selectedSize = product_sizes.find(
                              (s) => s.name === value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index
                                  ? { ...p, size: selectedSize?.id! }
                                  : p
                              ),
                            }));
                          }}
                        >
                          {product_sizes.map((size) => (
                            <Select.Option key={size.id} value={size.name}>
                              {size.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </TableCell>

                      {/* Product */}
                      <TableCell className="text-slate-700 font-medium p-3 w-[30%] max-w-[30%]">
                        <Select
                          showSearch
                          className="w-full"
                          placeholder="Tovar tanlang"
                          onChange={(value) => {
                            const selectedProduct = products.find(
                              (p) => p.name === value
                            );
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index
                                  ? { ...p, product: selectedProduct?.id! }
                                  : p
                              ),
                            }));
                          }}
                        >
                          {products.map((prod) => (
                            <Select.Option key={prod.id} value={prod.name}>
                              {prod.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </TableCell>

                      {/* Quantity */}
                      <TableCell className="text-slate-700 font-medium p-3 max-w-[7%] w-[7%]">
                        <Input
                          type="number"
                          placeholder="Soni"
                          value={product.quantity || undefined}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index ? { ...p, quantity: value } : p
                              ),
                            }));
                          }}
                        />
                      </TableCell>

                      {/* Price */}
                      <TableCell className="text-slate-700 font-medium p-3 w-[10%] max-w-[10%]">
                        <Input
                          type="number"
                          placeholder="Narxi"
                          value={product.price || undefined}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.map((p, i) =>
                                i === index ? { ...p, price: value } : p
                              ),
                            }));
                          }}
                        />
                      </TableCell>

                      {/* Summa */}
                      <TableCell className="text-slate-700 font-medium p-3">
                        {product.price * product.quantity + " UZS"}
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium p-3 w-[5%]">
                        <button
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              products: prev.products.filter(
                                (_, i) => i !== index
                              ),
                            }));
                          }}
                        >
                          <Trash size={16} />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div>Hech qanday tovar tanlanmadi</div>
          )}
        </div>

        {/* Submit button */}

        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-end"
          onClick={() => {
            const updatedProducts = formData.products.map((product) => ({
              ...product,
              summa: product.price * product.quantity,
            }));

            const updatedFormData = {
              ...formData,
              products: updatedProducts,
              is_approved:
                formData.type_goods === "НаОсновнойСклад" ? true : false,
            };

            setFormData(updatedFormData);
            handleSubmit(updatedFormData);
          }}
        >
          Saqlash
        </button>
      </form>

      {createCounterPartyModal && (
        // Modal
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          {/* Inner */}
          <div
            className="bg-white rounded-lg min-w=[600px] shadow-2xl p-6 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Tovar kirim yaratish
            </Typography>

            <CounterPartyForm
              setFormData={setFormData}
              setCreateCounterPartyModal={setCreateCounterPartyModal}
              setSelectedCounterParty={setSelectedCounterParty}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ProductInputForm;
