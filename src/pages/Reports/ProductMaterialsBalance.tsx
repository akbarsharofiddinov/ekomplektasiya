/* eslint-disable react-hooks/exhaustive-deps */
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import React, { useEffect } from 'react'
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
import { saveAs } from "file-saver";
import toast from "react-hot-toast";

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
    const [sizes, setSizes] = React.useState<Array<{ id: string, name: string }>>([]);
    const [productTypes, setProductTypes] = React.useState<Array<{ id: string, name: string, number: number }>>([]);
    const [productsReport, setProductsReport] = React.useState<WarehouseItem[]>([]);
    const [handleDownloadModal, setHandleDownloadModal] = React.useState(false);

    const { regions  } = useAppSelector(state => state.info);
    const { products } = useAppSelector(state => state.product)
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

    const getProducts = async () => {
        try {
            const response = await axiosAPI.get(`/products/list/?order_by=2`);
            if (response.status === 200) {
                dispatch(setProducts(response.data.results));
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getProductTypes = async () => {
        try {
            const response = await axiosAPI.get(`/product_types/list/?order_by=2`);
            if (response.status === 200) {
                setProductTypes(response.data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    const getSizes = async () => {
        try {
            const response = await axiosAPI.get(`/sizes/list/?order_by=2`);
            if (response.status === 200) {
                setSizes(response.data);
            }
        } catch (error) {
            console.log(error)
        }
    }

    // Get remainders report (API POST)
    const getRemaindersReport = async () => {
        try {
            const response = await axiosAPI.post(`/remainders/warehouses/`, {
                warehouse: filterData.warehouse || undefined,
                date: filterData.date ? filterData.date.format('YYYY-MM-DDTHH:mm:ss') : undefined,
                product: filterData.product || undefined,
                product_type: filterData.product_type || undefined,
                model: filterData.model || undefined,
                size: filterData.size || undefined,
                bar_code: filterData.bar_code || undefined,
            });
            if (response.status === 200) {
                setProductsReport(response.data);
            }
        } catch (error) {
            console.log(error);
        }
    };

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
        getProducts();
        getProductTypes();
        getSizes();
    }, [])

    useEffect(() => {
        getWarehouses();
    }, [filterData.region])

    return (
        <>
            <div className="bg-slate-50 flex animate-in fade-in duration-500">
                <div className="w-full flex flex-col">
                    {/* Filter */}
                    <div className="bg-white border-b border-slate-200 mb-2">
                        <Accordion defaultExpanded>
                            <AccordionSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                            >
                                <Typography fontSize={"20px"} fontWeight={600} color="#0f172b">Filter</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                {/* Grid */}
                                <div className="flex flex-col gap-4 p-4">
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
                                        </div>

                                        {/* Ombor */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="warehouse">Ombor</Label>
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
                                        </div>
                                    </div>

                                    {/* Pastdagi qismi */}
                                    <div className="flex flex-wrap gap-4">
                                        {/* Mahsulot */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="product">Mahsulot</Label>
                                            <Select
                                                placeholder="Mahsulotni tanlang"
                                                showSearch
                                                allowClear
                                                value={filterData.product || null}
                                                onChange={(value) => setFilterData({ ...filterData, product: value })}
                                                className="w-full"
                                            >
                                                {products.map(product => (
                                                    <Select.Option key={product.id} value={product.id}>
                                                        {product.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </div>

                                        {/* Mahsulot turi */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="product_type">Mahsulot turi</Label>
                                            <Select
                                                placeholder="Mahsulot turini tanlang"
                                                showSearch
                                                allowClear
                                                value={filterData.product_type || null}
                                                onChange={(value) => setFilterData({ ...filterData, product_type: value })}
                                                className="w-full"
                                            >
                                                {productTypes.map(productType => (
                                                    <Select.Option key={productType.id} value={productType.id}>
                                                        {productType.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </div>

                                        {/* O'lcham */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="size">O'lcham</Label>
                                            <Select
                                                placeholder="O'lchamni tanlang"
                                                showSearch
                                                allowClear
                                                value={filterData.size || null}
                                                onChange={(value) => setFilterData({ ...filterData, size: value })}
                                                className="w-full"
                                            >
                                                {sizes.map(size => (
                                                    <Select.Option key={size.id} value={size.id}>
                                                        {size.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </div>

                                        {/* Shtrix kod */}
                                        <div className="flex flex-col gap-2 flex-1 min-w-[200px]">
                                            <Label htmlFor="bar_code">Shtrix kod</Label>
                                            <Input
                                                placeholder="Shtrix kodni kiriting"
                                                value={filterData.bar_code || ""}
                                                onChange={(e) => setFilterData({ ...filterData, bar_code: e.target.value })}
                                                className="w-full"
                                            />
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
                                Shakillantirish
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
                        <div className="overflow-y-auto border border-gray-300 rounded max-h-[calc(100vh-250px)]" >

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
                                            <TableCell className="border border-gray-300">{item.price}</TableCell>
                                            <TableCell className="border border-gray-300">{item.remaining_summa}</TableCell>
                                            <TableCell className="border border-gray-300">{item.last_delivery_date}</TableCell>
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
                                    defaultValue="pdf"
                                    className="w-full border border-slate-300 rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="pdf">PDF</option>
                                    <option value="xlsx">Excel (.xlsx)</option>
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

                                    const extSelect = document.getElementById("download-extension") as HTMLSelectElement | null;
                                    const ext = (extSelect?.value || "pdf").toLowerCase();

                                    const regionName = regions.find(r => r.id === filterData.region)?.name || "";
                                    const warehouseName = warehouses.find(w => w.id === filterData.warehouse)?.name || "";

                                    // Excel (.xlsx)

                                    const downloadXLSX = async () => {
                                        const workbook = new ExcelJS.Workbook();
                                        const worksheet = workbook.addWorksheet("Hisobot");

                                        // 🔹 Title 1-qator
                                        worksheet.mergeCells(1, 1, 1, 15);
                                        const titleCell = worksheet.getCell("A1");
                                        titleCell.value = "Товар ва материаллар қолдиғи хисоботи";
                                        titleCell.font = { name: "Arial", size: 16, bold: true };
                                        titleCell.alignment = { horizontal: "center", vertical: "middle" };

                                        // 🔹 Title 2-qator (sana alohida qator)
                                        worksheet.mergeCells(2, 1, 2, 15);
                                        const dateCell = worksheet.getCell("A2");
                                        dateCell.value = `Сана: ${dayjs().format("YYYY-MM-DD HH:mm")}`;
                                        dateCell.font = { name: "Arial", size: 16, bold: true };
                                        dateCell.alignment = { horizontal: "center", vertical: "middle" };

                                        // 🔹 Header row (3-qator)
                                        const headers = [
                                            "№", "Viloyat", "Ombor", "Shtrix kod", "Tovar turi", "Model", "O‘lcham",
                                            "Tovar", "Kod", "O‘lchov birligi", "Qoldiq miqdori", "Narxi",
                                            "Summasi", "Oxirgi kirim sana", "Jami kun"
                                        ];
                                        worksheet.addRow(headers);

                                        // 🔹 Header style
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

                                        // 🔹 Rows (data)
                                        productsReport.forEach((item, idx) => {
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
                                                item.remaining_quantity ?? 0,
                                                item.price ?? 0,
                                                item.remaining_summa ?? 0,
                                                item.last_delivery_date || "",
                                                item.interval_between || ""
                                            ]);
                                        });

                                        // 🔹 Column widths
                                        worksheet.columns.forEach((col, index) => {
                                            if (index === 0) col.width = 4;   // № (juda kichkina)
                                            else if (index === 1) col.width = 20; // Viloyat kengroq
                                            else if (index === 2) col.width = 25; // Ombor kengroq
                                            else col.width = 20; // qolganlari standart
                                        });

                                        // 🔹 Export
                                        const buffer = await workbook.xlsx.writeBuffer();
                                        const blob = new Blob([buffer], {
                                            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                                        });
                                        saveAs(blob, `TovarlarQoldiq_${dayjs().format("YYYY-MM-DD_HH-mm")}.xlsx`);
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


        </>
    )
}

export default ProductMaterialsBalance