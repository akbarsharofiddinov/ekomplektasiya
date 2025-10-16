/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import { Button, Pagination, Spin, Alert } from 'antd';
import {
  fetchProductTypesPaginationData,
  fetchProductModelsPaginationData,
  fetchProductSizesPaginationData,
  fetchProductUnitsPaginationData,
  fetchProductPaginationData,
} from '@/services/axiosAPI';
import { useAppDispatch } from '@/store/hooks/hooks';
import { setProductModels, setProducts, setProductSizes, setProductUnits } from '@/store/productSlice/productSlice';

interface IResultsType {
  id: string | number;
  number: number;
  name: string;
  name_uz: string;
  product_type?: string;
  model?: string;
  size?: string;
  unit?: string;
}

interface FieldModalProps {
  field_name: 'product' | 'product_type' | 'model' | 'size' | 'unit';
  selectedProductTypeId?: string;
  selectedModelId?: string;
  selectedSizeId?: string;
  menuItems?: {
    count: number;
    limit: number;
    offset: number;
    results: IResultsType[];
  } | null;
  selectedItem: { id: string; name: string } | null;
  setSelectedItem: (item: { id: string; name: string } | null) => void;
}

const DEFAULT_PAGE_SIZE = 25;

const FieldModal: React.FC<FieldModalProps> = ({
  field_name,
  selectedProductTypeId,
  selectedModelId,
  selectedSizeId,
  menuItems = null,
  selectedItem,
  setSelectedItem,
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [items, setItems] = React.useState<IResultsType[]>(menuItems?.results ?? []);
  const [total, setTotal] = React.useState<number>(menuItems?.count ?? 0);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(menuItems?.limit ?? DEFAULT_PAGE_SIZE);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(
    selectedItem?.id ?? null
  );
  const dispatch = useAppDispatch()

  useEffect(() => {
    setSelectedId(selectedItem?.id ?? null);
  }, [selectedItem]);

  useEffect(() => {
    if (menuItems) {
      setItems(menuItems.results);
      setTotal(menuItems.count);
      setPageSize(menuItems.limit);
      setPage(Math.floor((menuItems.offset ?? 0) / (menuItems.limit ?? DEFAULT_PAGE_SIZE)) + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuItems?.results, menuItems?.count, menuItems?.limit, menuItems?.offset]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const highlightSearchTerm = (text: string, term: string): React.ReactNode => {
    if (!term.trim()) return text;
    const q = term.trim().toLowerCase();
    const lowerText = text.toLowerCase();

    if (lowerText.startsWith(q)) {
      return (
        <>
          <span className="bg-yellow-200 text-yellow-800 font-semibold px-1 rounded">
            {text.substring(0, term.length)}
          </span>
          {text.substring(term.length)}
        </>
      );
    }
    const idx = lowerText.indexOf(q);
    if (idx !== -1) {
      return (
        <>
          {text.substring(0, idx)}
          <span className="bg-yellow-200 text-yellow-800 font-semibold px-1 rounded">
            {text.substring(idx, idx + term.length)}
          </span>
          {text.substring(idx + term.length)}
        </>
      );
    }
    return text;
  };

  // choose correct fetcher based on field_name
  const fetchPage = async (p: number, l: number) => {
    setLoading(true);
    setError(null);
    const offset = (p - 1) * l;

    try {
      let response: any = null;
      switch (field_name) {
        case 'product_type':
          response = await fetchProductTypesPaginationData(l, offset);
          break;
        case 'model':
          // pass undefined when no filter rather than false
          response = await fetchProductModelsPaginationData(
            l,
            offset,
            selectedProductTypeId || undefined
          );
          break;
        case 'size':
          response = await fetchProductSizesPaginationData(
            l,
            offset,
            selectedProductTypeId || undefined,
            selectedModelId || undefined
          );
          break;
        case 'product':
          response = await fetchProductPaginationData(
            l,
            offset,
            selectedProductTypeId || undefined,
            selectedModelId || undefined,
            selectedSizeId || undefined,
          );
          break;
        case 'unit':
          response = await fetchProductUnitsPaginationData(l, offset);
          break;
        default:
          response = null;
      }

      if (response) {
        setItems(response.results ?? []);
        setTotal(response.count ?? 0);
        if (field_name === "model") dispatch(setProductModels(response));
        else if (field_name === "size") dispatch(setProductSizes(response));
        else if (field_name === "unit") dispatch(setProductUnits(response));
        else if (field_name === "product") dispatch(setProducts(response));
      } else {
        setItems([]);
        setTotal(0);
      }
    } catch (err) {
      console.error(err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Re-fetch on page, pageSize, field_name, and relevant filters change
    fetchPage(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, field_name, selectedProductTypeId, selectedModelId, selectedSizeId]);

  // filtered view (client-side) - filters only current page items
  const filteredItems = React.useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return items;
    return items.filter((item) => {
      const name = item.name || '';
      const nameUz = item.name_uz || '';
      const pt = item.product_type || '';
      const mdl = item.model || '';
      const sz = item.size || '';
      const un = item.unit || '';

      return (
        name.toLowerCase().includes(q) ||
        nameUz.toLowerCase().includes(q) ||
        pt.toLowerCase().includes(q) ||
        mdl.toLowerCase().includes(q) ||
        sz.toLowerCase().includes(q) ||
        un.toLowerCase().includes(q)
      );
    });
  }, [items, searchTerm]);

  const onRowSelect = (item: IResultsType) => {
    setSelectedId((prev) => (prev === String(item.id) ? null : String(item.id)));
  };

  const onConfirm = () => {
    const selected = items.find((r) => String(r.id) === String(selectedId)) ?? null;
    if (selected) {
      setSelectedItem({ id: String(selected.id), name: selected.name || selected.name_uz || '' });
    } else {
      setSelectedItem(null);
    }
  };

  const onCancel = () => {
    // Parentda: if (newItem) {...} bo'lgani uchun null yuboramiz
    setSelectedItem(null);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] min-h-[90vh] flex flex-col">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {field_name === 'product_type' ? 'Tovar turi' : 
              field_name === 'model' ? 'Model' : 
              field_name === 'size' ? "O'lcham" : 
              field_name === 'unit' ? "O'lchov birligi" : 
              field_name === 'product' ? "Maxsulot" : "-"
              }

            </h2>
          </div>
          <p className="text-sm text-gray-600 pt-1">
            Ko'rsatilmoqda: {filteredItems.length} / Jami: {total}
          </p>
        </div>

        <div className="px-3 py-2">
          <div className="relative">
            <input
              type="search"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Tovar nomi bo'yicha qidirish..."
              className="border border-gray-300 rounded-lg py-2 px-4 w-full pr-10"
              aria-label="Qidiruv"
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-500 mt-2">
              "{searchTerm}" uchun {filteredItems.length} ta natija topildi
            </p>
          )}
        </div>

        <div className="flex-1 overflow-auto p-4">
          <div className="h-full overflow-x-auto">
            {error && <Alert type="error" message={error} className="mb-4" />}
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider" />
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomer
                  </th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nomi
                  </th>
                  {field_name !== "product_type" && field_name !== 'unit' && (
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tovar turi
                    </th>
                  )}
                  {(field_name !== "product_type" && field_name !== "model" && field_name !== 'unit') && (
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Model
                    </th>
                  )}
                  {field_name === "unit" || field_name === "product" && (
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      O'lcham
                    </th>
                  )}
                  {field_name === "product"  && (
                    <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      O'lchov birligi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <Spin />
                    </td>
                  </tr>
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const isSelected = String(selectedId) === String(item.id);
                    const displayName = item.name || item.name_uz || '—';
                    const truncatedName =
                      displayName.length > 40 ? displayName.slice(0, 40) + '...' : displayName;

                    return (
                      <tr
                        key={String(item.id)}
                        onClick={() => onRowSelect(item)}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''
                          }`}
                        role="button"
                        aria-pressed={isSelected}
                      >
                        <td className="text-center px-4 py-3 text-sm">
                          <input
                            type="radio"
                            name="selectedItem"
                            checked={isSelected}
                            onChange={() => onRowSelect(item)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={`Select ${displayName}`}
                          />
                        </td>
                        <td className="text-center px-4 py-3 text-sm font-medium text-gray-900">
                          {item.number}
                        </td>
                        <td className="text-center px-4 py-3 text-sm text-gray-900">
                          <div className="max-w-xs" title={displayName}>
                            <span>{highlightSearchTerm(truncatedName, searchTerm)}</span>
                          </div>
                        </td>
                        {field_name !== "product_type" && field_name !== 'unit' && (
                          <td className="text-center px-4 py-3 text-sm text-gray-900">
                            {item.product_type || '—'}
                          </td>
                        )}
                        {(field_name !== "product_type" && field_name !== "model" && field_name !== 'unit') && (
                          <td className="text-center px-4 py-3 text-sm text-gray-900 font-medium">
                            {item.model || '—'}
                          </td>
                        )}
                        {field_name === "unit" || field_name === "product" && (
                          <td className="text-center px-4 py-3 text-sm text-gray-900">
                            {item.size || '—'}
                          </td>
                        )}
                        {field_name === "product" && (
                          <td className="text-center px-4 py-3 text-sm text-gray-900">
                            {item.unit || '—'}
                          </td>
                        )}
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? (
                        <div>
                          <p className="mb-2">
                            "{searchTerm}" uchun hech qanday natija topilmadi
                          </p>
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-blue-600 hover:text-blue-700 text-sm underline"
                          >
                            Qidiruvni tozalash
                          </button>
                        </div>
                      ) : (
                        "Ma'lumot topilmadi"
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {searchTerm && ` | ${filteredItems.length} ta filtrlangan`}
            </div>
            <div className="flex items-center gap-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                showSizeChanger
                onChange={(p, ps) => {
                  setPage(p);
                  if (ps !== pageSize) {
                    setPageSize(ps);
                    setPage(1);
                  }
                }}
              />
              <div className="flex gap-3">
                <Button
                  onClick={onCancel}
                  className="!px-4 !py-2 !border !border-gray-300 !rounded-md !text-gray-600 hover:!bg-gray-50"
                >
                  Bekor qilish
                </Button>
                <Button type="primary" onClick={onConfirm} disabled={!selectedId}>
                  Tanlash
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldModal;
