import React, { useState } from "react";

interface RepeatableType {
    id: string;
    name: string;
}

interface ProductItem {
    row_number: number;
    bar_code: string;
    product_code: string;
    product?: RepeatableType;
    model?: RepeatableType;
    product_type?: RepeatableType;
    size?: RepeatableType;
    date_party: string;
    price: number;
    quantity: number;
    unit?: RepeatableType;
    summa: number;
}

interface PrintPageProps {
    products: ProductItem[];
    onClose: () => void;
}

const PrintPage: React.FC<PrintPageProps> = ({ products, onClose }) => {
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [printCounts, setPrintCounts] = useState<Record<number, number>>({});

    const toggleSelect = (index: number, bar_code: string, quantity: number) => {
        console.log(bar_code)
        setSelectedRows((prev) => {
            if (prev.includes(index)) {
                const updated = prev.filter((i) => i !== index);
                const newCounts = { ...printCounts };
                delete newCounts[index];
                setPrintCounts(newCounts);
                return updated;
            } else {
                setPrintCounts((prevCounts) => ({
                    ...prevCounts,
                    [index]: quantity,
                }));
                return [...prev, index];
            }
        });
    };

    const handleCountChange = (index: number, value: string, max: number) => {
        const newValue = Number(value);
        if (!selectedRows.includes(index)) {
            alert("⚠️ Avval chop etish uchun tovarni belgilang!");
            return;
        }
        if (newValue > max) {
            alert(`❗ Chop etish soni ${max} dan oshmasligi kerak.`);
            setPrintCounts((prev) => ({
                ...prev,
                [index]: max,
            }));
        } else {
            setPrintCounts((prev) => ({
                ...prev,
                [index]: newValue >= 0 ? newValue : 0,
            }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white w-[90%] max-w-6xl h-[80vh] rounded-xl shadow-lg overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-lg font-semibold">🖨️ Chop etish sahifasi</h2>
                    <button onClick={() => onClose()} className="text-4xl leading-none hover:text-gray-600 cursor-pointer">
                        &times;
                    </button>
                </div>

                {/* Jadval */}
                <div className="flex-1 overflow-auto p-4">
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="p-2 text-center">№</th>
                                <th className="p-2 text-center">Belgilash</th>
                                <th className="p-2 text-center">Tovar kodi</th>
                                <th className="p-2 text-center">Tovar nomi</th>
                                <th className="p-2 text-center">Tovar turi</th>
                                <th className="p-2 text-center">Model</th>
                                <th className="p-2 text-center">O‘lcham</th>
                                <th className="p-2 text-center">Birlik</th>
                                <th className="p-2 text-center">Soni</th>
                                <th className="p-2 text-center">Chop etish soni</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products?.map((item, index) => (
                                <tr
                                    key={index}
                                    className={`border-b border-slate-100 ${selectedRows.includes(index) ? "bg-blue-50" : ""
                                        }`}
                                >
                                    <td className="p-2 text-center">{index + 1}</td>
                                    <td className="p-2 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(index)}
                                            onChange={() =>
                                                toggleSelect(index, item.bar_code, item.quantity)
                                            }
                                            className="cursor-pointer size-4"
                                        />
                                    </td>
                                    <td className="p-2 text-center">{item.product_code}</td>
                                    <td className="p-2 text-center max-w-[150px] truncate">
                                        {item.product?.name}
                                    </td>
                                    <td className="p-2 text-center">{item.product_type?.name}</td>
                                    <td className="p-2 text-center">{item.model?.name}</td>
                                    <td className="p-2 text-center">{item.size?.name}</td>
                                    <td className="p-2 text-center">{item.unit?.name}</td>
                                    <td className="p-2 text-center">{item.quantity}</td>
                                    <td className="p-2 text-center">
                                        <input
                                            type="number"
                                            min={1}
                                            max={item.quantity}
                                            value={printCounts[index] || ""}
                                            disabled={!selectedRows.includes(index)}
                                            onChange={(e) =>
                                                handleCountChange(index, e.target.value, item.quantity)
                                            }
                                            className={`border rounded w-16 text-center ${!selectedRows.includes(index)
                                                ? "bg-gray-100 cursor-not-allowed text-gray-400"
                                                : "bg-white"
                                                }`}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                    >
                        Chiqish
                    </button>
                    <button
                        onClick={() => console.log(selectedRows)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
                    >
                        Chop etish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrintPage;
