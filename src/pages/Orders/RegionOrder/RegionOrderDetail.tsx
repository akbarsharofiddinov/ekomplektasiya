import React, { useState, useEffect } from 'react';
// import { FileText, User, MapPin, Calendar, Package, CheckCircle, Clock } from 'lucide-react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { Button } from '@/components/UI/button';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import AccordionDetails from '@mui/material/AccordionDetails';


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

const RegionOrderDetail: React.FC = () => {
  const [regionData, setRegionData] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
  console.log(documentTypes)
  // const [documentFormData, setDocumentFormData] = useState<{
  //   selectedDocumentType: string;
  //   filename: string;
  //   extension: string;
  //   fileBinary: string;
  // }>();

  const { id } = useParams();

  const fetchOrderDetail = async () => {
    try {
      const response = await axiosAPI.get(`region-orders/detail/${id}`);
      setRegionData(response.data[0]);
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

  if (!regionData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-red-600 text-xl">Маълумот топилмади</div>
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
              <p className="text-md font-semibold text-gray-800">{regionData.exit_number}</p>
            </div>

            <div className="text-center border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
              <p className="text-md font-semibold text-gray-800">
                {new Date(regionData.exit_date)
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

            <div className="text-center border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyat</p>
              <p className="text-md font-semibold text-gray-800">{regionData.to_region?.name}</p>
            </div>

            <div className="text-center border-gray-200">
              <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatdan qabul qiluvchi</p>
              <p className="text-md font-semibold text-gray-800">{regionData.sender_from_region?.name}</p>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Viloyat</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyurtma turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar nomi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni Tumandan</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni Sotuvdan</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Buyurtma bo'yicha izoh</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {regionData.products?.map((product, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.row_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium"></td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.order_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{product.product_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{product.model?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.size?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{product.unit?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{product.quantity}</td>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
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
              <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Bekor qilingan tovarlar ruyhati</Typography>
            </AccordionSummary>
            <AccordionDetails>


              <div className="bg-white rounded-xl mb-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">№</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Buyurtma turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar nomi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Tovar turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Model</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lcham</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">O'lchov birligi</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Soni</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Bekor qilish xolati</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">Bekor qilish jujjati</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {/* {regionData.cancelled_products?.map((cancelledproduct, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cancelledproduct.row_number}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cancelledproduct.order_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{cancelledproduct.product?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{cancelledproduct.product_type?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{cancelledproduct.model?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{cancelledproduct.size?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{cancelledproduct.unit?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{cancelledproduct.quantity}</td>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700"></th>
                          <td className="px-6 py-4 text-sm text-gray-900 text-right font-bold">{cancelledproduct.description}</td>
                        </tr>
                      ))} */}
                      <tr>
                        <td></td>
                      </tr>
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
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Xujjat turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Lavozim</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Javob turi</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Izox</th>
                      </tr>
                    </thead>
                    <tbody className=" bg-[#f2f2f2b6]">
                      {regionData.executors?.map((executor, index) => (
                        <tr key={index} className="hover:bg-indigo-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900"></td>
                          <td className="px-6 py-4 text-sm text-gray-900">{executor.status?.name}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-medium">{executor.executor?.name}</td>
                          {/* <td className="px-6 py-4 text-sm text-gray-900">{executor.executor_type?.name}</td> */}
                          {/* <td className="px-6 py-4 text-sm text-gray-900">{executor.position?.name}</td> */}
                          {/* <td className="px-6 py-4 text-sm text-gray-700">{executor.comment}</td> */}
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


      </div>
    </div>
  );
};

export default RegionOrderDetail;