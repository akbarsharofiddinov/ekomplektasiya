/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Radio } from "antd";
import React, { useEffect, useState } from "react";
import { axiosAPI } from "@/services/axiosAPI";

interface TransferTypeStepProps {
  formData: CreateTransferPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateTransferPayload>>;
  transferTypes: ITypeOfGoods[];
  setTransferTypes: React.Dispatch<React.SetStateAction<ITypeOfGoods[]>>;
}

const TransferTypeStep: React.FC<TransferTypeStepProps> = ({
  formData,
  setFormData,
  transferTypes,
  setTransferTypes,
}) => {

  const [loading, setLoading] = useState(true);

  // Get transfer types
  const getTransferTypes = async () => {
    try {
      setLoading(true);
      const response = await axiosAPI.get("transfers/transfer_types");
      setTransferTypes(response.data);
    } catch (error) {
      console.error("Transfer turlarini olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTransferTypes();
  }, []);

  const handleTransferTypeChange = (e: any) => {
    const selectedType = transferTypes.find(type => type.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      transfer_type: selectedType?.id || ""
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Transfer turlari yuklanmoqda...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          O'tkazma turini tanlang
        </h3>
        <p className="text-gray-600 text-sm">
          Quyidagi turlardan birini tanlang
        </p>
      </div>

      {transferTypes.length > 0 ? (
        <Radio.Group
          className="w-full"
          value={formData.transfer_type}
          onChange={handleTransferTypeChange}
        >
          <div className="grid gap-4">
            {transferTypes.map((type) => (
              <div
                key={type.id}
                className={`
                  border rounded-lg p-4 cursor-pointer transition-all duration-200
                  ${formData.transfer_type === type.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Radio value={type.id} className="w-full">
                  <div className="ml-2">
                    <div className="font-medium text-gray-900">{type.name}</div>
                  </div>
                </Radio>
              </div>
            ))}
          </div>
        </Radio.Group>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">Transfer turlari topilmadi</p>
        </div>
      )}
    </div>
  );
};

export default TransferTypeStep;