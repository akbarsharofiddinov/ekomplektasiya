/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, XCircle, Clock, Package, User, MapPin, Calendar, Truck, Edit, Trash2, Printer, ChevronDown, Plus, Save, X } from 'lucide-react';
import { Button } from '@/components/UI/button';
import { Badge } from '@/components/UI/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/UI/table';
import { DatePicker, Input, Select } from 'antd';
import { axiosAPI } from '@/services/axiosAPI';
import { toast } from "react-toastify"
import { useAppSelector } from '@/store/hooks/hooks';
import Barcode from 'react-barcode';
import dayjs from 'dayjs';

interface TransferState {
  id: string;
  number: string;
  date: string;
  user: NamedEntity;
  transfer_type: string;
  from_region: NamedEntity;
  from_district: NamedEntity;
  from_warehouse: NamedEntity;
  from_responsible_person: NamedEntity;
  to_region: NamedEntity;
  to_district: NamedEntity;
  to_warehouse: NamedEntity;
  to_responsible_person: NamedEntity;
  is_approved: boolean;
  is_accepted: boolean;
  sent_for_approval: boolean;
  products: TransferProduct[];
}

const WarehouseTransferDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [openBarCodeModal, setOpenBarCodeModal] = useState<string>("");
  const [transferDetail, setTransferDetail] = useState<TransferState | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // const [saving, setSaving] = useState(false);

  // Accordion states
  const [isFromSectionOpen, setIsFromSectionOpen] = useState(true);
  const [isToSectionOpen, setIsToSectionOpen] = useState(true);
  const [isAdditionalInfoOpen, setIsAdditionalInfoOpen] = useState(true);
  const [isProductsOpen, setIsProductsOpen] = useState(true);

  // Product selection modal
  // const [showProductModal, setShowProductModal] = useState(false);
  // const [warehouseProducts, setWarehouseProducts] = useState<WarehouseProduct[]>([]);
  // const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  // const [productLoading, setProductLoading] = useState(false);

  // Edit form data
  const [editData, setEditData] = useState<TransferState | null>(null);

  // Options data
  const [regions, setRegions] = useState<NamedEntity[]>([]);
  const [districts, setDistricts] = useState<NamedEntity[]>([]);
  const [warehouses, setWarehouses] = useState<NamedEntity[]>([]);
  const [transferTypes, setTransferTypes] = useState<NamedEntity[]>([]);

  const { currentUserInfo } = useAppSelector(state => state.info);

  // Fetch transfer detail
  const getTransferDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await axiosAPI.get(`transfers/detail/${id}/`);
      const data = response.data[0];
      setTransferDetail(data);
      setEditData(data);
      // setSelectedProducts(data.products?.map((p: TransferProduct) => p.bar_code) || []);
    } catch (error) {
      console.error('Transfer ma\'lumotlarini olishda xatolik:', error);
      toast.error('Transfer ma\'lumotlarini yuklashda xatolik yuz berdi');
      navigate('/warehouse-transfer');
    } finally {
      setLoading(false);
    }
  };

  const getTransferTypes = async () => {
    try {
      const response = await axiosAPI.get("transfers/transfer_types");
      if (response.status === 200) {
        setTransferTypes(response.data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  // Fetch warehouse products
  const getWarehouseProducts = async () => {
    if (!transferDetail?.from_warehouse?.id) return;

    try {
      // setProductLoading(true);
      const response = await axiosAPI.get(`warehouse-products/${transferDetail.from_warehouse.id}/`);
      console.log(response)
      // setWarehouseProducts(response.data);
    } catch (error) {
      console.error('Ombor mahsulotlarini olishda xatolik:', error);
      toast.error('Ombor mahsulotlarini yuklashda xatolik yuz berdi');
    } finally {
      // setProductLoading(false);
    }
  };

  // Fetch options
  const fetchOptions = async () => {
    try {
      const [regionsRes, warehousesRes] = await Promise.all([
        axiosAPI.get('regions/list/'),
        axiosAPI.get('warehouses/list/')
      ]);

      setRegions(regionsRes.data);
      setWarehouses(warehousesRes.data);
    } catch (error) {
      console.error('Options yuklashda xatolik:', error);
    }
  };

  // Remove product from transfer
  const handleRemoveProduct = (productId: string) => {
    if (editData) {
      setEditData({
        ...editData,
        products: editData.products?.filter((p: TransferProduct) => p.bar_code !== productId) || []
      });
    }
  };

  // Update product in transfer
  const handleUpdateProduct = (productId: string, field: string, value: any) => {
    if (editData) {
      const updatedProducts = editData.products?.map(p => {
        if (p.bar_code === productId) {
          const updatedProduct = { ...p, [field]: value };
          if (field === 'quantity' || field === 'price') {
            updatedProduct.summa = (updatedProduct.quantity || 0) * (updatedProduct.price || 0);
          }
          return updatedProduct;
        }
        return p;
      }) || [];

      setEditData({
        ...editData,
        products: updatedProducts
      });
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditData(transferDetail);
    setIsEditing(false);
  };

  // Start editing
  const handleStartEdit = () => {
    setIsEditing(true);
    fetchOptions();
  };

  // Approve transfer
  const handleApprove = async () => {
    if (!transferDetail) return;

    try {
      setActionLoading(true);
      const response = await axiosAPI.patch(`transfers/${transferDetail.id}/approve/`);

      if (response.status === 200) {
        toast.success('Transfer tasdiqlandi!');
        setTransferDetail(prev => prev ? { ...prev, is_approved: true } : null);
      }
    } catch (error) {
      console.error('Transfer tasdiqlashda xatolik:', error);
      toast.error('Transfer tasdiqlashda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  // Accept transfer
  const handleAccept = async () => {
    if (!transferDetail) return;

    try {
      setActionLoading(true);
      const response = await axiosAPI.patch(`transfers/${transferDetail.id}/accept/`);

      if (response.status === 200) {
        toast('Transfer qabul qilindi!', { type: 'success', autoClose: 2000 });
        setTransferDetail(prev => prev ? { ...prev, is_accepted: true } : null);
      }
    } catch (error) {
      console.error('Transfer qabul qilishda xatolik:', error);
      toast.error('Transfer qabul qilishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject transfer
  const handleReject = async () => {
    if (!transferDetail) return;

    try {
      setActionLoading(true);
      const response = await axiosAPI.patch(`transfers/${transferDetail.id}/reject/`);

      if (response.status === 200) {
        toast.success('Transfer rad etildi!');
        setTransferDetail(prev => prev ? { ...prev, is_approved: false, is_accepted: false } : null);
      }
    } catch (error) {
      console.error('Transfer rad etishda xatolik:', error);
      toast.error('Transfer rad etishda xatolik yuz berdi');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete transfer
  const handleDelete = async () => {
    if (!transferDetail) return;

    const confirmDelete = window.confirm('Bu transferni o\'chirishni xohlaysizmi?');
    if (!confirmDelete) return;

    try {
      setActionLoading(true);
      const response = await axiosAPI.delete(`transfers/delete/${transferDetail.id}/`);

      if (response.status === 204) {
        toast('Transfer muvaffaqiyatli o\'chirildi!', { type: 'success', autoClose: 2000 });
        navigate('/transfers');
      }
    } catch (error) {
      console.error('Transfer o\'chirishda xatolik:', error);
      toast("Transferni o'chirishda xatolik yuz berdi", { type: 'error', autoClose: 2000 });
    } finally {
      setActionLoading(false);
    }
  };

  // Print transfer
  const handlePrint = () => {
    if (!transferDetail) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transfer - ${transferDetail.number}</title>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #333;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #1E56A0;
              padding-bottom: 15px;
            }
            .header h1 {
              color: #1E56A0;
              margin: 0;
              font-size: 24px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin: 20px 0;
            }
            .info-section {
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .info-section h3 {
              margin: 0 0 10px 0;
              color: #1E56A0;
              font-size: 16px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 8px 0;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              color: #666;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              font-size: 12px;
            }
            th, td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left;
            }
            th { 
              background-color: #1E56A0; 
              color: white;
              font-weight: bold;
            }
            tr:nth-child(even) { 
              background-color: #f9f9f9; 
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
            }
            .status {
              display: inline-block;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: bold;
            }
            .status-approved-accepted { 
              background-color: #dcfce7; 
              color: #166534; 
            }
            .status-approved-not-accepted { 
              background-color: #fef3c7; 
              color: #92400e; 
            }
            .status-not-approved { 
              background-color: #fee2e2; 
              color: #991b1b; 
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>E-KOMPLEKTATSIYA</h1>
            <h2>Ombordan Omborga Transfer</h2>
            <p><strong>Hujjat №:</strong> ${transferDetail.number}</p>
          </div>
          
          <div class="info-grid">
            <div class="info-section">
              <h3>Yuboruvchi ma'lumotlari</h3>
              <div class="info-row">
                <span class="info-label">Viloyat:</span>
                <span>${transferDetail.from_region?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tuman:</span>
                <span>${transferDetail.from_district?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ombor:</span>
                <span>${transferDetail.from_warehouse?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mas'ul shaxs:</span>
                <span>${transferDetail.from_responsible_person?.name || 'N/A'}</span>
              </div>
            </div>
            
            <div class="info-section">
              <h3>Qabul qiluvchi ma'lumotlari</h3>
              <div class="info-row">
                <span class="info-label">Viloyat:</span>
                <span>${transferDetail.to_region?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tuman:</span>
                <span>${transferDetail.to_district?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Ombor:</span>
                <span>${transferDetail.to_warehouse?.name || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Mas'ul shaxs:</span>
                <span>${transferDetail.to_responsible_person?.name || 'N/A'}</span>
              </div>
            </div>
          </div>

          <div class="info-section">
            <h3>Transfer ma'lumotlari</h3>
            <div class="info-row">
              <span class="info-label">Sana:</span>
              <span>${new Date(transferDetail.date).toLocaleString('uz-UZ')}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Transfer turi:</span>
              <span>${transferDetail.transfer_type || 'N/A'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Holat:</span>
              <span class="status ${transferDetail.is_approved && transferDetail.is_accepted ? 'status-approved-accepted' :
        transferDetail.is_approved && !transferDetail.is_accepted ? 'status-approved-not-accepted' : 'status-not-approved'}">
                ${transferDetail.is_approved && transferDetail.is_accepted ? 'Tasdiqlangan va Qabul qilingan' :
        transferDetail.is_approved && !transferDetail.is_accepted ? 'Tasdiqlangan, Kutilmoqda' : 'Tasdiqlanmagan'}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Foydalanuvchi:</span>
              <span>${transferDetail.user?.name || 'N/A'}</span>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>№</th>
                <th>Shtrix kod</th>
                <th>Tovar nomi</th>
                <th>Tovar turi</th>
                <th>O'lcham</th>
                <th>Miqdor</th>
                <th>O'lchov birligi</th>
                <th>Narx</th>
                <th>Summa</th>
                <th>Izoh</th>
              </tr>
            </thead>
            <tbody>
              ${transferDetail.products?.map((product, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td>${product.bar_code || 'N/A'}</td>
                  <td>${product.product?.name || 'N/A'}</td>
                  <td>${product.product_type || 'N/A'}</td>
                  <td>${product.size || 'N/A'}</td>
                  <td>${product.quantity || 0}</td>
                  <td>${product.unit || 'N/A'}</td>
                  <td>${(product.price || 0).toLocaleString()} UZS</td>
                  <td>${(product.summa || 0).toLocaleString()} UZS</td>
                  <td>${product.description || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr style="background-color: #f3f4f6; font-weight: bold;">
                <td colspan="8" style="text-align: right;">JAMI:</td>
                <td>${(transferDetail.products?.reduce((acc, product) => acc + (product.summa || 0), 0) || 0).toLocaleString()} UZS</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
          
          <div class="footer">
            <p>Jami: ${transferDetail.products?.length || 0} ta tovar | Umumiy summa: ${(transferDetail.products?.reduce((acc, product) => acc + (product.summa || 0), 0) || 0).toLocaleString()} UZS</p>
            <p>Chop etilgan: ${new Date().toLocaleDateString('uz-UZ')} ${new Date().toLocaleTimeString('uz-UZ')}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusInfo = () => {
    if (!transferDetail) return { text: '', color: '', icon: XCircle };

    if (transferDetail.is_approved && transferDetail.is_accepted) {
      return {
        text: 'Tasdiqlangan va Qabul qilingan',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        icon: CheckCircle
      };
    } else if (transferDetail.is_approved && !transferDetail.is_accepted) {
      return {
        text: 'Tasdiqlangan, Qabul kutilmoqda',
        color: 'bg-amber-50 text-amber-800 border-amber-200',
        icon: Clock
      };
    } else {
      return {
        text: 'Tasdiqlanmagan',
        color: 'bg-red-50 text-red-800 border-red-200',
        icon: XCircle
      };
    }
  };

  const canApprove = () => {
    return !transferDetail?.is_approved && currentUserInfo?.type_user === 'admin';
  };

  const canAccept = () => {
    return transferDetail?.is_approved && !transferDetail?.is_accepted &&
      currentUserInfo?.warehouse?.id === transferDetail?.to_warehouse?.id;
  };

  const canEdit = () => {
    return !transferDetail?.is_approved && currentUserInfo?.id === transferDetail?.user?.id;
  };

  const canDelete = () => {
    return !transferDetail?.is_approved &&
      (currentUserInfo?.type_user === 'admin' || currentUserInfo?.id === transferDetail?.user?.id);
  };

  // API Requests - fetch datas
  const getDistricts = async () => {
    try {
      const response = await axiosAPI.get(`districts/list/?region=${editData?.to_region.name}`);
      setDistricts(response.data);
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    getDistricts()
  }, [editData?.to_region])

  useEffect(() => {
    getTransferDetail();
  }, [id]);

  useEffect(() => {
    if (transferDetail?.from_warehouse?.id) {
      getWarehouseProducts();
    }
  }, [transferDetail?.from_warehouse?.id]);

  useEffect(() => {
    getTransferTypes()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-gray-600">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          Transfer ma'lumotlari yuklanmoqda...
        </div>
      </div>
    );
  }

  if (!transferDetail) {
    return (
      <div className="text-center py-12">
        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Transfer topilmadi
        </h3>
        <p className="text-gray-600 mb-4">
          So'ralgan transfer mavjud emas yoki o'chirilgan
        </p>
        <Button onClick={() => navigate('/warehouse-transfer')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Orqaga qaytish
        </Button>
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const currentData = isEditing ? editData : transferDetail;

  return (
    <div className="space-y-2 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/warehouse-transfer')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Orqaga
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Transfer #{transferDetail.number}
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date(transferDetail.date).toLocaleString('uz-UZ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className={`${statusInfo.color} flex items-center gap-2 px-3 py-2 text-sm font-medium`}>
              <StatusIcon className="w-4 h-4" />
              {statusInfo.text}
            </Badge>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Chop etish
              </Button>

              {isEditing ? (
                <>
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Saqlash
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Bekor qilish
                  </Button>
                </>
              ) : (
                <>
                  {canEdit() && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleStartEdit}
                    >
                      <Edit className="w-4 h-4" />
                      Tahrirlash
                    </Button>
                  )}

                  {canDelete() && (
                    <Button
                      variant="outline"
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                      O'chirish
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {!isEditing && (canApprove() || canAccept()) && (
          <div className="flex items-center gap-3 pt-4 border-t">
            {canApprove() && (
              <Button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {actionLoading ? 'Tasdiqlanmoqda...' : 'Tasdiqlash'}
              </Button>
            )}

            {canAccept() && (
              <Button
                onClick={handleAccept}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                {actionLoading ? 'Qabul qilinmoqda...' : 'Qabul qilish'}
              </Button>
            )}

            <Button
              onClick={handleReject}
              disabled={actionLoading}
              variant="outline"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" />
              {actionLoading ? 'Rad etilmoqda...' : 'Rad etish'}
            </Button>
          </div>
        )}
      </div>

      {/* Transfer Info with Accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* From Section - Accordion */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsFromSectionOpen(!isFromSectionOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Yuboruvchi ma'lumotlari
              </h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isFromSectionOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${isFromSectionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Viloyat</p>
                  <p className="font-medium text-gray-900">{currentData?.from_region?.name || 'Belgilanmagan'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tuman</p>
                  <p className="font-medium text-gray-900">{currentData?.from_district?.name || 'Belgilanmagan'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Ombor</p>
                  <p className="font-medium text-gray-900">{currentData?.from_warehouse?.name || 'Belgilanmagan'}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Mas'ul shaxs</p>
                  <p className="font-medium text-gray-900">{currentData?.from_responsible_person?.name || 'Belgilanmagan'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* To Section - Accordion with Edit */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <button
            onClick={() => setIsToSectionOpen(!isToSectionOpen)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-300"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <h3 className="text-lg font-semibold text-gray-900">
                Qabul qiluvchi ma'lumotlari
              </h3>
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isToSectionOpen ? 'rotate-180' : ''
                }`}
            />
          </button>

          <div
            className={`transition-all duration-300 ease-in-out overflow-hidden ${isToSectionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              }`}
          >
            <div className="px-4 pb-4 space-y-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Viloyat</p>
                  {isEditing ? (
                    <Select
                      className="w-full mt-1"
                      placeholder="Viloyatni tanlang"
                      value={editData?.to_region?.name}
                      onChange={(value) => {
                        const region = regions.find(r => r.id === value);
                        if (editData && region) {
                          setEditData({
                            ...editData,
                            to_region: region,
                            to_district: { id: '', name: '' }
                          });
                        }
                      }}
                      options={regions.map(region => ({
                        value: region.id,
                        label: region.name
                      }))}
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{currentData?.to_region?.name || 'Belgilanmagan'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Tuman</p>
                  {isEditing ? (
                    <Select
                      className="w-full mt-1"
                      placeholder="Tumanni tanlang"
                      value={editData?.to_district?.name || null}
                      onChange={(value) => {
                        const district = districts.find(d => d.id === value);
                        if (editData && district) {
                          setEditData({
                            ...editData,
                            to_district: district
                          });
                        }
                      }}
                      options={districts.map(district => ({
                        value: district.id,
                        label: district.name
                      }))}
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{currentData?.to_district?.name || 'Belgilanmagan'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Ombor</p>
                  {isEditing ? (
                    <Select
                      className="w-full mt-1"
                      placeholder="Omborni tanlang"
                      value={editData?.to_warehouse?.name || null}
                      onChange={(value) => {
                        const warehouse = warehouses.find(w => w.id === value);
                        if (editData && warehouse) {
                          setEditData({
                            ...editData,
                            to_warehouse: warehouse
                          });
                        }
                      }}
                      options={warehouses.map(warehouse => ({
                        value: warehouse.id,
                        label: warehouse.name
                      }))}
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{currentData?.to_warehouse?.name || 'Belgilanmagan'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Mas'ul shaxs</p>
                  {isEditing ? (
                    <Select
                      className="w-full mt-1"
                      placeholder="Mas'ul shaxsni tanlang"
                      value={editData?.to_responsible_person?.name}
                    />
                  ) : (
                    <p className="font-medium text-gray-900">{currentData?.to_responsible_person?.name || 'Belgilanmagan'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info - Accordion with Edit */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsAdditionalInfoOpen(!isAdditionalInfoOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-300"
        >
          <h3 className="text-lg font-semibold text-gray-900">
            Qo'shimcha ma'lumotlar
          </h3>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${isAdditionalInfoOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isAdditionalInfoOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="px-4 pb-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <Truck className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Transfer turi</p>
                  {isEditing ? (
                    <Select
                      className="w-full mt-1"
                      placeholder="Transfer turini tanlang"
                      value={editData?.transfer_type || undefined}
                      onChange={(value) => {
                        if (editData) {
                          setEditData({
                            ...editData,
                            transfer_type: value
                          });
                        }
                      }}
                    >
                      {transferTypes.map((type) => (
                        <Select.Option key={type.id} value={type.name}>
                          {type.name}
                        </Select.Option>
                      ))}
                    </Select>
                  ) : (
                    <Badge variant="outline" className="mt-1">
                      {currentData?.transfer_type || 'Belgilanmagan'}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Calendar className="w-6 h-6 text-gray-400" />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Sana</p>
                  {isEditing ? (
                    <DatePicker value={dayjs(editData?.date)} showTime placeholder="Sana tanlang" onChange={value => {
                      setEditData(prev => (prev ? { ...prev, date: value ? value.toISOString() : '' } : prev));
                    }} className="w-full" />
                  ) : (
                    <p className="font-medium text-gray-900">
                      {new Date(currentData?.date || '').toLocaleString('uz-UZ')}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <User className="w-6 h-6 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Yaratuvchi</p>
                  <p className="font-medium text-gray-900">{currentData?.user?.name || 'Belgilanmagan'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Table - Accordion with Edit */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsProductsOpen(!isProductsOpen)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-300"
        >
          <div className="flex items-center justify-between w-full mr-4">
            <h3 className="text-lg font-semibold text-gray-900">
              O'tkaziladigan tovarlar
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Jami: <span className="font-medium text-gray-900">{currentData?.products?.length || 0}</span></span>
              <span>Summa: <span className="font-medium text-green-600">{(currentData?.products?.reduce((acc, product) => acc + (product.summa || 0), 0) || 0).toLocaleString()} UZS</span></span>
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 ml-2 flex-shrink-0 transition-transform duration-300 ${isProductsOpen ? 'rotate-180' : ''
              }`}
          />
        </button>

        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${isProductsOpen ? '' : 'max-h-0 opacity-0'
            }`}
        >
          <div className="border-t border-gray-100">
            {/* Add Product Button */}
            {isEditing && (
              <div className="p-4 border-b border-gray-100">
                <Button
                  // onClick={() => setShowProductModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tovar qo'shish
                </Button>
              </div>
            )}

            <div className="max-h-[500px] overflow-auto">
              {/* <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-left font-semibold">№</TableHead>
                    <TableHead className="text-left font-semibold">Shtrix kod</TableHead>
                    <TableHead className="text-left font-semibold">Tovar nomi</TableHead>
                    <TableHead className="text-left font-semibold">Tovar turi</TableHead>
                    <TableHead className="text-left font-semibold">O'lcham</TableHead>
                    <TableHead className="text-left font-semibold">Miqdor</TableHead>
                    <TableHead className="text-left font-semibold">O'lchov birligi</TableHead>
                    <TableHead className="text-left font-semibold">Narx</TableHead>
                    <TableHead className="text-left font-semibold">Summa</TableHead>
                    <TableHead className="text-left font-semibold">Izoh</TableHead>
                    {isEditing && <TableHead className="text-left font-semibold">Amallar</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData?.products?.map((product, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <div
                            className="w-12 h-6 bg-slate-100 border border-slate-300 rounded flex items-center justify-center"
                            onClick={() => setOpenBarCodeModal(product.bar_code || "")}
                          >
                            <div className="w-8 h-3 bg-slate-300 rounded-sm flex products-center justify-center cursor-pointer">
                              {product.bar_code ? (
                                <Barcode
                                  value={product.bar_code}
                                  className="w-8 h-8"
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium text-gray-900 truncate" title={product.product?.name}>
                            {product.product?.name.slice(0, 20) + "..." || 'Belgilanmagan'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{product.product_type || 'N/A'}</TableCell>
                      <TableCell>{product.size || 'N/A'}</TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            type="number"
                            value={product.quantity || 0}
                            onChange={(e) => handleUpdateProduct(product.bar_code, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-20"
                            min="1"
                          />
                        ) : (
                          <span className="font-medium">{product.quantity || 0}</span>
                        )}
                      </TableCell>
                      <TableCell>{product.unit || 'N/A'}</TableCell>
                      <TableCell>
                        <span>{(product.price || 0).toLocaleString()} UZS</span>
                      </TableCell>
                      <TableCell className="font-medium text-green-600">
                        {(product.summa || 0).toLocaleString()} UZS
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Input
                            value={product.description || ''}
                            onChange={(e) => handleUpdateProduct(product.bar_code, 'description', e.target.value)}
                            placeholder="Izoh kiriting"
                            className="w-32"
                          />
                        ) : (
                          <span className={`${product.description ? 'text-gray-900' : 'text-gray-400'}`}>
                            {product.description || '—'}
                          </span>
                        )}
                      </TableCell>
                      {isEditing && (
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveProduct(product.bar_code)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )) || (
                      <TableRow>
                        <TableCell colSpan={isEditing ? 11 : 10} className="text-center py-8 text-gray-500">
                          Hech qanday tovar topilmadi
                        </TableCell>
                      </TableRow>
                    )}
                </TableBody>
              </Table> */}
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-left font-semibold">№</TableHead>
                    <TableHead className="text-left font-semibold">Shtrix kod</TableHead>
                    <TableHead className="text-left font-semibold">Tovar nomi</TableHead>
                    <TableHead className="text-left font-semibold">Tovar turi</TableHead>
                    <TableHead className="text-left font-semibold">O'lcham</TableHead>
                    <TableHead className="text-left font-semibold">Miqdor</TableHead>
                    <TableHead className="text-left font-semibold">O'lchov birligi</TableHead>
                    <TableHead className="text-left font-semibold">Narx</TableHead>
                    <TableHead className="text-left font-semibold">Summa</TableHead>
                    <TableHead className="text-left font-semibold">Izoh</TableHead>
                    {isEditing && <TableHead className="text-left font-semibold">Amallar</TableHead>}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {currentData?.[0]?.products?.length > 0 ? (
                    currentData[0].products.map((product, index) => (
                      <TableRow key={index} className="hover:bg-gray-50">
                        <TableCell className="font-medium">{index + 1}</TableCell>

                        {/* 🔹 Shtrix kod */}
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            <div
                              className="w-12 h-6 bg-slate-100 border border-slate-300 rounded flex items-center justify-center"
                              onClick={() => setOpenBarCodeModal(product.bar_code || "")}
                            >
                              <div className="w-8 h-3 bg-slate-300 rounded-sm flex products-center justify-center cursor-pointer">
                                {product.bar_code ? (
                                  <Barcode value={product.bar_code} className="w-8 h-8" />
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        {/* 🔹 Tovar nomi */}
                        <TableCell>
                          <div className="max-w-xs">
                            <p
                              className="font-medium text-gray-900 truncate"
                              title={product.product?.name}
                            >
                              {product.product?.name
                                ? product.product.name.slice(0, 25) + "..."
                                : "Belgilanmagan"}
                            </p>
                          </div>
                        </TableCell>

                        {/* 🔹 Tovar turi */}
                        <TableCell>{product.product_type?.name || "N/A"}</TableCell>

                        {/* 🔹 O'lcham */}
                        <TableCell>{product.size?.name || "N/A"}</TableCell>

                        {/* 🔹 Miqdor */}
                        <TableCell>
                          {isEditing ? (
                            <Input
                              type="number"
                              value={product.quantity || 0}
                              onChange={(e) =>
                                handleUpdateProduct(
                                  product.bar_code,
                                  "quantity",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-20"
                              min="1"
                            />
                          ) : (
                            <span className="font-medium">{product.quantity || 0}</span>
                          )}
                        </TableCell>

                        {/* 🔹 O'lchov birligi */}
                        <TableCell>{product.unit?.name || "N/A"}</TableCell>

                        {/* 🔹 Narx */}
                        <TableCell>
                          <span>{(product.price || 0).toLocaleString()} UZS</span>
                        </TableCell>

                        {/* 🔹 Summa */}
                        <TableCell className="font-medium text-green-600">
                          {(product.summa || 0).toLocaleString()} UZS
                        </TableCell>

                        {/* 🔹 Izoh */}
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={product.description || ""}
                              onChange={(e) =>
                                handleUpdateProduct(
                                  product.bar_code,
                                  "description",
                                  e.target.value
                                )
                              }
                              placeholder="Izoh kiriting"
                              className="w-32"
                            />
                          ) : (
                            <span
                              className={`${product.description ? "text-gray-900" : "text-gray-400"
                                }`}
                            >
                              {product.description || "—"}
                            </span>
                          )}
                        </TableCell>

                        {/* 🔹 Amallar */}
                        {isEditing && (
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveProduct(product.bar_code)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={isEditing ? 11 : 10}
                        className="text-center py-8 text-gray-500"
                      >
                        Hech qanday tovar topilmadi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

            </div>

            {/* Total Footer */}
            <div className="bg-gray-50 p-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Jami tovarlar: {currentData?.products?.length || 0} ta</span>

                <div className="text-right flex items-center gap-4">
                  <Button variant="outline">
                    Tasdiqlash
                  </Button>
                  <Button variant={"outline"} className="bg-green-600 hover:bg-green-700 text-white cursor-pointer">
                    Qabul qilish
                  </Button>
                  <span className="text-lg font-bold text-gray-900">
                    Umumiy summa: {(currentData?.products?.reduce((acc, product) => acc + (product.summa || 0), 0) || 0).toLocaleString()} UZS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {openBarCodeModal && (
        <div className="fixed inset-0 bg-black/10 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setOpenBarCodeModal("")}>
          <div className="bg-white p-6 rounded-lg shadow-lg relative" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              onClick={() => setOpenBarCodeModal("")}
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Shtrix kod</h2>
            {transferDetail?.products.length ? (
              <Barcode
                value={openBarCodeModal}
                format="CODE128"
                width={2}
                height={100}
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

export default WarehouseTransferDetail;