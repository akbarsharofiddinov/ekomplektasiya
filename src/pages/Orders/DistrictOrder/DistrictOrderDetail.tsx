/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { FilePlus2, Plus, Search } from 'lucide-react';
import { Input } from '@/components/UI/input';
import { SaveOutlined } from '@ant-design/icons';

import { axiosAPI } from '@/services/axiosAPI';
import { useParams } from 'react-router-dom';
import { Button, message, Modal, Pagination, Select } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import FileDropZone from '@/components/FileDropZone';
import {
	EyeOutlined, DownloadOutlined, FilePdfOutlined, FileWordOutlined, FileExcelOutlined, FileImageOutlined, FileTextOutlined,
} from "@ant-design/icons";
import SelectRemainsModal from '@/components/CreateForms/SelectRemainsModal';
import { toast } from 'react-toastify';
import { useAppSelector } from '@/store/hooks/hooks';
import DistrictOrderSigning from './DistrictOrderSigning';
import FilePreviewer from "@/components/files/FilePreviewer";


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
	for_purpose: "signing" | "editing";
}

interface ProductRow {
	row_number: number;
	order_type: { id: string; name: string } | null;
	product_type: { id: string; name: string } | null;
	product: { id: string; name: string } | null;
	model: { id: string; name: string } | null;
	size: { id: string; name: string } | null;
	unit: { id: string; name: string } | null;
	quantity: number;
	description: string;
}

interface FileData {
	raw_number: string;
	user: string;
	file_name: string;
	extension: string;
	date: string;
}


const DistrictOrderDetail: React.FC = () => {
	const [orderData, setOrderData] = useState<OrderDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [fileUploadModal, setFileUploadModal] = useState(false);
	const [file, setFile] = useState<File | null>(null);
	const [documentTypes, setDocumentTypes] = useState<IdName[]>([]);
	const [viewMode, setViewMode] = useState<'orders' | 'letters'>('orders');
	const [files, setFiles] = useState<FileData[]>([]);
	const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
	const [remainders, setRemainders] = useState<ProductRemainder[]>([]);
	const [showRemainders, setShowRemainders] = useState(false);
	const [documentFormData, setDocumentFormData] = useState<{
		selectedDocumentType: string;
		filename: string;
		extension: string;
		fileBinary: string;
	}>();
	const [showEmployeeModal, setShowEmployeeModal] = useState(false);
	const [employees, setEmployees] = useState<any[]>([]);
	const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
	const { id } = useParams();
	const [modalVisible, setModalVisible] = useState(false);
	const [modalType, setModalType] = useState<"model" | "size" | "unit" | "product_type" | null>(null);
	const [modalPage, setModalPage] = useState(1);
	const [modalPageSize] = useState(15);
	const [modalSelectedRow, setModalSelectedRow] = useState<number | null>(null);

	const { currentUserInfo } = useAppSelector(state => state.info);
	const { order_types, product_models, product_sizes, product_types, product_units } = useAppSelector(state => state.product)

	console.log(orderData?.for_purpose)

	// 🔹 Modal uchun ro'yxat
	const getModalList = () => {
		switch (modalType) {
			case "model":
				return product_models;
			case "size":
				return product_sizes;
			case "unit":
				return product_units;
			case "product_type":
				return product_types;
			default:
				return [];
		}
	};

	// 🔹 Paginatsiyalangan ro'yxat
	const paginatedList = getModalList().slice(
		(modalPage - 1) * modalPageSize,
		modalPage * modalPageSize
	);

	const openModal = (type: "model" | "size" | "unit" | "product_type", row_number: number) => {
		setModalType(type);
		setModalSelectedRow(row_number);
		setModalVisible(true);
		setModalPage(1);
	};

	// 🔹 Modalda element tanlanganda
	const handleSelectModalItem = (item: IdName) => {
		if (!modalSelectedRow || !modalType) return;

		updateRow(modalSelectedRow, modalType, item);
		setModalVisible(false);
		setModalSelectedRow(null);
		setModalType(null);
	};


	const fetchOrderDetail = useCallback(async () => {
		try {
			const response = await axiosAPI.get(`district-orders/detail/${id}`);
			setOrderData(response.data[0])
		} catch (error) {
			console.log(error)
		} finally {
			setLoading(false)
		}
	}, [id]);

	const fetchDocumentTypesList = async () => {
		try {
			const response = await axiosAPI.get('enumerations/document_types');
			setDocumentTypes(response.data);
		} catch (error) {
			console.log(error);
		}
	}

	const fetchRemaindersUserWarehouse = async () => {
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
			console.log(error)
		}
	}

	useEffect(() => {
		if (file) {
			setDocumentFormData(prev => ({ ...prev!, filename: file.name, extension: file.name.split('.').pop()! }))
			console.log(documentFormData)
		}

	}, [file, documentFormData?.filename, documentFormData?.extension]);

	// Handle file attach
	const handleFileAttach = async () => {
		// Params
		const params = {
			id: orderData?.id,
			file_name: documentFormData?.filename,
			extension: documentFormData?.extension,
			file_type: "ЗаявкаДокументПоРайон"
		}
		try {
			const arrayBuffer = await file?.arrayBuffer();
			const binary = new Uint8Array(arrayBuffer!);
			const response = await axiosAPI.post(`district-orders/files/create`, binary, {
				params,
				headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }
			})
			if (response.status === 200) {
				fetchOrderDetail();
				fetchDocumentTypesList();
				setFile(null);
				setDocumentFormData({} as {
					selectedDocumentType: string;
					filename: string;
					extension: string;
					fileBinary: string;
				});
				toast("Fayl muvaffaqiyatli yuklandi", { type: "success" });
			}
		} catch (error) {
			console.log(error)
		}
	};

	useEffect(() => {
		fetchOrderDetail();
		fetchDocumentTypesList();
	}, [fetchOrderDetail]);

	// 🟢 Fayllarni olish
	useEffect(() => {
		const fetchFiles = async () => {
			try {
				const response = await axiosAPI.get(`district-orders/${id}/files/list`);
				if (response.status === 200) {
					setFiles(response.data);
				}
			} catch (error) {
				console.error("Fayllarni olishda xato:", error);
			} finally {
				setLoading(false);
			}
		};

		if (id) fetchFiles();
	}, [id]);

	// 📅 Sana formatlash
	const formatDate = (iso: string): string => {
		const date = new Date(iso);
		return date.toLocaleString("uz-UZ", {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	// 📥 Yuklab olish
	const handleDownload = (file: FileData) => {
		const link = document.createElement("a");
		link.href = `https://ekomplektasiya.uz/ekomplektasiya_backend/hs/district-orders/${id}/files/${file.file_name}`;
		link.download = file.file_name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	// 📁 Fayl turiga qarab icon va rang qaytaruvchi funksiya
	const getFileIcon = (fileName: any) => {
		const ext = fileName.split(".").pop().toLowerCase();

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
	};

	// 🔹 Hodimlar ro'yxatini olish
	const fetchEmployees = async () => {
		try {
			const response = await axiosAPI.get("employees/list");
			if (response.status === 200 && Array.isArray(response.data.results)) {
				setEmployees(response.data.results);
			} else {
				setEmployees([]);
			}
		} catch (error) {
			console.error("Hodimlarni olishda xatolik:", error);
		}
	};

	const handleSelectEmployee = () => {
		if (!selectedEmployee) {
			message.warning("Iltimos, hodimni tanlang!");
			return;
		}

		const newExecutor = {
			executor: { id: selectedEmployee.id, name: selectedEmployee.name },
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
	};

	// const updateRow = <K extends keyof Product>(
	//     row_number: number,
	//     key: K,
	//     value: Product[K]
	// ) => {
	//     setOrderData(prev => {
	//         if (!prev) return prev;
	//         const updatedProducts = prev.products.map(p =>
	//             p.row_number === row_number ? { ...p, [key]: value } : p
	//         );
	//         return { ...prev, products: updatedProducts };
	//     });
	// };



	const updateRow = <K extends keyof ProductRow>(
		row_number: number,
		key: K,
		value: ProductRow[K]
	) => {
		setOrderData(prev => {
			if (!prev) return prev; // ✅ null holatini tekshirish
			const updatedProducts = prev.products.map(p =>
				p.row_number === row_number ? { ...p, [key]: value } : p
			);
			return { ...prev, products: updatedProducts };
		});
	};


	const handleAddProduct = () => {
		setOrderData(prev => {
			if (!prev) return prev; // ✅ null holatini tekshirish

			const newRowNumber = (prev.products?.length || 0) + 1;
			const newProduct: ProductRow = {
				row_number: newRowNumber,
				order_type: null,
				product_type: null,
				product: { id: crypto.randomUUID(), name: "" },
				model: null,
				size: null,
				unit: null,
				quantity: 0,
				description: "",
			};
			return { ...prev, products: [...(prev.products || []), newProduct] };
		});
	};



	// 🟣 Yuklanayotgan holat    
	if (loading) {
		return (
			<div className="flex justify-center items-center h-64">
				<div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-purple-600"></div>
			</div>
		);
	}

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

	const handleUpdateOrder = async () => {
		try {
			if (!orderData) return;
			const res = await axiosAPI.put(`/district-orders/update/${orderData.id}`, orderData);
			if (res.status === 200) {
				message.success("Buyurtma muvaffaqiyatli yangilandi!");
				fetchOrderDetail();
			}
		} catch (err) {
			console.error("Yangilashda xatolik:", err);
			message.error("Xatolik yuz berdi!");
		}
	};



	return (
		<>
			{
				orderData.for_purpose === "editing" ? (
					<div className="min-h-screen py-2 px-2 bg-white">
						<div className="max-w-8xl mx-auto bg-white">
							{/* 🔹 Yuqoridagi text-style navigation */}
							<div className="flex gap-8 mb-1 border-b border-gray-200 pb-2">
								<span
									onClick={() => setViewMode('orders')}
									className={`cursor-pointer pb-2 text-base font-medium transition-all duration-200 ${viewMode === 'orders'
										? 'text-blue-600 border-b-2 border-blue-600'
										: 'text-gray-500 hover:text-blue-500'
										}`}
								>
									Buyurtmalar oynasi
								</span>

								<span
									onClick={() => setViewMode('letters')}
									className={`cursor-pointer pb-2 text-base font-medium transition-all duration-200 ${viewMode === 'letters'
										? 'text-blue-600 border-b-2 border-blue-600'
										: 'text-gray-500 hover:text-blue-500'
										}`}
								>
									Yuborilgan xatning ko‘rinishi
								</span>
							</div>

							{/* 🔸 1. BUYURTMALAR OYNASI */}
							{viewMode === 'orders' && (
								<div>
									{/* Header */}
									<div className="bg-white overflow-hidden mb-4">
										<div className="flex items-center justify-between p-4">
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
											<div className='flex items-center gap-3'>
												<Button
													onClick={handleAddProduct}
													className='cursor-pointer'>
													<Plus></Plus>
													Kiritish
												</Button>
												<Button className='cursor-pointer' onClick={() => fetchRemaindersUserWarehouse()}>
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
															<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O‘lcham</th>
															<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">O'lchov birligi</th>
															<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Soni</th>
															<th className="px-3 py-2 text-center text-sm font-semibold text-gray-600">Izoh</th>
														</tr>
													</thead>

													<tbody className="divide-y divide-gray-100">
														{orderData?.products?.map((p, idx) => (
															<tr key={idx} className="hover:bg-gray-50 transition-all duration-200">
																{/* № */}
																<td className="px-3 py-2 text-center">
																	<span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold text-sm">
																		{p.row_number}
																	</span>
																</td>

																{/* 🟢 Buyurtma turi (API dan kelgan SELECT) */}
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
																{/* <td className="px-3 py-2 text-center">
																	<Button
																		size="small"
																		onClick={() => setModalData({ type: "order_type", row: p.row_number })}
																	>
																		{p.order_type?.name || "Tanlang"}
																	</Button>
																</td> */}

																{/* 🟠 Mahsulot nomi (qo‘lda Input) */}
																<td className="px-3 py-2 text-center">
																	<Input
																		value={p.product?.name || ""}
																		onChange={(e) =>
																			updateRow(p.row_number, "product", {
																				id: p.product?.id || crypto.randomUUID(),
																				name: e.target.value,
																			})
																		}
																		className="text-sm"
																	/>
																</td>

																{/* <td className="px-3 py-2 text-center">
																	<Select
																		value={p.product_type?.name}
																		onChange={(val) => {
																			const found = product_types.find(pt => pt.id === val);
																			if (found) updateRow(p.row_number, "product_type", found);
																		}}
																		style={{ width: 160 }}
																		options={product_types.map(pt => ({ value: pt.id, label: pt.name }))}
																		placeholder="Tanlang"
																	/>
																</td> */}

																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => openModal("product_type", p.row_number)}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.product_type?.name || "Tovar turini tanlash"}
																	</Button>
																</td>

																{/* 🔵 Model (useAppSelector dan Select) */}
																{/* <td className="px-3 py-2 text-center">
																	<Select
																		value={p.model?.name}
																		onChange={(val) => {
																			const found = product_models.find(m => m.id === val);
																			if (found) updateRow(p.row_number, "model", found);
																		}}
																		style={{ width: 150 }}
																		options={product_models.map(m => ({ value: m.id, label: m.name }))}
																		placeholder="Model"
																	/>
																</td> */}

																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => openModal("model", p.row_number)}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.model?.name || "Modelni tanlash"}
																	</Button>
																</td>

																{/* 🟣 O‘lcham */}
																{/* <td className="px-3 py-2 text-center">
																	<Select
																		value={p.size?.name}
																		onChange={(val) => {
																			const found = product_sizes.find(s => s.id === val);
																			if (found) updateRow(p.row_number, "size", found);
																		}}
																		style={{ width: 120 }}
																		options={product_sizes.map(s => ({ value: s.id, label: s.name }))}
																		placeholder="O‘lcham"
																	/>
																</td> */}

																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => openModal("size", p.row_number)}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.size?.name || "O‘lchamni tanlash"}
																	</Button>
																</td>

																{/* ⚪ Birlik */}
																{/* <td className="px-3 py-2 text-center">
																	<Select
																		value={p.unit?.id}
																		onChange={(val) => {
																			const found = product_units.find(u => u.id === val);
																			if (found) updateRow(p.row_number, "unit", found);
																		}}
																		style={{ width: 100 }}
																		options={product_units.map(u => ({ value: u.id, label: u.name }))}
																		placeholder="Birlik"
																	/>
																</td> */}
																<td className="px-3 py-2 text-center">
																	<Button
																		onClick={() => openModal("unit", p.row_number)}
																		size="small"
																		className="text-blue-600 border-blue-400"
																	>
																		{p.unit?.name || "Birlikni tanlash"}
																	</Button>
																</td>

																{/* 🔢 Soni (Input number) */}
																<td className="px-3 py-2 text-center">
																	<Input
																		type="number"
																		value={p.quantity}
																		onChange={(e) =>
																			updateRow(p.row_number, "quantity", Number(e.target.value))
																		}
																		className="text-sm text-center w-24"
																	/>
																</td>

																{/* 📝 Izoh (Input text) */}
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
														))}
													</tbody>
												</table>
											</div>
										</div>


									</div>


									<div>
										<div className="bg-transparent rounded-md p-2 flex justify-between mb-2">
											<div className='flex items-center gap-3'>
												<Button className='cursor-pointer'
													onClick={() => { fetchEmployees(); setShowEmployeeModal(true); }}
												>
													<Plus />
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

										<div className="flex items-center gap-4">
											{orderData.executors?.map((executor, index) => (
												<div
													key={index}
													className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
												>
													<div className="p-5">
														{/* Header with number and status */}
														<div className="flex items-center justify-between mb-4">
															<span className="text-xm font-semibold text-gray-500">№ {index + 1}</span>
															<span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
																{executor.status?.name}
															</span>
														</div>

														{/* Employee info */}
														<div className="mb-4">
															<p className="text-sm text-gray-500 mb-1">Imzolovchi xodim</p>
															<p className="text-sm font-semibold text-gray-900">{executor.executor?.name}</p>
														</div>

														{/* Message */}
														{executor.message && (
															<div className="mb-4">
																<p className="text-xs text-gray-500 mb-1">Imzolash xolati</p>
																<p className="text-sm text-gray-700">{executor.message}</p>
															</div>
														)}

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

									{/* Attach document */}
									<div className='flex items-center justify-center gap-6 p-6'>
										{/* File Upload Button */}
										<button
											onClick={() => setFileUploadModal(true)}
											className='group relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
										>
											<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
												<FilePlus2 className='w-5 h-5' />
											</div>
											<span>Hujjat biriktirish</span>
										</button>

										{/* Text Area */}
										<div className='flex-1 max-w-md'>
											<TextArea
												placeholder='Qisqacha mazmun yozing...'
												className='rounded-xl border-2 border-gray-200 focus:border-blue-400 hover:border-gray-300 transition-colors shadow-sm'
												style={{ height: "120px" }}
											/>
										</div>

										{/* Save Button */}
										<button
											className='group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-3 font-medium cursor-pointer'
											onClick={handleUpdateOrder}
										>
											<div className='bg-white/20 p-2 rounded-lg group-hover:bg-white/30 transition-colors'>
												<SaveOutlined className='text-xl' />
											</div>
											<span>Saqlash</span>
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
														onChange={(value) => {
															console.log(value)
															// setDocumentFormData(prev => ({ ...prev!, selectedDocumentType: value }))
														}}
														options={documentTypes.map(docType => ({ value: docType.id, label: docType.name }))}
													/>
												</div>
												<div className="mb-4">
													<FileDropZone file={file} setFile={setFile} />
												</div>

												<Button
													className="bg-gray-100 p-2 rounded-lg text-sm cursor-pointer hover:bg-blue-400 hover:text-white ml-auto"
													onClick={() => {
														setFileUploadModal(false);
														handleFileAttach()
													}}
													disabled={!file && !documentFormData?.selectedDocumentType}>
													Yuklash
												</Button>
											</div>
										</div>


									)}

									<div className="p-4">
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

															{/* 🔸 Fayl ma’lumotlari */}
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
																		title="Ko‘rish"
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
											<p className="text-gray-900 font-bold text-2xl text-center">
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
							)}

							{/* 🔸 2. YUBORILGAN XATNI KO‘RINISHI */}
							{viewMode === 'letters' && (
								<div className="p-6 bg-gray-50 rounded-lg shadow-sm">
									<h2 className="text-lg font-semibold mb-4">Yuborilgan xatni ko‘rinishi</h2>
									<p>Bu bo‘limda yuborilgan xat tafsilotlari chiqadi.</p>
									<p className="text-sm text-gray-500 mt-2">
										(Bu joyni keyinchalik o‘z API yoki table bilan to‘ldirish mumkin)
									</p>
								</div>
							)}
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
								×
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
												<td className="px-4 py-2 text-sm text-gray-800"></td>
												<td className="px-4 py-2 text-sm text-gray-800"></td>
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

			{/* 🔹 Tanlov modali */}
			<Modal
				title={
					modalType === "model"
						? "Modelni tanlang"
						: modalType === "size"
							? "O‘lchamni tanlang"
							: modalType === "unit"
								? "Birlikni tanlang"
								: modalType === "product_type"
									? "Tovar turini tanlang"
									: ""
				}
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}
				width={600}
			>
				<div className="space-y-2">
					{paginatedList.map((item) => (
						<div
							key={item.id}
							onClick={() => handleSelectModalItem(item)}
							className="border rounded-md p-2 hover:bg-blue-100 cursor-pointer"
						>
							{item.name}
						</div>
					))}
				</div>

				<div className="flex justify-center mt-4">
					<Pagination
						current={modalPage}
						pageSize={modalPageSize}
						total={getModalList().length}
						onChange={(page) => setModalPage(page)}
						size="small"
					/>
				</div>
			</Modal>



		</>
	);
};

export default DistrictOrderDetail;
