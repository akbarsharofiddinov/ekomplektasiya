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
import { Table, TableCell, TableHeader, TableRow } from '@/components/UI/table';

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
    const [productsReport, setProductsReport] = React.useState<any[]>([]);

    const { regions } = useAppSelector(state => state.info);
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

    // Get product turnover report based on filterData
    const getProductTurnoverReport = async () => {
        try {
            const response = await axiosAPI.get(`/reports/product-turnover/`, {
                params: {
                    date: filterData.date ? filterData.date.format('YYYY-MM-DD') : undefined,
                    region: filterData.region || undefined,
                    warehouse: filterData.warehouse || undefined,
                    product: filterData.product || undefined,
                    bar_code: filterData.bar_code || undefined,
                    product_type: filterData.product_type || undefined,
                    model: filterData.model || undefined,
                    size: filterData.size || undefined,
                }
            });
            if (response.status === 200) {
                setProductsReport(response.data);
            }
        } catch (error) {
            console.log(error)
        }
    }

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
                                <div
                                    // className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4"
                                    className="flex flex-wrap gap-4 p-4"
                                >
                                    {/* Date Range */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="startDate">Sana</Label>
                                        <DatePicker
                                            showTime
                                            value={filterData.date}
                                            onChange={(date) => setFilterData({ ...filterData, date })}
                                            style={{ width: 150 }}
                                        />
                                    </div>
                                    {/* Region */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="endDate">Viloyat</Label>
                                        <Select
                                            placeholder="Viloyatni tanglang"
                                            allowClear value={filterData.region || null}
                                            onChange={(value) => setFilterData({ ...filterData, region: value })}
                                            style={{ width: 150 }}
                                        >
                                            {regions.map(region => (
                                                <Select.Option key={region.id} value={region.id}>{region.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    {/* Warehouse */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="warehouse">Ombor</Label>
                                        <Select
                                            placeholder="Omborni tanglang"
                                            disabled={filterData.region ? false : true}
                                            allowClear value={filterData.warehouse || null}
                                            onChange={(value) => setFilterData({ ...filterData, warehouse: value })}
                                            style={{ width: 160 }}
                                        >
                                            {warehouses.map(warehouse => (
                                                <Select.Option key={warehouse.id} value={warehouse.id}>{warehouse.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    {/* Product */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="product">Mahsulot</Label>
                                        <Select
                                            placeholder="Mahsulotni tanglang"
                                            showSearch
                                            allowClear value={filterData.product || null}
                                            onChange={(value) => setFilterData({ ...filterData, product: value })}
                                            style={{ width: 150 }}
                                        >
                                            {products.map(product => (
                                                <Select.Option key={product.id} value={product.id}>{product.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    {/* Product type */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="product_type">Mahsulot turi</Label>
                                        <Select
                                            placeholder="Mahsulot turini tanglang"
                                            showSearch
                                            allowClear value={filterData.product_type || null}
                                            onChange={(value) => setFilterData({ ...filterData, product_type: value })}
                                            style={{ width: 150 }}
                                        >
                                            {productTypes.map(productType => (
                                                <Select.Option key={productType.id} value={productType.id}>{productType.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    {/* Size */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="size">O'lcham</Label>
                                        <Select
                                            placeholder="O'lchamni tanglang"
                                            showSearch
                                            allowClear value={filterData.size || null}
                                            onChange={(value) => setFilterData({ ...filterData, size: value })}
                                            style={{ width: 150 }}
                                        >
                                            {sizes.map(size => (
                                                <Select.Option key={size.id} value={size.id}>{size.name}</Select.Option>
                                            ))}
                                        </Select>
                                    </div>
                                    {/* Bar code */}
                                    <div className="flex flex-col">
                                        <Label htmlFor="bar_code">Shtrix kod</Label>
                                        <Input
                                            placeholder="Shtrix kodni kiriting"
                                            value={filterData.bar_code || ''}
                                            onChange={(e) => setFilterData({ ...filterData, bar_code: e.target.value })}
                                            style={{ width: 160 }}
                                        />
                                    </div>
                                </div>
                            </AccordionDetails>
                        </Accordion>
                    </div>

                    {/* Table */}
                    <div className="p-4">
                        <Button type="primary" className="mb-4" onClick={() => { getProductTurnoverReport() }}>Shakillantirish</Button>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableCell className="whitespace-nowrap font-bold">#</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">Viloyat</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">Ombor</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">Shtrix kod</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">Tovar va materiallar</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">Tovar turi</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">Model</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">O'lcham</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">O'lchov birligi</TableCell>
                                        <TableCell className="whitespace-nowrap font-bold">O'lchov birligi</TableCell>
                                    </TableRow>
                                </TableHeader>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default ProductMaterialsBalance