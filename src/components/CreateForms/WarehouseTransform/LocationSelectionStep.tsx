import React from "react";
import { ArrowRight } from "lucide-react";
import FromLocationSelection from "./FromComponents/FromLocationSelection";
import ToLocationSelection from "./ToComponents/ToLocationSelection";
import { DatePicker } from "antd";
import dayjs from "dayjs";

interface LocationSelectionStepProps {
  formData: CreateTransferPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateTransferPayload>>;
}

const LocationSelectionStep: React.FC<LocationSelectionStepProps> = ({
  formData,
  setFormData
}) => {

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Yuboruvchi va qabul qiluvchi manzillarni tanlang
          </h3>
          <p className="text-gray-600 text-sm">
            Tovar qayerdan qayerga o'tkazilishini belgilang
          </p>
        </div>

        {/* Date picker */}
        <div className="flex items-center gap-6 w-72">
          <label className="block text-md font-medium text-gray-700 mb-1">
            Sana
          </label>
          <DatePicker value={dayjs(formData.date)} showTime placeholder="Sana tanlang" onChange={value => {
            setFormData(prev => ({ ...prev, date: value ? value.toISOString() : "" }))
          }} className="w-full" />
        </div>
      </div>



      <div className="flex justify-between gap-14">
        {/* FROM Section */}
        <FromLocationSelection formData={formData} setFormData={setFormData} />

        {/* Arrow */}
        <div className="hidden lg:flex items-center justify-center">
          <style>
            {`
              @keyframes arrow-slide-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(12px); }
              }
            `}
          </style>
          <ArrowRight
            className="w-8 h-8 text-blue-500"
            style={{ animation: "arrow-slide-x 1.2s ease-in-out infinite" }}
          />
        </div>

        {/* TO Section */}
        <ToLocationSelection formData={formData} setFormData={setFormData} />
      </div>
    </div>
  );
};

export default LocationSelectionStep;