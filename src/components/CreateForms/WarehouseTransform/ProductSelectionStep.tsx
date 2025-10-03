import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/UI/button";
import { Plus, Trash2, Package } from "lucide-react";
import { Input } from "@/components/UI/input";
import SelectRemainsModal from "../SelectRemainsModal";
import { axiosAPI } from "@/services/axiosAPI";
import Barcode from "react-barcode";

interface ProductSelectionStepProps {
  formData: CreateTransferPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateTransferPayload>>;
}

const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({
  formData,
  setFormData
}) => {
  const [showRemainsModal, setShowRemainsModal] = useState(false);
  const [remainders, setRemainders] = useState<ProductRemainder[]>([]);
  const [openBarCodeModal, setOpenBarCodeModal] = useState("");
  const [selectedRemaindersList, setSelectedRemaindersList] = useState<ProductRemainder[]>([]);

  // Add selected remainders to transfer products
  const handleSelectRemainders = () => {
    const newProducts: TransferProduct[] = selectedRemaindersList.map((remainder, index) => ({
      row_number: formData.products.length + index + 1,
      bar_code: remainder.bar_code,
      product: remainder.product,
      product_type: remainder.product_type.id,
      size: remainder.size.id,
      unit: remainder.unit.id,
      price: remainder.price,
      quantity: 1, // Default quantity
      remaining_quantity: remainder.remaining_quantity,
      summa: remainder.price * 1,
      description: ""
    }));

    setFormData(prev => ({
      ...prev,
      products: [...prev.products, ...newProducts]
    }));

    setSelectedRemaindersList([]);
    setShowRemainsModal(false);
  };

  // Remove product from list
  const handleRemoveProduct = (index: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index)
    }));
  };

  // Update product quantity
  const handleQuantityChange = (index: number, quantity: number) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index
          ? { ...product, quantity, summa: product.price * quantity }
          : product
      )
    }));
  };

  // Update product size
  const handleSizeChange = (index: number, size: string) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.map((product, i) =>
        i === index
          ? { ...product, size }
          : product
      )
    }));
  };

  // Calculate total summa
  const totalSumma = formData.products.reduce((total, product) => total + product.summa, 0);

  // API Requests
  const getRemainders = useCallback(async () => {
    try {
      const response = await axiosAPI.post("remainders/warehouses/", {
        warehouse: formData.from_warehouse,
        date: new Date().toISOString(),
      });
      setRemainders(response.data);
    } catch (error) {
      console.error("Qoldiqlarni olishda xatolik:", error);
    }
  }, [formData.from_warehouse]);

  useEffect(() => {
    getRemainders()
  }, [getRemainders])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            O'tkaziladigan tovarlarni tanlang
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Qoldiq tovarlar ro'yxatidan kerakli tovarlarni tanlang
          </p>
        </div>
        <Button
          onClick={() => setShowRemainsModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          Tovar qo'shish
        </Button>
      </div>

      {/* Products List */}
      {formData.products.length > 0 ? (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">
              Tanlangan tovarlar ({formData.products.length})
            </h4>

            <div className="space-y-3">
              {formData.products.map((product, index) => (
                <div key={index} className="bg-white rounded-lg border p-4">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    {/* Product Info */}
                    <div className="md:col-span-2">
                      <p className="font-medium text-gray-900">{product.product.name.slice(0, 40) + "..."}</p>
                      <p className="text-sm text-gray-600">Shtrix kod: <span className="underline hover:text-blue-500 cursor-pointer" onClick={() => setOpenBarCodeModal(product.bar_code)}>{product.bar_code}</span></p>
                      <p className="text-sm text-gray-600">Narx: {product.price.toLocaleString()} UZS</p>
                    </div>

                    {/* Quantity Input */}
                    <div>
                      <label className="flex items-center gap-4 text-sm font-medium text-gray-700 mb-1">
                        Miqdor
                        <p className="text-xs text-gray-500 mt-1">
                          Max: {product.remaining_quantity}
                        </p>
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={product.remaining_quantity}
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 1)}
                        className="border-2 border-slate-200 w-full"
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        O'lcham
                      </label>
                      <Input
                        type="text"
                        disabled
                        value={remainders.find(r => r.bar_code === product.bar_code)?.size.name || product.size}
                        onChange={(e) => handleSizeChange(index, e.target.value)}
                        placeholder="O'lcham yozing..."
                        className="border-2 border-slate-200"
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {product.summa.toLocaleString()} UZS
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveProduct(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Jami summa:</span>
                <span className="text-xl font-bold text-blue-600">
                  {totalSumma.toLocaleString()} UZS
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            Hech qanday tovar tanlanmagan
          </h4>
          <p className="text-gray-600 mb-4">
            O'tkazish uchun tovarlarni tanlang
          </p>
          <Button
            onClick={() => setShowRemainsModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tovar qo'shish
          </Button>
        </div>
      )}
      {showRemainsModal &&
        selectedRemaindersList.length === 0 &&
        formData.products.length > 0 &&
        (() => {
          const alreadySelected = new Set(formData.products.map(p => p.bar_code));
          const preselected = remainders.filter(r => alreadySelected.has(r.bar_code));
          if (preselected.length) setSelectedRemaindersList(preselected);
          return null;
        })()
      }
      {/* Select Remains Modal */}
      {showRemainsModal && (
        <SelectRemainsModal
          remainders={remainders}
          selectedRemaindersList={selectedRemaindersList}
          setSelectedRemaindersList={setSelectedRemaindersList}
          onClose={() => {
            if (selectedRemaindersList.length > 0) {
              handleSelectRemainders();
            } else {
              setShowRemainsModal(false);
            }
          }}
        />
      )}

      {openBarCodeModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOpenBarCodeModal("")}>
          <div className="bg-white p-6 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setOpenBarCodeModal("")}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Shtrix kod</h2>
            {formData.products.length ? (
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

    </div>


  );
};

export default ProductSelectionStep;