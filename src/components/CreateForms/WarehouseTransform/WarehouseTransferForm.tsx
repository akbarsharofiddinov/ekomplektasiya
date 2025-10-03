import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/UI/button";
import { axiosAPI } from "@/services/axiosAPI";


// Step Components
import TransferTypeStep from "./TransferTypeStep";
import LocationSelectionStep from "./LocationSelectionStep";
import ProductSelectionStep from "./ProductSelectionStep";
import { toast } from "react-toastify";

interface IWarehouseTransferFormProps {
  setIsCreateFormModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCreateFormModalOpen: boolean;
}

const WarehouseTransferForm: React.FC<IWarehouseTransferFormProps> = ({
  setIsCreateFormModalOpen,
  isCreateFormModalOpen
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferTypes, setTransferTypes] = useState<ITypeOfGoods[]>([]);

  // Form data state
  const [formData, setFormData] = useState<CreateTransferPayload>({
    date: new Date().toISOString(),
    transfer_type: "",
    from_region: "",
    from_district: "",
    from_warehouse: "",
    from_responsible_person: "",
    to_region: "",
    to_district: "",
    to_warehouse: "",
    to_responsible_person: "",
    is_approved: false,
    products: []
  });

  // Step configuration
  const steps = [
    { title: "O'tkazma turi", component: TransferTypeStep },
    { title: "Asosiy ma'lumotlar", component: LocationSelectionStep },
    { title: "Tovarlar", component: ProductSelectionStep }
  ];

  const currentStepComponent = steps[currentStep]?.component;

  // Validation for each step
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!formData.transfer_type;
      case 1:
        return !!(
          formData.from_region &&
          formData.from_district &&
          formData.from_warehouse &&
          formData.from_responsible_person &&
          formData.to_region &&
          formData.to_district &&
          formData.to_warehouse &&
          formData.to_responsible_person
        );
      case 2:
        return formData.products.length > 0;
      default:
        return true;
    }
  };

  // Handle next step
  const handleNext = () => {
    if (!validateStep(currentStep)) {
      toast("Iltimos, barcha majburiy maydonlarni to'ldiring", { type: "warning" });
      return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast("Iltimos, barcha majburiy maydonlarni to'ldiring", { type: "warning" });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        products: formData.products.map(p => ({
          row_number: p.row_number,
          bar_code: p.bar_code,
          product: p.product.id,
          product_type: p.product_type,
          size: p.size,
          unit: p.unit,
          price: p.price,
          quantity: p.quantity,
          remaining_quantity: p.remaining_quantity,
          summa: p.summa,
          description: p.description
        })),
        date: new Date().toISOString(),
        is_approved: false
      };

      const response = await axiosAPI.post("transfers/create/", payload);

      if (response.status === 201 || response.status === 200) {
        toast("Transfer muvaffaqiyatli yaratildi", { type: "success" });
        setIsCreateFormModalOpen(false);
        // Refresh data if needed
      }
    } catch (error) {
      console.error("Transfer yaratishda xatolik:", error);
      toast.error("Transfer yaratishda xatolik yuz berdi");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isCreateFormModalOpen) {
      // Reset form data when modal is closed
      setFormData({
        date: new Date().toISOString(),
        transfer_type: "",
        from_region: "",
        from_district: "",
        from_warehouse: "",
        from_responsible_person: "",
        to_region: "",
        to_district: "",
        to_warehouse: "",
        to_responsible_person: "",
        is_approved: false,
        products: []
      });
    }
  }, [isCreateFormModalOpen])

  return (
    <div>
      <div className="bg-white rounded-lg shadow-xl w-full h-[85vh] max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex flex-col">
            <h2 className="text-xl font-semibold text-gray-900">
              Yangi Transfer Yaratish
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {steps[currentStep]?.title} - Qadam {currentStep + 1}/{steps.length}
            </p>
          </div>
          <button
            onClick={() => setIsCreateFormModalOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                  ${index === currentStep
                    ? 'bg-blue-600 text-white'
                    : index < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {index < currentStep ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${index === currentStep ? 'text-blue-600' :
                    index < currentStep ? 'text-green-600' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${index < currentStep ? 'bg-green-600' : 'bg-gray-200'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentStepComponent && React.createElement(currentStepComponent, {
            formData,
            setFormData,
            transferTypes,
            setTransferTypes,
          })}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Orqaga
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsCreateFormModalOpen(false)}
            >
              Bekor qilish
            </Button>

            {currentStep < steps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                Davom etish
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Yaratilmoqda...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Transfer yaratish
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarehouseTransferForm;
