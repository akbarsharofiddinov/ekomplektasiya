import React, { useState, useEffect } from 'react';
// import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { EllipsisVertical, Plus, Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';
import { Select } from 'antd';


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

const RepublicOrderDetail: React.FC = () => {
  const [orderData, setOrderData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
  const [documentFormData, setDocumentFormData] = useState<{
    selectedDocumentType: string;
    filename: string;
    extension: string;
    fileBinary: string;
  }>();

  const { id } = useParams();

  const fetchOrderDetail = async () => {
    try {
      const response = await axiosAPI.get(`republic-orders/detail/${id}`);
      setOrderData(response.data[0]);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDocumentTypesList = async () => {
    try {
      const response = await axiosAPI.get('enumerations/document_types');
      setDocumentTypes(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchOrderDetail();
    fetchDocumentTypesList();
  }, []);

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
        <div className="text-red-600 text-xl">Malumotlar topilmadi</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-2 px-2 bg-white">
      <div className="max-w-8xl mx-auto bg-white">
        {/* Header */}
        <div className="bg-white mb-6 overflow-hidden">
          <div className="flex items-center justify-between p-4">
            <div className="text-center border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish</p>
              <p className="text-md font-semibold text-gray-800">{orderData.exit_number}</p>
            </div>

            <div className="text-center border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
              <p className="text-md font-semibold text-gray-800">
              {new Date(orderData.exit_date)
                            .toLocaleString('uz-UZ', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                            .replace(',', '. ')}
              </p>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatdan</p>
              <p className="text-md font-semibold text-gray-800">{orderData.from_region?.name}</p>
            </div>

            <div className="text-center border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Respublikada qabul qiluvchi</p>
              <p className="text-md font-semibold text-gray-800">{orderData.sender_from_region?.name}</p>
            </div>

          </div>
        </div>

        <div>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Buyurtma uchun berilgan tovarlar ruyhati</Typography>
            </AccordionSummary>
            <AccordionDetails>

              <div className="bg-transparent rounded-md p-2 flex justify-between mb-6">
                <div className='flex items-center gap-3'>
                  <Button className='cursor-pointer'>
                    <Plus></Plus>
                    Kiritish
                  </Button>
                  <Button className='cursor-pointer'>
                    Qoldiqlar
                  </Button>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">tovar nomi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Buyurtma bo'yicha izoh</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.products?.map((product, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.row_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.model?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.quantity}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.description}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </AccordionDetails>
          </Accordion>
        </div>


        <div>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Kelishuvchilar ruyhati</Typography>
            </AccordionSummary>
            <AccordionDetails>


              <div className="bg-transparent rounded-md p-2 flex justify-between mb-6">
                <div className='flex items-center gap-3'>
                  <Button className='cursor-pointer'>
                    <Plus></Plus>
                    Kiritish
                  </Button>
                  <Button className='cursor-pointer'>
                    Yuborish
                  </Button>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajaruvchi xodim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Javob turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Izoh qoldiring</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.executors?.map((executor, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-700"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </AccordionDetails>
          </Accordion>
        </div>
        
        <div>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Usti xat quyuvchi xodimlar</Typography>
            </AccordionSummary>
            <AccordionDetails>


              <div className="bg-transparent rounded-md p-2 flex justify-between mb-6">
                <div className='flex items-center gap-3'>
                  <Button className='cursor-pointer'>
                    <Plus></Plus>
                    Kiritish
                  </Button>
                  <Button className='cursor-pointer'>
                    Yuborish
                  </Button>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xodim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sana</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.executors?.map((executor, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </AccordionDetails>
          </Accordion>
        </div>

        <div>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
            >
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Ijrochilar ruyxati</Typography>
            </AccordionSummary>
            <AccordionDetails>


              <div className="bg-transparent rounded-md p-2 flex justify-between mb-6">
                <div className='flex items-center gap-3'>
                  <Button className='cursor-pointer'>
                    <Plus></Plus>
                    Kiritish
                  </Button>
                  <Button className='cursor-pointer'>
                    Yuborish
                  </Button>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xabar xolati</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajaruvchi xodim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Usti xat biriktiruvchi xodim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Bajarilish muddati</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status obzor</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {orderData.executors?.map((executor, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-700"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </AccordionDetails>
          </Accordion>
        </div>

      </div>
    </div>
  );
};

export default RepublicOrderDetail;