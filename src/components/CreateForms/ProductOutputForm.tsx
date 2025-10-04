/* eslint-disable react-hooks/exhaustive-deps */
import { DatePicker, Input, Select, type DatePickerProps } from "antd";
import React, { useEffect } from "react";
import dayjs, { Dayjs } from "dayjs";
import { axiosAPI } from "@/services/axiosAPI";
import { useAppDispatch, useAppSelector } from "@/store/hooks/hooks";
import {
  setCounterParties,
  setTypesOfGoods,
  setWarehouses,
} from "@/store/infoSlice/infoSlice";
import {
  setProductModels,
  setProducts,
  setProductSizes,
  setProductTypes,
} from "@/store/productSlice/productSlice";
import SelectRemainsModal from "./SelectRemainsModal";
import { Button } from "../UI/button";
import { Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../UI/table";
import { toast } from "react-toastify";
import Barcode from "react-barcode";

const DATE_FORMAT = "DD-MM-YYYY HH:mm:ss";

interface ProductOutputFormProps {
  setIsCreateFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ProductOutputForm: React.FC<ProductOutputFormProps> = ({ setIsCreateFormModalOpen }) => {
  // States
  const [dateValue, setDateValue] = React.useState<Dayjs | null>(dayjs());
  const [region, setRegion] = React.useState<string>("");
  const [district, setDistrict] = React.useState<string>("");
  const [warehouse, setWarehouse] = React.useState<string>("");
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] =
    React.useState<string>("");
  const [type_output, setTypeOutput] = React.useState<ITypeOfGoods[]>([]);
  const [responsiblePerson, setResponsiblePerson] = React.useState<
    IReponsiblePerson[]
  >([]);
  const [formData, setFormData] = React.useState<WarehouseOutput>({
    date: dateValue?.format("DD-MM-YYYYTHH:mm:ss") + "",
    region,
    warehouse,
    type_output: "",
    responsible_person: "",
    product_status: "",
    district,
    products: [],
  });
  const [remainders, setRemainders] = React.useState<ProductRemainder[]>([]);
  const [selectedRemaindersList, setSelectedRemaindersList] = React.useState<ProductRemainder[]>([]);

  const [openSelectRemaindersModal, setOpenSelectRemaindersModal] =
    React.useState<boolean>(false);

  // Redux
  const { regions, districts, warehouses, counterparties, typesOfGoods, currentUserInfo } =
    useAppSelector((state) => state.info);
  const { product_types, products, product_models, product_sizes } =
    useAppSelector((state) => state.product);
  const dispatch = useAppDispatch();

  // Datepicker onChange
  const onChange: DatePickerProps["onChange"] = (value, dateString) => {
    setDateValue(value);
    setFormData((prev) => ({
      ...prev,
      date: value ? value.format(DATE_FORMAT) : "",
    }));
    console.log(dateString);
  };

  // Handle create product output form submit
  const handleCreateProductOutput = async (data: WarehouseOutput) => {
    try {
      const response = await axiosAPI.post("write-offs/create/", data);
      if (response.status === 200) {
        toast("Yangi tovar chiqimi yaratildi!", { type: "success" });
        setIsCreateFormModalOpen(false)
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = (dataToSubmit?: WarehouseOutput) => {
    // Use the passed data or current formData
    const submitData = dataToSubmit || formData;

    handleCreateProductOutput(submitData);
  };

  // get warehouses list with region and district name
  const getWarehousesList = React.useCallback(async () => {
    if (region && district) {
      const url = `warehouses/list/?region=${region}&district=${district}`;
      try {
        // Send parameters as query params (they will be URL encoded automatically)
        const response = await axiosAPI.get(url);
        if (response.status === 200) {
          // Handle successful response
          dispatch(setWarehouses(response.data));
          if (response.data.length === 1) {
            setWarehouse(response.data[0].name);
            setFormData((prev) => ({
              ...prev,
              warehouse: response.data[0].id,
            }));
          } else {
            setWarehouse("");
            setFormData((prev) => ({
              ...prev,
              warehouse: "",
            }));
          }
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
        // Handle successful response
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
        // Handle successful response
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
        dispatch(setProducts(response.data));
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

  // Get type output list
  const getTypeOutputList = async () => {
    try {
      const response = await axiosAPI.get("type_outputs/list");
      if (response.status === 200) {
        setTypeOutput(response.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

  // Handle remainders fetch
  async function getRemainders() {
    try {
      const response = await axiosAPI.post("remainders/warehouses/", {
        warehouse: warehouses.find((w) => w.name === warehouse)?.id,
        date: dateValue?.toISOString(),
      });

      setRemainders(response.data);
    } catch (error) {
      console.error("Xatolik:", error);
    }
  }

  useEffect(() => {
    if (currentUserInfo) {
      setFormData((prev) => ({
        ...prev,
        region: currentUserInfo.region.id,
        district: currentUserInfo.district.id,
      }));
      setRegion(currentUserInfo.region.name);
      setDistrict(currentUserInfo.district.name);
    }
    console.log(formData);
  }, [currentUserInfo]);

  useEffect(() => {
    if (warehouse && dateValue) getRemainders();
  }, [warehouse, dateValue]);

  useEffect(() => {
    if (district) getWarehousesList();
  }, [district, getWarehousesList]);

  useEffect(() => {
    if (type_output.length === 0) getTypeOutputList();
  }, [type_output.length]);

  useEffect(() => {
    if (typesOfGoods.length === 0) getTypeOfGoodsList();
    if (counterparties.length === 0) getCounterPartiesList();
  }, [
    getTypeOfGoodsList,
    getCounterPartiesList,
    typesOfGoods.length,
    counterparties.length,
  ]);

  useEffect(() => {
    getResponsiblePersonList();
  }, [warehouse, getResponsiblePersonList]);

  useEffect(() => {
    const updatedFormDataProducts = [...formData.products];
    selectedRemaindersList.forEach((remainder) => {
      // Check if the product with the same bar_code already exists
      const existingProductIndex = updatedFormDataProducts.findIndex(
        (product) => product.product === remainder.product.id && product.model === remainder.model.id && product.size === remainder.size.id
      );
      if (existingProductIndex !== -1) {
        // If the product exists, update its remaining_quantity
        updatedFormDataProducts[existingProductIndex].remaining_quantity =
          remainder.remaining_quantity;
      } else {
        // If the product doesn't exist, add it to the list
        updatedFormDataProducts.push({
          product: remainder.product.id,
          model: remainder.model.id,
          bar_code: remainder.bar_code,
          product_type: remainder.product_type.id,
          size: remainder.size.id,
          price: remainder.price,
          product_code: remainder.product_code,
          quantity: updatedFormDataProducts.find(p => p.product === remainder.product.id && p.model === remainder.model.id && p.size === remainder.size.id)?.quantity || 0,
          remaining_quantity: remainder.remaining_quantity,
          summa: remainder.price * remainder.remaining_quantity,
          unit: remainder.unit.id,
        } as OutputProductType);
      }
    });
    setFormData((prev) => ({
      ...prev,
      products: updatedFormDataProducts,
    }));
  }, [selectedRemaindersList.length]);

  useEffect(() => {
    // Fetch all product-related data on component mount

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
              value={region || undefined}
              disabled
              onChange={value => console.log(value)}
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
              disabled={currentUserInfo?.district ? true : false}
              value={district || undefined}
              onChange={value => console.log(value)}
            >
              {districts.map((district) => (
                <Select.Option key={district.id} value={district.name}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Product types */}
          <div className="flex flex-col">
            <label className="mb-1">Tovar turi</label>
            <Select
              placeholder="Tovar turini tanlang"
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  product_type: value,
                }));
              }}
            >
              {product_types.map((type, index) => (
                <Select.Option key={index} value={type.id}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Type output */}
          <div className="flex flex-col">
            <label className="mb-1">Tovar xarajat turi</label>
            <Select
              placeholder="Tovar turini tanlang"
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  type_output: type_output.find((t) => t.name === value)?.id || "",
                }));
              }}
            >
              {type_output.map((type, index) => (
                <Select.Option key={index} value={type.name}>
                  {type.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Warehouse */}
          <div className="flex flex-col">
            <label className="mb-1">Ombor</label>
            <Select
              placeholder="Omborni tanlang"
              disabled
              value={warehouse || undefined}
              onChange={value => console.log(value)}
            >
              {warehouses.map((warehouse) => (
                <Select.Option key={warehouse.id} value={warehouse.name}>
                  {warehouse.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* Responsible Person */}
          <div className="flex flex-col">
            <label className="mb-1">Moddiy Javobgar shaxs</label>
            <Select
              placeholder="Mas'ul shaxsni tanlang"
              value={selectedResponsiblePerson || undefined}
              disabled={responsiblePerson.length === 0}
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

          {/* Remainders selection */}
          <div className="flex flex-col col-span-4">
            <label className="mb-1">Tanlangan qoldiqlar</label>
            {selectedRemaindersList.length > 0 ? (
              <div className="border border-gray-300 rounded overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tovar nomi</TableHead>
                      <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shtrix kod</TableHead>
                      <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">O'lcham</TableHead>
                      <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Miqdori</TableHead>
                      <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Narxi</TableHead>
                      <TableHead className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white divide-y divide-gray-200">
                    {selectedRemaindersList.map((remainder, index) => (
                      <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <TableCell className="px-4 py-2 whitespace-nowrap">{remainder.product?.name.slice(0, 25) + "..." || 'Noma\'lum tovar'}</TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          <Barcode value={remainder.bar_code} width={1} height={30} fontSize={12} />
                        </TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">{remainder.size?.name || '-'}</TableCell>
                        <TableCell className="px-4 py-2 max-w-[60px] whitespace-nowrap">
                          <div className="relative">
                            <Input
                              type="number" min={0} max={remainder.remaining_quantity}
                              defaultValue={""}
                              placeholder="Tovar miqdori"
                              value={formData.products[index]?.quantity || ""}
                              status={formData.products[index]?.quantity >= remainder.remaining_quantity ? "error" : ""}
                              onChange={(e) => {
                                if (e.target.value !== "e") {
                                  const value = Number(e.target.value);
                                  // Validate that the entered value doesn't exceed remaining quantity
                                  const validValue = value > remainder.remaining_quantity
                                    ? remainder.remaining_quantity
                                    : value;

                                  const updatedList = [...formData.products];
                                  updatedList[index].quantity = validValue;
                                  setFormData((prev) => ({
                                    ...prev,
                                    products: updatedList,
                                  }));
                                }
                              }}
                            />
                            {formData.products[index]?.quantity >= remainder.remaining_quantity && (
                              <div className="absolute top-0 -translate-y-full left-0 bg-red-500 text-white px-2 py-1 text-xs rounded shadow z-10">
                                Qoldiq soni: {remainder.remaining_quantity}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">{remainder.price.toLocaleString() || 0} UZS</TableCell>
                        <TableCell className="px-4 py-2 whitespace-nowrap">
                          <Button className="bg-red-500 hover:bg-red-700 text-white p-1 rounded" onClick={() => {
                            const updatedList = selectedRemaindersList.filter((_, i) => i !== index);
                            setSelectedRemaindersList(updatedList);
                          }}>
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="border border-gray-300 rounded p-2 min-h-[44px] flex items-center justify-center text-gray-500">
                Qoldiqlar tanlanmagan
              </div>
            )}
          </div>
        </div>

        {openSelectRemaindersModal && (
          <SelectRemainsModal
            remainders={remainders}
            setSelectedRemaindersList={setSelectedRemaindersList}
            selectedRemaindersList={selectedRemaindersList}
            onClose={() => setOpenSelectRemaindersModal(false)}
          />
        )}

        {/* Remainders selection button */}
        <button
          type="button"
          className={`${remainders.length === 0 ? "bg-gray-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"} text-white font-bold py-2 px-4 rounded self-end`}
          disabled={remainders.length === 0}
          onClick={() => setOpenSelectRemaindersModal(true)}
        >
          Qoldiqlarni tanlash
        </button>

        {/* Submit button */}
        <button
          type="submit"
          className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded self-end"
          onClick={() => {
            handleSubmit(formData);
          }}
        >
          Yaratish
        </button>
      </form>
    </>
  );
};

export default ProductOutputForm;
