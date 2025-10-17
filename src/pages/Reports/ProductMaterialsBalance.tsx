/* eslint-disable react-hooks/exhaustive-deps */
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect, useState } from 'react'
import { Label } from '@/components/UI/label';
import { Button, DatePicker, Input, Select } from 'antd';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { axiosAPI } from '@/services/axiosAPI';
import { setRegions } from '@/store/infoSlice/infoSlice';
import dayjs, { Dayjs } from 'dayjs';
import { setProducts } from '@/store/productSlice/productSlice';
import { Table, TableCell, TableHeader, TableRow, TableHead } from '@/components/UI/table';
import { Download, Printer } from 'lucide-react';
import ExcelJS from "exceljs";
import { Modal } from "antd";
import { saveAs } from "file-saver";
import { CheckCircleOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import FieldModal from '@/components/modal/FieldModal';
interface FilterData {
    date: Dayjs | null; // ✅ endi Dayjs yoki null
    region: string;
    warehouse: string;
    product: string;
    bar_code: string;
    product_type: string;
    model: string;
    size: string;
}

interface ProductInfo {
    id: string;
    name: string;
}

interface WarehouseItem {
    bar_code: string
    remaining_quantity: number
    remaining_summa: number
    product_code: string
    price: number
    product: ProductInfo
    mxi_code: ProductInfo
    unit: ProductInfo
    product_type: ProductInfo
    model: ProductInfo
    size: ProductInfo
    last_delivery_date: string
    interval_between: string
}

const ProductMaterialsBalance: React.FC = () => {
    const [filterData, setFilterData] = React.useState<FilterData>({
        date: dayjs(), // ✅ string emas, Dayjs obyekt
        region: '',
        warehouse: '',
        product: '',
        bar_code: '',
        product_type: '',
        model: '',
        size: '',
    });
    const [warehouses, setWarehouses] = React.useState<Array<{ id: string, name: string }>>([]);
    // const [models, setModels] = React.useState<ProductInfo[]>([]);
    // const [sizes, setSizes] = React.useState<Array<{ id: string, name: string }>>([]);
    // const [productTypes, setProductTypes] = React.useState<Array<{ id: string, name: string, number: number }>>([]);
    const [productsReport, setProductsReport] = React.useState<WarehouseItem[]>([]);
    const [handleDownloadModal, setHandleDownloadModal] = React.useState(false);
    const [open, setOpen] = useState(false);

    const { regions } = useAppSelector(state => state.info);

    const [fieldName, setFieldName] = useState<"size" | "product" | "product_type" | "model" | "">("");

    const { product_types, products, product_sizes, product_models } = useAppSelector(state => state.product)
    const dispatch = useAppDispatch();

    const getRegions = async () => {
        if (regions.length === 0) {
            try {
                const response = await axiosAPI.get("/regions/list/?order_by=2");
                if (response.status === 200) dispatch(setRegions(response.data));
            } catch (error) {
                console.log(error)
            }
        }
    }

    const getWarehouses = async () => {
        try {
            const response = await axiosAPI.get(`/warehouses/list/?order_by=2&region=${regions.find(r => r.id === filterData.region)?.name || ''}`);
            if (response.status === 200) setWarehouses(response.data);
        } catch (error) {
            console.log(error)
        }
    }

    // 2) getModels funksiyasi (API javobi .results bo‘lsa ham ishlaydi)

    // const getModels = async () => {
    //     try {
    //         const response = await axiosAPI.get(`/models/list/?order_by=2${filterData.product_type ? `&product_type=${filterData.product_type}` : ''}`);
    //         if (response.status === 200) {
    //             // ba'zi endpointlar response.data.results qaytaradi, ba'zilari response.data
    //             const list = response.data.results ?? response.data;
    //             setModels(list);
    //         }
    //     } catch (error) {
    //         console.log("getModels error:", error);
    //     }
    // };


    // Get remainders report (API POST)
    // const getRemaindersReport = async () => {
    //     try {
    //         const response = await axiosAPI.post(`/remainders/warehouses/`, {
    //             warehouse: filterData.warehouse || undefined,
    //             date: filterData.date ? filterData.date.format('YYYY-MM-DDTHH:mm:ss') : undefined,
    //             product: filterData.product || undefined,
    //             product_type: filterData.product_type || undefined,
    //             model: filterData.model || undefined,
    //             size: filterData.size || undefined,
    //             bar_code: filterData.bar_code || undefined,
    //         });
    //         if (response.status === 200) {
    //             setProductsReport(response.data);
    //         }
    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    const getRemaindersReport = async () => {
        try {
            const response = await axiosAPI.post(`/remainders/warehouses/`, {
                warehouse: filterData.warehouse || undefined,
                date: filterData.date
                    ? filterData.date.format("YYYY-MM-DDTHH:mm:ss")
                    : undefined,
                product: filterData.product || undefined,
                product_type: filterData.product_type || undefined,
                model: filterData.model || undefined,
                size: filterData.size || undefined,
                bar_code: filterData.bar_code || undefined,
            });
            console.log(filterData.product)
            console.log(filterData.product_type)
            if (response.status === 200) {
                setProductsReport(response.data);
                setOpen(true); // ✅ modalni ochamiz
            }
        } catch (error) {
            console.log(error);
        }
    };



    // Print (faqat hisobotni chiqaradi)
    // const handlePrint = () => {
    //     if (!productsReport || productsReport.length === 0) {
    //         window.alert("Avval hisobotni shakillantiring.");
    //         return;
    //     }

    //     const regionName = regions.find(r => r.id === filterData.region)?.name || "";
    //     const warehouseName = warehouses.find(w => w.id === filterData.warehouse)?.name || "";

    //     // Jadval qatorlari
    //     const buildTableRowsHTML = () =>
    //         productsReport.map((item, index) => `
    //     <tr>
    //       <td>${index + 1}</td>
    //       <td>${regionName}</td>
    //       <td>${warehouseName}</td>
    //       <td>${item.bar_code || ""}</td>
    //       <td>${item.product_type?.name || ""}</td>
    //       <td>${item.model?.name || ""}</td>
    //       <td>${item.size?.name || ""}</td>
    //       <td>${item.product?.name || ""}</td>
    //       <td>${item.product_code || ""}</td>
    //       <td>${item.unit?.name || ""}</td>
    //       <td>${item.remaining_quantity ?? 0}</td>
    //       <td>${item.price?.toLocaleString("uz-UZ") ?? 0}</td>
    //       <td>${item.remaining_summa?.toLocaleString("uz-UZ") ?? 0}</td>
    //       <td>${item.last_delivery_date || ""}</td>
    //       <td>${item.interval_between || ""}</td>
    //     </tr>
    //   `).join("");

    //     // Jadval sarlavhasi
    //     const tableHeadHTML = `
    //   <tr>
    //     <th>№</th>
    //     <th>Viloyat</th>
    //     <th>Ombor</th>
    //     <th>Shtrix kod</th>
    //     <th>Tovar turi</th>
    //     <th>Model</th>
    //     <th>O‘lcham</th>
    //     <th>Tovar</th>
    //     <th>Kod</th>
    //     <th>O‘lchov birligi</th>
    //     <th>Qoldiq miqdori</th>
    //     <th>Narxi</th>
    //     <th>Summasi</th>
    //     <th>Oxirgi kirim sana</th>
    //     <th>Jami kun</th>
    //   </tr>
    // `;

    //     // Hujjat
    //     const htmlContent = `
    //   <!DOCTYPE html>
    //   <html>
    //   <head>
    //     <meta charset="utf-8">
    //     <style>
    //       body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
    //       .header { text-align: center; margin-bottom: 20px; }
    //       h1 { color: #1E56A0; margin: 0; }
    //       h2 { margin: 5px 0; }
    //       table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
    //       th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
    //       th { background-color: #1E56A0; color: white; }
    //       tr:nth-child(even) { background-color: #f9f9f9; }
    //       .footer { margin-top: 20px; font-size: 11px; text-align: center; color: #555; }
    //     </style>
    //   </head>
    //   <body>
    //     <div class="header">
    //       <h1>E-KOMPLEKTATSIYA</h1>
    //       <h2>Tovarlar Qoldiq Hisoboti</h2>
    //       <p><strong>Sana:</strong> ${filterData.date ? filterData.date.format("YYYY-MM-DD HH:mm") : ""}</p>
    //     </div>
    //     <table>
    //       <thead>${tableHeadHTML}</thead>
    //       <tbody>${buildTableRowsHTML()}</tbody>
    //     </table>
    //     <div class="footer">
    //       <p>Jami: ${productsReport.length} ta yozuv</p>
    //       <p>Chop etilgan: ${new Date().toLocaleDateString("uz-UZ")} ${new Date().toLocaleTimeString("uz-UZ")}</p>
    //     </div>
    //   </body>
    //   </html>
    // `;

    //     const printWindow = window.open("", "_blank");
    //     if (!printWindow) return;
    //     printWindow.document.write(htmlContent);
    //     printWindow.document.close();
    //     printWindow.print();
    // };

    const handlePrint = () => {
        if (!productsReport || productsReport.length === 0) {
            window.alert("Avval hisobotni shakillantiring.");
            return;
        }

        const regionName = regions.find(r => r.id === filterData.region)?.name || "";
        const warehouseName = warehouses.find(w => w.id === filterData.warehouse)?.name || "";

        // Jadval qatorlari
        const buildTableRowsHTML = () =>
            productsReport.map((item, index) => `
          <tr>
            <td>${index + 1}</td>
            <td>${regionName}</td>
            <td>${warehouseName}</td>
            <td>${item.bar_code || ""}</td>
            <td>${item.product_type?.name || ""}</td>
            <td>${item.model?.name || ""}</td>
            <td>${item.size?.name || ""}</td>
            <td>${item.product?.name || ""}</td>
            <td>${item.product_code || ""}</td>
            <td>${item.unit?.name || ""}</td>
            <td>${item.remaining_quantity ?? 0}</td>
            <td>${item.price?.toLocaleString("uz-UZ") ?? 0}</td>
            <td>${item.remaining_summa?.toLocaleString("uz-UZ") ?? 0}</td>
            <td>${item.last_delivery_date || ""}</td>
            <td>${item.interval_between || ""}</td>
          </tr>
        `).join("");

        // Jadval sarlavhasi
        const tableHeadHTML = `
          <tr>
            <th>№</th>
            <th>Viloyat</th>
            <th>Ombor</th>
            <th>Shtrix kod</th>
            <th>Tovar turi</th>
            <th>Model</th>
            <th>O‘lcham</th>
            <th>Tovar</th>
            <th>Kod</th>
            <th>O‘lchov birligi</th>
            <th>Qoldiq miqdori</th>
            <th>Narxi</th>
            <th>Summasi</th>
            <th>Oxirgi kirim sana</th>
            <th>Jami kun</th>
          </tr>
        `;

        // Hujjat
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <title></title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
              .header { text-align: center; margin-bottom: 20px; }
              h1 { color: #1E56A0; margin: 0; }
              h2 { margin: 5px 0; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
              th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
              th { background-color: #1E56A0; color: white; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 20px; font-size: 11px; text-align: center; color: #555; }
    
              /* Brauzer header/footerlarini yashirish */
              @page {
                size: auto;
                margin: 10mm;
              }
              @media print {
                body {
                  -webkit-print-color-adjust: exact;
                }
                @page {
                  margin: 10mm;
                }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>E-KOMPLEKTATSIYA</h1>
              <h2>Tovarlar Qoldiq Hisoboti</h2>
              <p><strong>Sana:</strong> ${filterData.date ? filterData.date.format("YYYY-MM-DD HH:mm") : ""}</p>
            </div>
            <table>
              <thead>${tableHeadHTML}</thead>
              <tbody>${buildTableRowsHTML()}</tbody>
            </table>
            <div class="footer">
              <p>Jami: ${productsReport.length} ta yozuv</p>
              <p>Chop etilgan: ${new Date().toLocaleDateString("uz-UZ")} ${new Date().toLocaleTimeString("uz-UZ")}</p>
            </div>
          </body>
          </html>
        `;

        const printWindow = window.open("", "_blank");
        if (!printWindow) return;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    useEffect(() => {
        getRegions();
    }, [])

    useEffect(() => {
        getWarehouses();
    }, [filterData.region])

    return (
        <>

            <div className="bg-slate-50 flex animate-in fade-in duration-500">
                <div className="w-full flex flex-col">
                    {/* Filter */}
                    <div className="bg-white border-b border-slate-200">
                        <Accordion defaultExpanded>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                            >
                                <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Filter</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {/* Grid */}
                                <div className="flex flex-col gap-4">
                                    {/* Tepada joylashadiganlar */}
                                    <div className="flex flex-wrap gap-4">
                                        {/* Sana */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="startDate">Sana</Label>
                                            <DatePicker
                                                showTime
                                                value={filterData.date}
                                                onChange={(date) => setFilterData({ ...filterData, date })}
                                                format="DD-MM-YYYY HH:mm"
                                                className="w-full"
                                            />
                                        </div>

                                        {/* Viloyat */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="endDate">Viloyat</Label>
                                            <div className="flex">
                                            <Select
                                                placeholder="Viloyatni tanlang"
                                                allowClear
                                                value={filterData.region || null}
                                                onChange={(value) => setFilterData({ ...filterData, region: value })}
                                                className="w-full"
                                            >
                                                {regions
                                                    .slice()
                                                    .sort((a, b) => a.name.localeCompare(b.name, "uz"))
                                                    .map(region => (
                                                        <Select.Option key={region.id} value={region.id}>
                                                            {region.name}
                                                        </Select.Option>
                                                    ))}
                                            </Select>
                                            <Button
                                               variant="outlined"
                                               className="rounded-l-none border-l-0"
                                               onClick={() => setFilterData(prev => ({ ...prev, region: "" }))}
                                               disabled={!filterData.region}
                                             >
                                               X
                                            </Button>
                                            </div>
                                        </div>

                                        {/* Ombor */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="warehouse">Ombor</Label>
                                            <div className="flex">
                                                <Select
                                                    placeholder="Omborni tanlang"
                                                    disabled={!filterData.region}
                                                    allowClear
                                                    value={filterData.warehouse || null}
                                                    onChange={(value) => setFilterData({ ...filterData, warehouse: value })}
                                                    className="w-full"
                                                >
                                                    {warehouses
                                                        .slice()
                                                        .sort((a, b) => a.name.localeCompare(b.name, "uz"))
                                                        .map(warehouse => (
                                                            <Select.Option key={warehouse.id} value={warehouse.id}>
                                                                {warehouse.name}
                                                            </Select.Option>
                                                        ))}
                                                </Select>
                                                <Button
                                                variant="outlined"
                                                className="rounded-l-none border-l-0"
                                                onClick={() => {
                                                    setFilterData(prev => ({ ...prev, warehouse: "" }));
                                                }}
                                                disabled={!filterData.warehouse} 
                                                >
                                                X
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Mahsulot */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="bar_code">Shtrix kod</Label>
                                            <div className="flex">
                                                <Input
                                                    placeholder="Shtrix kodni kiriting"
                                                    value={filterData.bar_code || ""}
                                                    onChange={(e) => setFilterData({ ...filterData, bar_code: e.target.value })}
                                                    className="w-full"
                                                />
                                                <Button
                                                    variant="outlined"
                                                    className="rounded-l-none border-l-0"
                                                    onClick={() => {
                                                    setFilterData(prev => ({ ...prev, bar_code: "" }));
                                                    }}
                                                    disabled={!filterData.bar_code}
                                                
                                                >
                                                    X
                                                </Button>
                                            </div>
                                        </div>


                                    </div>

                                    {/* Pastdagi qismi */}
                                    <div className="flex flex-wrap gap-4">

                                        {/* Mahsulot turi */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="product_type">Tovar turi</Label>
                                            <div className="flex">
                                                <Button className="w-full" onClick={() => setFieldName("product_type")}><span className={`${filterData.product_type ? "text-gray-800" : "text-gray-400"}`}>{filterData.product_type ? product_types.results.find((t) => t.id === filterData.product_type)?.name : "Tanlang"}</span>
                                                </Button>
                                                {fieldName === "product_type" && (
                                                    <FieldModal
                                                        field_name={fieldName}
                                                        selectedItem={{ id: filterData.product_type, name: "" }}
                                                        setSelectedItem={newItem => {
                                                            if (newItem) setFilterData(prev => ({ ...prev, product_type: newItem.id }))
                                                            setFieldName("")
                                                        }}
                                                    />
                                                )}
                                                <Button
                                                  variant="outlined"
                                                  className="rounded-l-none border-l-0"
                                                  onClick={() => {
                                                    setFilterData(prev => ({ ...prev, product_type: "" }));
                                                  }}
                                                  disabled={!filterData.product_type}
                                                >
                                                  X
                                                </Button>
                                            </div>
                                            
                                        </div>
                                        {/* Model */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="model">Model</Label>
                                            <div className="flex">
                                                <Button className="w-full" onClick={() => setFieldName("model")}><span className={`${filterData.model ? "text-gray-800" : "text-gray-400"}`}>{filterData.model ? product_models.results.find((t) => t.id === filterData.model)?.name : "Tanlang"}</span>
                                                </Button>
                                                {fieldName === "model" && (
                                                    <FieldModal
                                                        field_name={fieldName}
                                                        selectedItem={{ id: filterData.model, name: "" }}
                                                        setSelectedItem={newItem => {
                                                            if (newItem)
                                                                setFilterData(prev => ({ ...prev, model: newItem.id }));
                                                            setFieldName("");
                                                        }}
                                                        selectedProductTypeId={product_types.results.find(item => item.id === filterData.product_type)?.name}
                                                    />
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    className="rounded-l-none border-l-0"
                                                    onClick={() => {
                                                      setFilterData(prev => ({ ...prev, model: "" }));
                                                    }}
                                                    disabled={!filterData.model}
                                                
                                                  >
                                                    X
                                                </Button>
                                            </div>

                                        </div>

                                        {/* O'lcham */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="size">O'lcham</Label>
                                            <div className="flex">
                                                <Button className="w-full" onClick={() => setFieldName("size")}><span className={`${filterData.size ? "text-gray-800" : "text-gray-400"}`}>{filterData.size ? product_sizes.results.find((t) => t.id === filterData.size)?.name : "Tanlang"}</span>
                                                </Button>
                                                {fieldName === "size" && (
                                                    <FieldModal
                                                        field_name="size"
                                                        selectedItem={{ id: filterData.size, name: "" }}
                                                        setSelectedItem={newItem => {
                                                            if (newItem) setFilterData(prev => ({ ...prev, size: newItem.id }))
                                                            setFieldName("")
                                                        }}
                                                        selectedProductTypeId={product_types.results.find(item => item.id === filterData.product_type)?.name}
                                                        selectedModelId={product_models.results.find(item => item.id === filterData.model)?.name}
                                                    />
                                                )}
                                                <Button
                                                  variant="outlined"
                                                  className="rounded-l-none border-l-0"
                                                  onClick={() => {
                                                    setFilterData(prev => ({ ...prev, size: "" }));
                                                  }}
                                                  disabled={!filterData.size}
                                                  
                                                >
                                                  X
                                                </Button>
                                            </div>
                                            
                                        </div>
                                        {/* Mahsulot */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="product">Tovar</Label>
                                            <div className="flex">
                                                <Button disabled={!filterData.product_type} className="w-full" onClick={() => setFieldName("product")}><span className={`${filterData.product ? "text-gray-800" : "text-gray-400"}`}>{filterData.product ? products.results.find((t) => t.id === filterData.product)?.name : "Tanlang"}</span>
                                                </Button>
                                                {fieldName === "product" && (
                                                    <FieldModal
                                                        field_name="product"
                                                        selectedItem={{ id: filterData.product, name: "" }}
                                                        setSelectedItem={newItem => {
                                                            if (newItem) setFilterData(prev => ({ ...prev, product: newItem.id }))
                                                            setFieldName("")
                                                        }}
                                                        selectedProductTypeId={product_types.results.find(item => item.id === filterData.product_type)?.name}
                                                        selectedModelId={product_models.results.find(item => item.id === filterData.model)?.name}
                                                        selectedSizeId={product_sizes.results.find(item => item.id === filterData.size)?.name}
                                                    />
                                                )
                                                }
                                                <Button
                                                    variant="outlined"
                                                    className="rounded-l-none border-l-0"
                                                    onClick={() => {
                                                      setFilterData(prev => ({ ...prev, product: "" }));
                                                    }}
                                                     disabled={!filterData.product}>
                                                    X
                                                </Button>
                                            </div>
                                        </div>

                                    </div>
                                </div>

                            </AccordionDetails>
                        </Accordion>
                    </div>

                    {/* Table */}
                    <div className="p-4">
                        <div className='flex items-center gap-4 mb-4'>
                            <Button type="primary" onClick={getRemaindersReport}>
                                Shakllantirish
                            </Button>
                            <Button type='default' onClick={handlePrint}>
                                <Printer size={16} />
                                Chop etish
                            </Button>
                            <Button type='default' onClick={() => setHandleDownloadModal(true)}>
                                <Download size={16} />
                                Yuklab olish
                            </Button>
                        </div>
                        <div className="overflow-y-auto border border-gray-300 rounded"
                            style={{ maxHeight: "calc(100vh - 250px)" }}>

                            <Table className="border-collapse w-full">
                                <TableHeader>
                                    <TableRow className="bg-gray-200 sticky top-0 z-10">
                                        <TableHead className="border border-gray-300">#</TableHead>
                                        <TableHead className="border border-gray-300">Вилоятлар</TableHead>
                                        <TableHead className="border border-gray-300">Омборлар</TableHead>
                                        <TableHead className="border border-gray-300">Штрих код</TableHead>
                                        <TableHead className="border border-gray-300">Товар тури</TableHead>
                                        <TableHead className="border border-gray-300">Модел</TableHead>
                                        <TableHead className="border border-gray-300">Ўлчам</TableHead>
                                        <TableHead className="border border-gray-300">Товар ва материаллар</TableHead>
                                        <TableHead className="border border-gray-300">Товар коди</TableHead>
                                        <TableHead className="border border-gray-300">Ўл.бир</TableHead>
                                        <TableHead className="border border-gray-300">Қолдиқ миқдори</TableHead>
                                        <TableHead className="border border-gray-300">Нархи</TableHead>
                                        <TableHead className="border border-gray-300">Сумма</TableHead>
                                        <TableHead className="border border-gray-300">Охирги кирим сана</TableHead>
                                        <TableHead className="border border-gray-300">Жами кун</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <tbody>
                                    {productsReport.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="border border-gray-300">{index + 1}</TableCell>
                                            <TableCell className="border border-gray-300">
                                                {regions.find(r => r.id === filterData.region)?.name || ""}
                                            </TableCell>
                                            <TableCell className="border border-gray-300">
                                                {warehouses.find(w => w.id === filterData.warehouse)?.name || ""}
                                            </TableCell>
                                            <TableCell className="border border-gray-300">{item.bar_code}</TableCell>
                                            <TableCell className="border border-gray-300">{item.product_type.name}</TableCell>
                                            <TableCell className="border border-gray-300">{item.model.name}</TableCell>
                                            <TableCell className="border border-gray-300">{item.size.name}</TableCell>
                                            <TableCell className="border border-gray-300 whitespace-normal break-words max-w-[500px]">
                                                {item.product.name}
                                            </TableCell>
                                            <TableCell className="border border-gray-300">{item.product_code}</TableCell>
                                            <TableCell className="border border-gray-300">{item.unit.name}</TableCell>
                                            <TableCell className="border border-gray-300">{item.remaining_quantity}</TableCell>
                                            <TableCell className="border border-gray-300">{item.price.toLocaleString()} UZS</TableCell>
                                            <TableCell className="border border-gray-300">{item.remaining_summa.toLocaleString()} UZS</TableCell>
                                            <TableCell className="border border-gray-300">{item.last_delivery_date.split("T").join(" ")}</TableCell>
                                            <TableCell className="border border-gray-300">{item.interval_between}</TableCell>
                                        </TableRow>
                                    ))}
                                </tbody>
                            </Table>
                        </div>


                    </div>
                </div>
            </div>

            {handleDownloadModal && (
                <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
                        <h2 className="text-xl font-semibold mb-4">Yuklab olish</h2>

                        <div className="space-y-3">
                            {/* Fayl nomi */}
                            <div className="flex flex-col gap-2">
                                <Label>Fayl nomi</Label>
                                <input
                                    id="download-filename"
                                    type="text"
                                    defaultValue={`TovarlarQoldiq_${dayjs().format("YYYY-MM-DD_HH:mm")}`}
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Fayl nomini kiriting"
                                />
                            </div>
                            {/* Fayl turi */}
                            <div className="flex flex-col gap-2">
                                <Label>Fayl turi</Label>
                                <select
                                    id="download-extension"
                                    defaultValue="excel"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="xlsx">Excel (.xlsx)</option>
                                    <option value="pdf">PDF</option>
                                </select>
                            </div>
                        </div>

                        {/* Tugmalar */}
                        <div className="mt-6 flex justify-end gap-2">
                            <Button onClick={() => setHandleDownloadModal(false)}>Bekor qilish</Button>
                            <Button
                                type="primary"
                                onClick={() => {
                                    if (!productsReport || productsReport.length === 0) {
                                        window.alert("Avval hisobotni shakillantiring.");
                                        return;
                                    }

                                    const nameInput = document.getElementById("download-filename") as HTMLInputElement | null;
                                    const extSelect = document.getElementById("download-extension") as HTMLSelectElement | null;
                                    const filename = (nameInput?.value || "hisobot").trim();
                                    const ext = (extSelect?.value || "pdf").toLowerCase();

                                    const regionName = regions.find(r => r.id === filterData.region)?.name || "";
                                    const warehouseName = warehouses.find(w => w.id === filterData.warehouse)?.name || "";

                                    // Excel (.xlsx)

                                    const downloadXLSX = async () => {
                                        const workbook = new ExcelJS.Workbook();
                                        const worksheet = workbook.addWorksheet("Hisobot");

                                        // 🔹 Title
                                        worksheet.mergeCells(1, 1, 1, 15);
                                        const titleCell = worksheet.getCell("A1");
                                        titleCell.value = "Товар ва материаллар қолдиғи хисоботи";
                                        titleCell.font = { name: "Arial", size: 16, bold: true };
                                        titleCell.alignment = { horizontal: "center", vertical: "middle" };

                                        worksheet.mergeCells(2, 1, 2, 15);
                                        const dateCell = worksheet.getCell("A2");
                                        dateCell.value = `Сана: ${dayjs().format("YYYY-MM-DD HH:mm")}`;
                                        dateCell.font = { name: "Arial", size: 12 };
                                        dateCell.alignment = { horizontal: "center", vertical: "middle" };

                                        // 🔹 Headers
                                        const headers = [
                                            "№", "Viloyat", "Ombor", "Shtrix kod", "Tovar turi", "Model", "O‘lcham",
                                            "Tovar", "Kod", "O‘lchov birligi", "Qoldiq miqdori", "Narxi",
                                            "Summasi", "Oxirgi kirim sana", "Jami kun"
                                        ];
                                        worksheet.addRow(headers);

                                        worksheet.getRow(3).font = { bold: true };
                                        worksheet.getRow(3).alignment = { horizontal: "center" };
                                        worksheet.getRow(3).eachCell((cell) => {
                                            cell.fill = {
                                                type: "pattern",
                                                pattern: "solid",
                                                fgColor: { argb: "1E56A0" },
                                            };
                                            cell.font = { color: { argb: "FFFFFF" }, bold: true };
                                            cell.border = {
                                                top: { style: "thin" },
                                                left: { style: "thin" },
                                                bottom: { style: "thin" },
                                                right: { style: "thin" },
                                            };
                                        });

                                        // 🔹 Format funksiyalari
                                        const formatPrice = (num?: number | string | null) => {
                                            if (num == null || num === "") return "";
                                            const n = Number(num);
                                            return n.toLocaleString("ru-RU", {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }); // 26 520.00
                                        };

                                        const formatQuantity = (num?: number | string | null) => {
                                            if (num == null || num === "") return "";
                                            const n = Number(num);
                                            return n.toLocaleString("ru-RU"); // 12 345
                                        };


                                        const formatSumma = (num?: number | string | null) => {
                                            if (num == null || num === "") return "";
                                            const n = Number(num);
                                            // Agar kasr bo'lsa, o'zini ko'rsatamiz (butun emas)
                                            if (Number.isInteger(n)) {
                                                return n.toLocaleString("ru-RU"); // 3 449 850
                                            } else {
                                                return n.toLocaleString("ru-RU", {
                                                    minimumFractionDigits: 0,
                                                    maximumFractionDigits: 2,
                                                }); // 3 004.27
                                            }
                                        };


                                        let totalQuantity = 0;
                                        let totalSum = 0;

                                        // 🔹 Data rows
                                        productsReport.forEach((item, idx) => {
                                            const quantity = item.remaining_quantity ?? 0;
                                            const price = item.price ?? 0;
                                            const sum = quantity * price;

                                            totalQuantity += quantity;
                                            totalSum += sum;

                                            worksheet.addRow([
                                                idx + 1,
                                                regionName,
                                                warehouseName,
                                                item.bar_code || "",
                                                item.product_type?.name || "",
                                                item.model?.name || "",
                                                item.size?.name || "",
                                                item.product?.name || "",
                                                item.product_code || "",
                                                item.unit?.name || "",
                                                formatQuantity(quantity),   // qoldiq
                                                formatPrice(price),         // narx (.00)
                                                formatSumma(sum),           // summa (.00 yo‘q)
                                                (item.last_delivery_date || "").replace("T", " "),
                                                item.interval_between || ""
                                            ]);
                                        });

                                        // 🔹 Umumiy satr
                                        const totalRow = worksheet.addRow([
                                            "Jami", "", "", "", "", "", "", "", "", "",
                                            formatQuantity(totalQuantity), // qoldiq umumiy
                                            "", // narx umumiy emas
                                            formatSumma(totalSum),         // summa umumiy (.00 qo‘shilmaydi)
                                            "",
                                            ""
                                        ]);
                                        totalRow.font = { bold: true };

                                        totalRow.eachCell((cell) => {
                                            cell.border = {
                                                top: { style: "thin" },
                                                left: { style: "thin" },
                                                bottom: { style: "double" },
                                                right: { style: "thin" },
                                            };
                                        });

                                        // 🔹 Ustun align
                                        worksheet.columns.forEach((col, i) => {
                                            // Sana, Summasi, Narxi, Qoldiq, Kod, O‘lchov, O‘lcham, Jami kun → center
                                            if ([7, 9, 10, 11, 12, 13, 15].includes(i + 1)) {
                                                col.alignment = { horizontal: "center", vertical: "middle" };
                                            } else {
                                                col.alignment = { horizontal: "left", vertical: "middle" };
                                            }
                                            col.width = 20;
                                        });

                                        worksheet.getColumn(1).width = 4; // №

                                        // 🔹 Export
                                        const buffer = await workbook.xlsx.writeBuffer();
                                        const blob = new Blob([buffer], {
                                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        });
                                        saveAs(blob, `${filename}.${ext}`);
                                    };

                                    // PDF — print dialog orqali
                                    const buildHTMLDocument = () => `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <title>Tovarlar Qoldiq Hisoboti</title>
                <style>
                  body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
                  .header { text-align: center; margin-bottom: 20px; }
                  h1 { color: #1E56A0; margin: 0; }
                  table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                  th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
                  th { background-color: #1E56A0; color: white; }
                  tr:nth-child(even) { background-color: #f9f9f9; }
                  .footer { margin-top: 20px; font-size: 11px; text-align: center; color: #555; }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>Tovarlar Qoldiq Hisoboti</h1>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>№</th>
                      <th>Viloyat</th>
                      <th>Ombor</th>
                      <th>Shtrix kod</th>
                      <th>Tovar turi</th>
                      <th>Model</th>
                      <th>O‘lcham</th>
                      <th>Tovar</th>
                      <th>Kod</th>
                      <th>O‘lchov birligi</th>
                      <th>Qoldiq miqdori</th>
                      <th>Narxi</th>
                      <th>Summasi</th>
                      <th>Oxirgi kirim sana</th>
                      <th>Jami kun</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${productsReport.map((item, idx) => `
                      <tr>
                        <td>${idx + 1}</td>
                        <td>${regionName}</td>
                        <td>${warehouseName}</td>
                        <td>${item.bar_code || ""}</td>
                        <td>${item.product_type?.name || ""}</td>
                        <td>${item.model?.name || ""}</td>
                        <td>${item.size?.name || ""}</td>
                        <td>${item.product?.name || ""}</td>
                        <td>${item.product_code || ""}</td>
                        <td>${item.unit?.name || ""}</td>
                        <td>${item.remaining_quantity ?? 0}</td>
                        <td>${item.price ?? 0}</td>
                        <td>${item.remaining_summa ?? 0}</td>
                        <td>${item.last_delivery_date || ""}</td>
                        <td>${item.interval_between || ""}</td>
                      </tr>`).join("")}
                  </tbody>
                </table>
                <div class="footer">
                  <p>Jami: ${productsReport.length} ta yozuv</p>
                  <p>Chop etilgan: ${new Date().toLocaleDateString("uz-UZ")} ${new Date().toLocaleTimeString("uz-UZ")}</p>
                </div>
              </body>
              </html>
            `;

                                    if (ext === "pdf") {
                                        const printWindow = window.open("", "_blank");
                                        if (!printWindow) return;
                                        printWindow.document.write(buildHTMLDocument());
                                        printWindow.document.close();
                                        printWindow.print();

                                        toast.success("✅ PDF yuklab olindi!");
                                    } else if (ext === "xlsx") {
                                        downloadXLSX().then(() => {
                                            toast.success("✅ Excel yuklab olindi!");
                                        });
                                    }

                                    setHandleDownloadModal(false);
                                }}
                            >
                                Yuklab olish
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                open={open}
                onOk={() => setOpen(false)}
                cancelButtonProps={{ style: { display: "none" } }}
                closable={false}
                centered
                width={450}
                footer={[
                    <Button
                        key="ok"
                        type="primary"
                        style={{
                            borderRadius: "8px",
                            padding: "6px 25px",
                            backgroundColor: "blue",
                            color: "#fff",
                            border: "none",
                        }}
                        onClick={() => setOpen(false)}
                    >
                        OK
                    </Button>,
                ]}
                maskStyle={{
                    backgroundColor: "rgba(0, 0, 0, 0.45)", 
                }}
                bodyStyle={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "220px",
                    backgroundColor: "#52c41a", 
                    borderRadius: "12px",
                    color: "white",
                }}
            >
                {/* 🔹 Icon animatsiya bilan */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1.1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 15,
                    }}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <CheckCircleOutlined style={{ fontSize: "70px", color: "white" }} />
                </motion.div>

                {/* 🔹 Matn animatsiya bilan */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                        marginTop: "20px",
                        fontSize: "20px",
                        fontWeight: "600",
                        textAlign: "center",
                    }}
                >
                    Hisobot muvaffaqiyatli shakillantirildi
                </motion.div>
            </Modal>

        </>
    )
}

export default ProductMaterialsBalance