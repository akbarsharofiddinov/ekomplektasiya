import { axiosAPI } from '@/services/axiosAPI';
import { useAppSelector } from '@/store/hooks/hooks';
import { Select } from 'antd'
import React, { useCallback, useEffect } from 'react'

interface IToLocationSelectionProps {
  formData: CreateTransferPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateTransferPayload>>;
}

const ToLocationSelection: React.FC<IToLocationSelectionProps> = ({ formData, setFormData }) => {
  const [districts, setDistricts] = React.useState<IDistrict[]>([]);
  const [warehouses, setWarehouses] = React.useState<IWarehouse[]>([]);
  const [responsiblePersons, setResponsiblePersons] = React.useState<IReponsiblePerson[]>([]);
  const [region, setRegion] = React.useState<string>('');
  const [district, setDistrict] = React.useState<string>('');
  const [warehouse, setWarehouse] = React.useState<string>('');

  const { regions } = useAppSelector(state => state.info);

  // get districts when to_region changes
  const getDistrictsList = useCallback(async () => {
    try {
      const response = await axiosAPI.get(`districts/list/?region=${region}&order_by=2`);
      if (response.status === 200) {
        setDistricts(response.data);
      }
    } catch (error) {
      console.log(error)
    }
  }, [region]);

  // Get warehouses when to_district changes
  const getWarehousesList = useCallback(async () => {
    try {
      const response = await axiosAPI.get(`warehouses/list/?region=${region}&district=${district}`);
      if (response.status === 200) {
        setWarehouses(response.data);
        if (response.data.length === 1) {
          setFormData(prev => ({ ...prev, to_warehouse: response.data[0].id }))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [region, district, setFormData]);

  // Get responsible persons when to_warehouse changes
  const getResponsiblePersonsList = useCallback(async () => {
    if (warehouse) {
      try {
        const currentWarehouse = warehouses.find(w => w.name === warehouse);
        if (!currentWarehouse) return;
        const response = await axiosAPI.get(`/warehouses/responsible_person/${currentWarehouse.id}`);
        if (response.status === 200) {
          setResponsiblePersons(response.data);
          if (response.data.length === 1) {
            setFormData(prev => ({ ...prev, to_responsible_person: response.data[0].id }))
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }, [setFormData, warehouse, warehouses]);

  useEffect(() => {
    getDistrictsList()
  }, [formData.to_region, getDistrictsList]);

  useEffect(() => {
    getWarehousesList()
  }, [region, district, getWarehousesList]);

  useEffect(() => {
    getResponsiblePersonsList()
  }, [getResponsiblePersonsList]);

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <h4 className="font-medium text-gray-900">Qabul qiluvchi</h4>
        </div>

        {/* TO Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Viloyat <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Viloyatni tanlang"
            className="w-full"
            value={region || undefined}
            onChange={value => {
              setRegion(value)
              setDistrict('')
              setWarehouse('')
              setDistricts([])
              setWarehouses([])
              setResponsiblePersons([])
              setFormData(prev => ({
                ...prev,
                to_region: regions.find(r => r.name === value)?.id || "",
                to_district: "",
                to_warehouse: "",
                to_responsible_person: ""
              }))
            }}

          >
            {regions.map(region => (
              <Select.Option key={region.id} value={region.name}>
                {region.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* TO District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tuman <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Tumanni tanlang"
            className="w-full"
            value={district || undefined}
            onChange={value => {
              setDistrict(value)
              setWarehouses([])
              setResponsiblePersons([])
              setFormData(prev => ({
                ...prev,
                to_district: districts.find(d => d.name === value)?.id || "",
                to_warehouse: "",
                to_responsible_person: ""
              }))
            }}
            disabled={!region}
          >
            {districts.map(district => (
              <Select.Option key={district.id} value={district.name}>
                {district.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* TO Warehouse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ombor <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Omborni tanlang"
            className="w-full"
            value={warehouse || undefined}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, to_warehouse: warehouses.find(w => w.name === value)?.id || "" }))
              setWarehouse(value)
            }}
            disabled={!district}
          >
            {warehouses.map(warehouse => (
              <Select.Option key={warehouse.id} value={warehouse.name}>
                {warehouse.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* TO Responsible Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            M.J.Sh <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Moddiy javobgar shaxsni tanlang"
            className="w-full"
            value={formData.to_responsible_person || undefined}
            onChange={(value) => setFormData(prev => ({ ...prev, to_responsible_person: value }))}
            disabled={!formData.to_district}
            options={responsiblePersons.map(person => ({
              label: person.name,
              value: person.id
            }))}
          />
        </div>
      </div>
    </>
  )
}

export default ToLocationSelection