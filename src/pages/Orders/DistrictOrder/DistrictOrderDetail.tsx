/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { CircleCheckBig, FilePlus2, Plus, Save, Search, Trash, Trash2, Layers, X } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { SaveOutlined } from '@ant-design/icons';

import { axiosAPI } from '@/services/axiosAPI';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, message, Modal, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';
import {
	EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import SelectRemainsModal from '@/components/CreateForms/SelectRemainsModal';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks/hooks';
import DistrictOrderSigning from './DistrictOrderSigning';
import FieldModal from '@/components/modal/FieldModal';

interface IdName {
	id: string;
	name: string;
}

interface Product {
	row_number: number;
	product: string;
	model: IdName | null;
	product_type: IdName | null;
	size: IdName | null;
	unit: IdName | null;
	quantity: number;
	order_type: IdName | null;
	description?: string | null;
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
	for_purpose: "signing" | "editing";
}

interface ProductRow {
	row_number: number;
	order_type: IdName | null;
	product_type: IdName | null;
	product: string;
	model: IdName | null;
	size: IdName | null;
	unit: IdName | null;
	quantity: number;
	description?: string | null;
}

// Add missing interfaces
interface FileData {
	file_name: string;
	raw_number: string;
	date: string;
	user: string;
}

// ProductRemainder type is imported from SelectRemainsModal to ensure consistent typing across components.

interface DocumentFormData {
	selectedDocumentType: string;
	filename: string;
	extension: string;
	fileBinary: string;
}

const DistrictOrderDetail: React.FC = () => {
	// State variables
	const [orderData, setOrderData] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [fileUploadModal, setFileUploadModal] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
	const [files, setFiles] = useState<FileData[]>([]);
	const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
	const [remainders, setRemainders] = useState<ProductRemainder[]>([]);
	const [showRemainders, setShowRemainders] = useState(false);
	const [documentFormData, setDocumentFormData] = useState<DocumentFormData>({
		selectedDocumentType: '',
		filename: '',
		extension: '',
		fileBinary: ''
	});
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);
	const [employees, setEmployees] = useState<any[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
	const { id } = useParams<{ id: string }>();
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [deleteModalError, setDeleteModalError] = useState<string | null>(null);
	type FieldName = "product_type" | "model" | "size" | "unit" | "product";
	const [activeField, setActiveField] = useState<{ field: FieldName; row_number: number } | null>(null);

	// Redux selectors
	const { currentUserInfo } = useAppSelector(state => state.info);
	const { order_types } = useAppSelector(state => state.product);

	const navigate = useNavigate();

	const fetchOrderDetail = useCallback(async () => {
		if (!id) return;

		try {
			setLoading(true);
			const response = await axiosAPI.get(`district-orders/detail/${id}`);
			setOrderData(response.data[0]);
		} catch (error) {
			console.error('Error fetching order detail:', error);
			message.error('Buyurtma ma\'lumotlarini olishda xatolik yuz berdi!');
		} finally {
			setLoading(false);
		}
	}, [id]);

	const fetchDocumentTypesList = useCallback(async () => {
		try {
			const response = await axiosAPI.get('enumerations/document_types');
			setDocumentTypes(response.data);
		} catch (error) {
			console.error('Error fetching document types:', error);
			message.error('Hujjat turlarini olishda xatolik yuz berdi!');
		}
	}, []);

	const fetchRemaindersUserWarehouse = useCallback(async () => {
		try {
			const response = await axiosAPI.get(`/warehouses/list?region=${currentUserInfo?.region.name}&district=${currentUserInfo?.district.name}`);
			if (response.status === 200) {
				const warehouseId = response.data[0].id;
				const remaindersResponse = await axiosAPI.post("remainders/warehouses", {
					warehouse: warehouseId,
					date: new Date().toISOString()
				});
				if (remaindersResponse.status === 200) {
					setRemainders(remaindersResponse.data);
					setShowRemainders(true);
				}
			}
		} catch (error) {
			console.error('Error fetching remainders:', error);
			message.error('Qoldiqlarni olishda xatolik yuz berdi!');
		}
	}, [currentUserInfo?.region.name, currentUserInfo?.district.name]);

	// Fixed useEffect for file handling
	useEffect(() => {
		if (file) {
			setDocumentFormData(prev => ({
				...prev,
				filename: file.name,
				extension: file.name.split('.').pop() || ''
			}));
		}
	}, [file]); // Removed documentFormData from dependencies

	// Handle file attach with proper error handling
	const handleFileAttach = useCallback(async () => {
		if (!file || !orderData?.id || !documentFormData.filename) {
			message.error('Fayl yoki ma\'lumotlar to\'liq emas!');
			return;
		}

		const params = {
			id: orderData.id,
			file_name: documentFormData.filename,
			extension: documentFormData.extension,
			file_type: "ЗаявкаДокументПоРайон"
		};

		try {
			const arrayBuffer = await file.arrayBuffer();
			const binary = new Uint8Array(arrayBuffer);
			const response = await axiosAPI.post(`district-orders/files/create`, binary, {
				params,
				headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
			});

			if (response.status === 200) {
				await Promise.all([fetchOrderDetail(), fetchDocumentTypesList()]);
				setFile(null);
				setDocumentFormData({
					selectedDocumentType: '',
					filename: '',
					extension: '',
					fileBinary: ''
				});
				toast("Fayl muvaffaqiyatli yuklandi", { type: "success" });
				setFileUploadModal(false);
			}
		} catch (error) {
			console.error('Error uploading file:', error);
			message.error('Fayl yuklashda xatolik yuz berdi!');
		}
	}, [file, orderData?.id, documentFormData, fetchOrderDetail, fetchDocumentTypesList]);

	// Fetch files with error handling
	const fetchFiles = useCallback(async () => {
		if (!id) return;

		try {
			const response = await axiosAPI.get(`district-orders/${id}/files/list`);
			if (response.status === 200) {
				setFiles(response.data);
			}
		} catch (error) {
			console.error("Fayllarni olishda xato:", error);
			message.error('Fayllarni olishda xatolik yuz berdi!');
		}
	}, [id]);

	useEffect(() => {
		Promise.all([fetchOrderDetail(), fetchDocumentTypesList()]);
	}, [fetchOrderDetail, fetchDocumentTypesList]);

	useEffect(() => {
		if (id) {
			fetchFiles();
		}
	}, [fetchFiles]);

	// 📅 Sana formatlash
	const formatDate = useCallback((iso: string): string => {
		const date = new Date(iso);
		return date.toLocaleString("uz-UZ", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	}, []);

	// 📥 Yuklab olish
	const handleDownload = useCallback((file: FileData) => {
		const link = document.createElement("a");
		link.href = `https://ekomplektasiya.uz/ekomplektasiya_backend/hs/district-orders/${id}/files/${file.file_name}`;
		link.download = file.file_name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}, [id]);

	// 📁 Fayl turiga qarab icon va rang qaytaruvchi funksiya
	const getFileIcon = useCallback((fileName: string) => {
		const ext = fileName.split(".").pop()?.toLowerCase();

		switch (ext) {
			case "pdf":
				return { icon: <FilePdfOutlined />, color: "text-red-500", bg: "bg-red-50" };
			case "doc":
			case "docx":
				return { icon: <FileWordOutlined />, color: "text-blue-500", bg: "bg-blue-50" };
			case "xls":
			case "xlsx":
				return { icon: <FileExcelOutlined />, color: "text-green-500", bg: "bg-green-50" };
			case "jpg":
			case "jpeg":
			case "png":
				return { icon: <FileImageOutlined />, color: "text-yellow-500", bg: "bg-yellow-50" };
			default:
				return { icon: <FileTextOutlined />, color: "text-gray-500", bg: "bg-gray-100" };
		}
	}, []);

	// 🔹 Hodimlar ro'yxatini olish
	const fetchEmployees = useCallback(async () => {
		try {
			const response = await axiosAPI.get("employees/list");
			if (response.status === 200 && Array.isArray(response.data.results)) {
				setEmployees(response.data.results);
			} else {
				setEmployees([]);
			}
		} catch (error) {
			console.error("Hodimlarni olishda xatolik:", error);
			message.error('Hodimlarni olishda xatolik yuz berdi!');
		}
	}, []);

	const handleSelectEmployee = useCallback(() => {
		if (!selectedEmployee) {
			message.warning("Iltimos, hodimni tanlang!");
			return;
		}

		const newExecutor = {
			executor: { id: selectedEmployee.id, name: selectedEmployee.name },
			status: { id: '', name: '' }, // Add default status
			message: "",
			confirmation_date: new Date().toISOString(),
		};

		setOrderData((prev) =>
			prev
				? {
					...prev,
					executors: [...(prev.executors || []), newExecutor],
				}
				: prev
		);

		setShowEmployeeModal(false);
		setSelectedEmployee(null);
	}, [selectedEmployee]);

	// Fixed updateRow function with proper typing
	const updateRow = useCallback(<K extends keyof ProductRow>(
		row_number: number,
		key: K,
		value: ProductRow[K]
	) => {
		setOrderData(prev => {
			if (!prev) return prev;
			const updatedProducts = prev.products.map(p =>
				p.row_number === row_number ? { ...p, [key]: value } : p
			);
			return { ...prev, products: updatedProducts };
		});
	}, []);

	const handleAddProduct = useCallback(() => {
		setOrderData(prev => {
			if (!prev) return prev;

			const newRowNumber = (prev.products?.length || 0) + 1;
			const newProduct: ProductRow = {
				row_number: newRowNumber,
				order_type: null,
				product_type: null,
				product: "",
				model: null,
				size: null,
				unit: null,
				quantity: 0,
				description: "",
			};
			return { ...prev, products: [...(prev.products || []), newProduct] };
		});
	}, []);

	// 📌 O'chirish funksiyasi
	const handleDeleteOrder = useCallback(() => {
		if (!orderData || !orderData.id) {
			message.error("Buyurtma ID topilmadi!");
			return;
		}
		setDeleteModalError(null);
		setIsDeleteModalOpen(true);
	}, [orderData]);

	const confirmDelete = useCallback(async () => {
		if (!orderData || !orderData.id) {
			message.error("Buyurtma ma'lumoti topilmadi!");
			return;
		}

		try {
			const response = await axiosAPI.delete(`district-orders/delete/${orderData.id}/`);

			if (response.status === 200) {
				message.success("Buyurtma muvaffaqiyatli o'chirildi!");
				setIsDeleteModalOpen(false);

				setTimeout(() => {
					window.history.back();
				}, 1000);
			}
		} catch (error: any) {
			console.error("O'chirishda xatolik:", error);
			const backendError = error?.response?.data?.error || "Buyurtmani o'chirishda xatolik yuz berdi!";
			setDeleteModalError(backendError);
		}
	}, [orderData]);

	const cancelDelete = useCallback(() => {
		setIsDeleteModalOpen(false);
		setDeleteModalError(null);
	}, []);

	const handleUpdateOrder = useCallback(async () => {
		try {
			if (!orderData) return;
			const res = await axiosAPI.post(`/district-orders/update/${orderData.id}`, {
				...orderData,
				type_document_for_filter: orderData.type_document_for_filter?.id,
				application_status_district: orderData.application_status_district?.id,
				from_district: orderData.from_district?.id,
				sender_from_district: orderData.sender_from_district?.id,
				to_region: orderData.to_region?.id,
				recipient_district: orderData.recipient_district?.id,
				from_region: orderData.from_region?.id,
				sender_from_region: orderData.sender_from_region?.id,
				to_district: orderData.to_district?.id,
				recipient_region: orderData.recipient_region?.id,
				products: orderData.products.map(p => ({
					...p,
					product: p.product || "",
					model: p.model?.id,
					size: p.size?.id,
					unit: p.unit?.id,
					quantity: p.quantity,
					description: p.description,
					order_type: p.order_type?.id,
					product_type: p.product_type?.id,
					row_number: p.row_number,
				})),
				executors: orderData.executors.map(e => ({
					...e,
					executor: e.executor.id,
					status: e.status.id,
				})),
			});
			if (res.status === 200) {
				toast.success("Buyurtma muvaffaqiyatli yangilandi!");
				fetchOrderDetail();
			}
		} catch (err: any) {
			console.error("Yangilashda xatolik:", err);
			toast.error(err.response?.data?.error || "Buyurtmani yangilashda xatolik yuz berdi!");
		}
	}, [orderData, fetchOrderDetail]);

	// Loading state - remove duplicate
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
		<>
			{
				orderData.for_purpose === "editing" ? (
					<div className="py-2 px-2 bg-white">
						<div className="max-w-8xl mx-auto bg-white">
							<div>
								{/* Header */}
								<div className="bg-white overflow-hidden mb-4">
									<div className="flex items-center justify-between p-3">
										<Button
											variant="text"
											size="small"
											onClick={() => navigate(-1)}
											className="w-8 h-8 p-0 hover:bg-slate-100 transition-colors"
										>
											<X className="w-5 h-5" />
										</Button>
										<div className="text-center border-gray-200">
											<p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish</p>
											<p className="text-md font-semibold text-gray-800">{orderData.exit_number}</p>
										</div>

										<div className="text-center border-gray-200">
											<p className="text-xs text-gray-500 uppercase font-semibold mb-2">Chiqish Sana</p>
											<p className="text-md font-semibold text-gray-800">{orderData.exit_date?.split("T").join(" ")}</p>
										</div>

										<div className="text-center border-gray-200">
											<p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tumandan</p>
											<p className="text-md font-semibold text-gray-800">{orderData.from_district?.name}</p>
										</div>

										<div className="text-center">
											<p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatga</p>
											<p className="text-md font-semibold text-gray-800">{orderData.from_region?.name}</p>
										</div>

										<div className="text-center border-gray-200">
											<p className="text-xs text-gray-500 uppercase font-semibold mb-2">Tumandan junatuvchi</p>
											<p className="text-md font-semibold text-gray-800">{orderData.recipient_district?.name}</p>
										</div>

										<div className="text-center border-gray-200">
											<p className="text-xs text-gray-500 uppercase font-semibold mb-2">Viloyatdan qabul qiluvchi</p>
											<p className="text-md font-semibold text-gray-800">{orderData.recipient_region?.name}</p>
										</div>

									</div>
								</div>

								<div>
									<div className="bg-transparent rounded-md flex justify-between mb-4">
										<div>
											<h1 className='font-semibold text-xl text-[#000]'>Buyurtma uchun berilgan tovarlar ruyhati</h1>
										</div>
										<div className='flex items-center gap-3'>
											<button
												onClick={handleAddProduct}
												className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
											>
												<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
													<Plus className='w-3.5 h-3.5' />
												</div>
												Tovar kiritish
											</button>
											<button
												className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-md px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
												onClick={() => fetchRemaindersUserWarehouse()}
											>
												<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
													<Layers className='w-3.5 h-3.5' />
												</div>
												Qoldiqlar
											</button>
											<div className="relative">
												<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
												<Input
													type="text"
													placeholder="Qidirish (Ctrl+F)"
													className="w-64 h-9 pl-9 text-sm border-slate-200 bg-white"
												/>
											</div>
										</div>
									</div>

									<div className="bg-white rounded-xl border border-gray-200 overflow-y-auto mb-4">
										<div className="overflow-x-auto">
											<table className="w-full caption-bottom text-sm">
												<thead className="[&_tr]:border-b bg-gradient-to-r from-slate-100 via-blue-50 to-purple-50">
													<tr className=" data-[state=selected]:bg-muted border-b transition-colors">
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">№</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Buyurtma turi</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Tovar</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Tovar turi</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Model</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lcham</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lchov birligi</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Soni</th>
														<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Izoh</th>
													</tr>
												</thead>
												<tbody className="divide-y divide-gray-100">
													{orderData?.products?.length ? (
														orderData.products.map((p, idx) => (
															<tr key={idx} className="hover:bg-gray-50 transition-all duration-200">
																{/* № */}
																<td className="px-3 py-2 text-center">
																	<span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm">
																		{p.row_number}
																	</span>
																</td>

																{/* 🟢 Buyurtma turi */}
																<td className="px-3 py-2 text-center">
																	<Select
																		value={p.order_type?.id}
																		onChange={(val) => {
																			const found = order_types.find(o => o.id === val);
																			if (found) updateRow(p.row_number, "order_type", found);
																		}}
																		style={{ width: 160 }}
																		options={order_types.map(o => ({ value: o.id, label: o.name }))}
																		placeholder="Tanlang"
																	/>
																</td>

																{/* 🟠 Mahsulot nomi */}
																<td className="px-3 py-2 text-center">
																	<Input
																		value={p.product || ""}
																		onChange={(e) =>
																			updateRow(p.row_number, "product", e.target.value)
																		}
																		className="text-sm"
																	/>
																</td>

																{/* 🔵 Tovar turi */}
																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => setActiveField({ field: "product_type", row_number: p.row_number })}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.product_type?.name || "Tovar turini tanlash"}
																	</Button>
																	{activeField?.field === "product_type"
																		&& activeField?.row_number === p.row_number
																		&& (
																			<FieldModal
																				field_name={activeField.field}
																				selectedItem={{ id: p.product_type?.id || '', name: p.product_type?.name || '', name_uz: p.product_type?.name || '' }}
																				setSelectedItem={newItem => {
																					if (!newItem) {
																						setActiveField(null);
																						return;
																					}
																					setOrderData(prev => ({
																						...prev!,
																						products: prev!.products.map(prod => prod.row_number === p.row_number ? { ...prod, product_type: { id: newItem.id, name: newItem.name }, model: { id: '', name: '' }, size: { id: '', name: '' }, unit: { id: '', name: '' } } : prod)
																					}))
																					setActiveField(null)
																				}}
																			/>
																		)}
																</td>

																{/* 🟣 Model */}
																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => setActiveField({ field: "model", row_number: p.row_number })}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.model?.name || "Modelni tanlash"}
																	</Button>
																	{activeField?.field === "model" && activeField?.row_number === p.row_number && (
																		<FieldModal
																			field_name={activeField.field}
																			selectedItem={{ id: p.model?.id || '', name: p.model?.name || '', name_uz: p.model?.name || '' }}
																			selectedProductTypeId={p.product_type?.name || ''}
																			setSelectedItem={newItem => {
																				if (!newItem) {
																					setActiveField(null);
																					return;
																				}
																				setOrderData(prev => ({
																					...prev!,
																					products: prev!.products.map(prod => prod.row_number === p.row_number ? { ...prod, model: { id: newItem.id, name: newItem.name }, size: { id: '', name: '' }, unit: { id: '', name: '' } } : prod)
																				}))
																				setActiveField(null)
																			}}
																		/>
																	)}
																</td>

																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => setActiveField({ field: "size", row_number: p.row_number })}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.size?.name || "O'lchamni tanlash"}
																	</Button>
																	{activeField?.field === "size" && activeField?.row_number === p.row_number && (
																		<FieldModal
																			field_name={activeField.field}
																			selectedItem={{ id: p.size?.id || '', name: p.size?.name || '', name_uz: p.size?.name || '' }}
																			selectedProductTypeId={p.product_type?.name || ''}
																			selectedModelId={p.model?.name || ''}
																			setSelectedItem={newItem => {
																				if (!newItem) {
																					setActiveField(null);
																					return;
																				}
																				setOrderData(prev => ({
																					...prev!,
																					products: prev!.products.map(prod => prod.row_number === p.row_number ? { ...prod, size: { id: newItem.id, name: newItem.name }, unit: { id: '', name: '' } } : prod)
																				}))
																				setActiveField(null)
																			}}
																		/>
																	)}
																</td>

																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => setActiveField({ field: "unit", row_number: p.row_number })}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.unit?.name || "Birlikni tanlash"}
																	</Button>
																	{activeField?.field === "unit" && activeField?.row_number === p.row_number && (
																		<FieldModal
																			field_name={activeField.field}
																			selectedItem={{ id: p.unit?.id || '', name: p.unit?.name || '', name_uz: p.unit?.name || '' }}
																			setSelectedItem={newItem => {
																				if (!newItem) {
																					setActiveField(null);
																					return;
																				}
																				setOrderData(prev => ({
																					...prev!,
																					products: prev!.products.map(prod => prod.row_number === p.row_number ? { ...prod, unit: { id: newItem.id, name: newItem.name } } : prod)
																				}))
																				setActiveField(null)
																			}}
																		/>
																	)}
																</td>

																{/* 🔢 Soni (Input number) */}
																<td className="px-3 py-2 text-center">
																	<Input
																		type="number"
																		value={p.quantity}
																		onChange={(e) =>
																			updateRow(p.row_number, "quantity", Number(e.target.value))
																		}
																		className="text-sm border border-gray-200 rounded-md w-full bg-white placeholder:text-gray-400"
																	/>
																</td>

																{/* 📝 Izoh */}
																<td className="px-3 py-2 text-center">
																	<Input
																		placeholder="Izoh"
																		value={p.description || ""}
																		onChange={(e) =>
																			updateRow(p.row_number, "description", e.target.value)
																		}
																		className="text-sm"
																	/>
																</td>
															</tr>
														))
													) : (
														<tr>
															<td colSpan={9} className="py-6 text-center text-gray-500 text-sm font-semibold">
																Tovar qo'shilmagan
															</td>
														</tr>
													)}
												</tbody>

											</table>
										</div>
									</div>
								</div>

								<div className='mb-2'>
									<div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
										<div>
											<h1 className='font-semibold text-xl text-[#000]'>Imzolovchilar</h1>
										</div>
										<div>
											<button className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
												onClick={() => { fetchEmployees(); setShowEmployeeModal(true); }}
											>
												<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
													<Plus className='w-3.5 h-3.5' />
												</div>
												Imzolovchi kiritish
											</button>
										</div>
									</div>

									<div className="grid grid-cols-4 items-center gap-4">
										{orderData.executors?.map((executor, index) => (
											<div
												key={index}
												className="bg-white border shadow-sm p-4 rounded-xl flex flex-col gap-4 relative"
											>
												<button className="absolute right-0 top-0 text-xl bg-red-500 text-white w-[26px] flex items-center justify-center h-[26px] rounded-bl-md cursor-pointer"
													onClick={() => {
														setOrderData(prev => ({
															...prev!,
															executors: prev!.executors.filter((_, i) => i !== index)
														}));
													}}
												>
													<Trash2 size={14} />
												</button>
												<div className="flex justify-center gap-6" >
													<p className="w-[35px] h-[35px] flex items-center justify-center bg-sky-400/20 rounded-full">{index + 1}</p>
													<div>
														<p className="text-sm text-gray-800 mb-1">Imzolovchi xodim</p>
														<h2 className="text-lg font-semibold text-center">{executor.executor?.name}</h2>
														{/* Message */}
														{executor.message && (
															<div className="mb-4">
																<p className="text-xs text-gray-500 mb-1">Imzolash xolati</p>
																<p className="text-sm text-gray-700">{executor.message}</p>
															</div>
														)}
													</div>
												</div>
												<div className="p-5">
													{/* Date */}
													<div className="pt-3 border-t border-gray-100">
														<p className="text-xs text-gray-500">Sana</p>
														<p className="text-sm text-gray-900 font-medium">{executor.confirmation_date}</p>
													</div>
												</div>
											</div>
										))}
									</div>

								</div>

								<hr />

								<div className='flex items-center justify-between'>
									<div>
										<h1 className='font-semibold text-xl text-[#000]'>Hujjatlar ruyhati</h1>
									</div>
									<div className='flex items-center justify-center gap-6 p-6'>
										<button
											onClick={() => setFileUploadModal(true)}
											className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-2 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
										>
											<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
												<FilePlus2 className='w-3.5 h-3.5' />
											</div>
											Hujjat biriktirish
										</button>
									</div>

									{/* Save Button */}
									<button
										className='group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
										onClick={handleUpdateOrder}
										aria-label="Saqlash"
									>
										<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
											<SaveOutlined className='text-xl' />
										</div>
										<span>Saqlash</span>
									</button>

									<button
										className='group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
										onClick={handleDeleteOrder}
										aria-label="O'chirish"
									>
										<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
											<SaveOutlined className='text-xl' />
										</div>
										<span>O'chirish</span>
									</button>
								</div>

								{fileUploadModal && (
									<div className="fixed inset-0 bg-black/20 bg-opacity-50 flex items-center justify-center z-50" onClick={() => setFileUploadModal(false)}>
										<div className="bg-white rounded-lg p-6 w-96 flex flex-col" onClick={(e) => e.stopPropagation()}>
											{/* Top */}
											<div className='flex items-center justify-between mb-4 pb-2 border-b'>
												<h2 className="text-xl font-semibold">Hujjat biriktirish</h2>
												<button className='text-2xl' onClick={() => setFileUploadModal(false)}>&times;</button>
											</div>
											<div className="mb-4">
												<label className="block text-sm font-medium text-gray-700 mb-1">Hujjat turi</label>
												<Select
													style={{ width: '100%' }}
													placeholder="Hujjat turini tanlang"
													value={documentFormData.selectedDocumentType || undefined}
													onChange={(value) => {
														setDocumentFormData(prev => ({ ...prev, selectedDocumentType: value }))
													}}
													options={documentTypes.map(docType => ({ value: docType.id, label: docType.name }))}
												/>
											</div>
											<div className="mb-4">
												<FileDropZone file={file} setFile={setFile} />
											</div>

											<Button
												className="bg-gray-100 p-2 rounded-lg text-sm cursor-pointer hover:bg-blue-400 hover:text-white ml-auto"
												onClick={handleFileAttach}
												disabled={!file || !documentFormData?.selectedDocumentType}
											>
												Yuklash
											</Button>
										</div>
									</div>
								)}

								<div className="bg-white rounded-xl mb-6 overflow-x-auto">
									{files.length !== 0 ? (
										<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
											{files.map((file, index) => {
												const { icon, color, bg } = getFileIcon(file.file_name);
												return (
													<div
														key={index}
														className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 p-3 flex flex-col justify-between"
													>
														{/* 🔹 Exit number & Row number */}
														<div className="flex justify-between items-center mb-3">
															<span className="text-[13px] font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded-full">
																{orderData.exit_number}-{file.raw_number}
															</span>
														</div>

														{/* 🔸 Fayl ma'lumotlari */}
														<div className='flex '>

															<div className="flex items-center gap-4 mb-3">
																<div className={`p-3 rounded-lg ${bg}`}>
																	<div className={`${color} text-3xl`}>{icon}</div>
																</div>
																<div className="flex flex-col">
																	<h4 className="text-gray-800 font-semibold text-[12px] truncate w-40">
																		{file.file_name}
																	</h4>
																	{file.user}
																	<p className="text-gray-500 text-[12px] mt-1">{formatDate(file.date)}</p>
																</div>
															</div>

															{/* 🔸 Action tugmalar */}
															<div className="flex flex-col gap-2">
																<button
																	onClick={() => setSelectedFile(file)}
																	className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
																	title="Ko'rish"
																>
																	<EyeOutlined className="text-lg" />
																</button>
																<button
																	onClick={() => handleDownload(file)}
																	className="p-1 rounded-md text-gray-600 hover:text-purple-700 hover:bg-gray-100 transition"
																	title="Yuklab olish"
																>
																	<DownloadOutlined className="text-lg" />
																</button>
															</div>

														</div>
													</div>
												);
											})}
										</div>
									) : (
										<p className="text-gray-500 font-semibold text-sm text-center">
											Hozircha fayllar mavjud emas.
										</p>
									)}

									{/* 🟣 PDF modal */}
									{selectedFile && (
										<div
											className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"
											onClick={() => setSelectedFile(null)}
										>
											<div
												className="bg-white w-11/12 h-[90vh] rounded-xl overflow-hidden shadow-xl flex flex-col"
												onClick={(e) => e.stopPropagation()}
											>
												<iframe
													src={`https://ekomplektasiya.uz/ekomplektasiya_backend/hs/district-orders/${id}/file/${selectedFile.raw_number}`}
													title="PDF Viewer"
													className="flex-1 border-none"
												/>
												<button
													onClick={() => setSelectedFile(null)}
													className="bg-purple-600 hover:bg-purple-700 text-white py-2 font-medium"
												>
													Yopish
												</button>
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="sticky bottom-0 right-0 left-0 bg-white border-t border-gray-200 shadow-sm z-40 px-6 py-4 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
								{/* TextArea */}
								<div className="flex-1 max-w-md w-full">
									<TextArea
										placeholder='Qisqacha mazmun yozing...'
										className='rounded-xl border-2 border-gray-200 focus:border-blue-400 hover:border-gray-300 transition-colors shadow-sm'
										style={{ height: "30px" }}
									/>
								</div>

								{/* Buttons */}
								<div className="flex items-center gap-4">
									<button
										className='group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
									>
										<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
											<CircleCheckBig className="w-3 h-3" />
										</div>
										<span>Tasdiqlash</span>
									</button>

									<button
										className='group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
										onClick={handleUpdateOrder}
									>
										<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
											<Save className="w-3 h-3" />
										</div>
										<span>Saqlash</span>
									</button>

									<button
										className='group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-1.5 rounded-md shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
										onClick={handleDeleteOrder}
									>
										<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
											<Trash className="w-3 h-3" />
										</div>
										<span>O‘chirish</span>
									</button>
								</div>
							</div>

						</div>

					</div>

				) : (
					<>
						<DistrictOrderSigning />
					</>
				)
			}

			{
				showRemainders && (
					<SelectRemainsModal onClose={() => setShowRemainders(false)} remainders={remainders} />
				)
			}

			{showEmployeeModal && (
				<div
					className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
					onClick={() => setShowEmployeeModal(false)}
				>
					<div
						className="bg-white rounded-lg w-[600px] p-6 shadow-lg"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between border-b pb-3 mb-4">
							<h2 className="text-lg font-semibold">Imzolovchi hodimni tanlang</h2>
							<button
								className="text-xl font-bold hover:text-red-500"
								onClick={() => setShowEmployeeModal(false)}
							>
								&times;
							</button>
						</div>

						<div className="max-h-[400px] overflow-y-auto">
							{employees.length === 0 ? (
								<div className="text-center py-6 text-gray-500">Ma'lumot topilmadi</div>
							) : (
								<table className="w-full border-collapse">
									<thead className="bg-gray-50 border-b">
										<tr>
											<th className="text-left px-4 py-2 text-sm font-semibold">F.I.Sh.</th>
											<th className="text-left px-4 py-2 text-sm font-semibold">Lavozimi</th>
											<th className="text-left px-4 py-2 text-sm font-semibold">Imzolash xolati</th>
											<th className="text-center px-4 py-2 text-sm font-semibold">Tanlash</th>
										</tr>
									</thead>
									<tbody>
										{employees.map((emp, index) => (
											<tr
												key={index}
												className={`hover:bg-blue-50 transition ${selectedEmployee?.id === emp.id ? "bg-blue-100" : ""
													}`}
											>
												<td className="px-4 py-2 text-sm text-gray-800">{emp.name}</td>
												<td className="px-4 py-2 text-sm text-gray-800">{emp.position}</td>
												<td className="px-4 py-2 text-sm text-gray-800">{emp.message}</td>
												<td className="px-4 py-2 text-center">
													<input
														type="radio"
														checked={selectedEmployee?.id === emp.id}
														onChange={() => setSelectedEmployee(emp)}
													/>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						<div className="flex justify-end mt-5">
							<Button
								type="primary"
								onClick={handleSelectEmployee}
							>
								Tanlash
							</Button>
						</div>
					</div>
				</div>
			)}

			{/* 🔴 O'chirish tasdiqlash modali */}
			<Modal
				title={
					deleteModalError
						? null
						: "Buyurtmani o‘chirishni tasdiqlaysizmi?"
				}
				open={isDeleteModalOpen}
				closable={!deleteModalError}
				maskClosable={!deleteModalError}
				width={deleteModalError ? 520 : 420}
				centered
				footer={
					deleteModalError
						? [
							<Button
								key="ok"
								type="primary"
								onClick={cancelDelete}
								style={{
									width: 120,
									fontWeight: 600,
								}}
							>
								OK
							</Button>,
						]
						: [
							<Button key="cancel" onClick={cancelDelete}>
								Bekor qilish
							</Button>,
							<Button key="delete" danger onClick={confirmDelete}>
								Ha, o‘chirish
							</Button>,
						]
				}
				bodyStyle={{
					textAlign: "center",
					padding: deleteModalError ? "16px 16px" : "16px",
				}}
			>
				{deleteModalError ? (
					<p
						style={{
							color: "#ff4d4f",
							fontSize: "20px",
							fontWeight: "700",
							textAlign: "center",
							lineHeight: "1.8",
						}}
					>
						{deleteModalError}
					</p>
				) : (
					<p
						style={{
							fontSize: "16px",
							color: "#555",
							lineHeight: "1.6",
							marginBottom: 0,
						}}
					>
						Bu amalni qaytarib bo‘lmaydi. Davom etasizmi?
					</p>
				)}
			</Modal>


		</>
	);
};

export default DistrictOrderDetail;
