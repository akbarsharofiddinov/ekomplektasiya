
// function DistrictOrderDetail() {
//   return (
//     <div>DistrictOrderDetail</div>
//   )
// }

// export default DistrictOrderDetail

import React, { useState, useEffect } from 'react';
import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';


interface IdName {
    id: string;
    name: string;
}

interface Product {
    row_number: number;
    product: IdName;
    model: IdName;
    product_type: IdName;
    size: IdName;
    unit: IdName;
    quantity: number;
    order_type: IdName;
    description: string;
}

interface Executor {
    executor: IdName;
    status: IdName;
    message: string;
    confirmation_date: string;
}

interface OrderDetail {
    id: string;
    exit_number: string;
    exit_date: string;
    type_document_for_filter: IdName;
    application_status_district: IdName;
    confirmation_date: string;
    is_approved: boolean;
    user: string;
    description: string;
    from_district: IdName;
    sender_from_district: IdName;
    to_region: IdName;
    recipient_region: IdName;
    from_region: IdName;
    sender_from_region: IdName;
    to_district: IdName;
    recipient_district: IdName;
    products: Product[];
    executors: Executor[];
}

const DistrictOrderDetail: React.FC = () => {
    const [orderData, setOrderData] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const { id } = useParams();

    const fetchOrderDetail = async () => {
        try {
            const response = await axiosAPI.get(`district-orders/detail/${id}`);    
            console.log(response)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchOrderDetail();
    }, []);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Кўрсатилмаган';
        const date = new Date(dateString);
        return date.toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'юборилган':
                return 'bg-blue-100 text-blue-800';
            case 'буюртма ёзилди':
                return 'bg-yellow-100 text-yellow-800';
            case 'тасдиқланди':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
        );
    }

    if (!orderData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-red-600 text-xl">Маълумот топилмади</div>
            </div>
        );
    }

    console.log(orderData)

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
                    {/* 

                    <div>
                        <h1>Chiqish N</h1>
                        {orderData.exit_number}
                    </div>
                    <div>
                        <h1>Chiqish sana</h1>
                        {orderData.exit_number}
                    </div>
                    <div>
                        <h1>Chiqish N</h1>
                        {orderData.exit_number}
                    </div>
                    <div>
                        <h1>Chiqish N</h1>
                        {orderData.exit_number}
                    </div>
                    <div>
                        <h1>Chiqish N</h1>
                        {orderData.exit_number}
                    </div> */}

                    <p><strong>ID:</strong> {orderData.id}</p>
                    <p><strong>Raqam:</strong> {orderData.exit_number}</p>
                    <p><strong>Sana:</strong> {orderData.exit_date}</p>
                    <p><strong>Holat:</strong> {orderData.application_status_district?.name}</p>
                    <p><strong>Kimdan:</strong> {orderData.from_district?.name}</p>
                    <p><strong>Kimga:</strong> {orderData.recipient_district?.name}</p>
                    <p><strong>Viloyat:</strong> {orderData.from_region?.name}</p>

                    {/* <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Буюртма тафсилотлари</h1>
                                <p className="text-indigo-100 flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    {orderData.exit_number}
                                </p>
                            </div>
                            <div className="text-right">
                                <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(orderData.application_status_district?.name)}`}>
                                </div>
                            </div>
                        </div>
                    </div> */}



                    {/* <div className="p-6 grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Chiqish N</p>
                                    <p className="font-semibold text-gray-900">{formatDate(orderData.exit_number)}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <Calendar className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Chiqish sana</p>
                                    <p className="font-semibold text-gray-900">{formatDate(orderData.exit_date)}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <FileText className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Ҳужжат тури</p>
                                    <p className="font-semibold text-gray-900">{orderData.type_document_for_filter?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Қайси туман</p>
                                    <p className="font-semibold text-gray-900">{orderData.from_district?.name}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Юборувчи</p>
                                    <p className="font-semibold text-gray-900">{orderData.sender_from_district?.name}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Қабул қилувчи</p>
                                    <p className="font-semibold text-gray-900">{orderData.recipient_district?.name || 'Кўрсатилмаган'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <MapPin className="w-5 h-5 text-indigo-600 mt-1" />
                                <div>
                                    <p className="text-sm text-gray-600">Вилоят</p>
                                    <p className="font-semibold text-gray-900">{orderData.from_region?.name}</p>
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>

                {/* Products Table */}
                <div className="bg-white rounded-2xl shadow-xl mb-6 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                        <h2 className="text-2xl font-bold flex items-center gap-2">
                            <Package className="w-6 h-6" />
                            Маҳсулотлар рўйхати
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-indigo-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Маҳсулот тури</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Модел</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ўлчам</th>
                                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Миқдор</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Ўлчов бирлиги</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orderData.products?.map((product, index) => (
                                    <tr key={index} className="hover:bg-indigo-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.row_number}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900">{product.product_type?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.model?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.quantity}</td>
                                        <td className="px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t-2 border-indigo-200">
                                <tr>
                                    <td colSpan={4} className="px-6 py-4 text-right text-sm font-bold text-gray-900">Жами:</td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-indigo-600">
                                        {orderData.products?.reduce((sum, p) => sum + p.quantity, 0)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-700">Дона</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Executors */}
                {orderData.executors && orderData.executors.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <CheckCircle className="w-6 h-6" />
                                Ижрочилар
                            </h2>
                        </div>

                        <div className="p-6 space-y-4">
                            {orderData.executors.map((executor, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{executor.executor?.name}</p>
                                            <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
                                                <Clock className="w-4 h-4" />
                                                {executor.confirmation_date ? formatDate(executor.confirmation_date) : 'Тасдиқланмаган'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(executor.status?.name)}`}>
                                        {executor.status?.name}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DistrictOrderDetail;