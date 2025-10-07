/* eslint-disable react-hooks/exhaustive-deps */
import { axiosAPI } from '@/services/axiosAPI';
import { useAppSelector } from '@/store/hooks/hooks';
import { Select } from 'antd'
import React, { useCallback, useEffect } from 'react'

interface IToLocationSelectionProps {
  formData: CreateTransferPayload;
  setFormData: React.Dispatch<React.SetStateAction<CreateTransferPayload>>;
}

const FromLocationSelection: React.FC<IToLocationSelectionProps> = ({ formData, setFormData }) => {
  const [districts, setDistricts] = React.useState<IDistrict[]>([]);
  const [warehouses, setWarehouses] = React.useState<IWarehouse[]>([]);
  const [responsiblePersons, setResponsiblePersons] = React.useState<IReponsiblePerson[]>([]);
  const [region, setRegion] = React.useState<string>('');
  const [district, setDistrict] = React.useState<string>('');
  const [warehouse, setWarehouse] = React.useState<string>('');

  const { regions, currentUserInfo } = useAppSelector(state => state.info);

  // get districts when from_region changes
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

  // Get warehouses when from_district changes
  const getWarehousesList = useCallback(async () => {
    try {
      const response = await axiosAPI.get(`warehouses/list/?region=${region}&district=${district}`);
      if (response.status === 200) {
        if (response.data.length === 1) {
          setWarehouses(response.data);
          setWarehouse(response.data[0].id)
          setFormData(prev => ({ ...prev, from_warehouse: response.data[0].id }))
        }
      }
    } catch (error) {
      console.log(error)
    }
  }, [region, district, setFormData])

  // Get responsible persons when from_warehouse changes
  const getResponsiblePersonsList = useCallback(async () => {
    if (warehouse) {
      try {
        const response = await axiosAPI.get(`warehouses/responsible_person/${warehouse}/`);
        console.log(response)
        if (response.status === 200) {
          setResponsiblePersons(response.data);
          if (response.data.length === 1) {
            setFormData(prev => ({ ...prev, from_responsible_person: response.data[0].id }))
          } else {
            setResponsiblePersons(response.data);
          }
        }
      } catch (error) {
        console.log(error)
      }
    }
  }, [warehouse, warehouses, setFormData]);

  useEffect(() => {
    getDistrictsList()
  }, [formData.from_region, getDistrictsList]);

  useEffect(() => {
    getWarehousesList()
  }, [region, district, getWarehousesList]);

  useEffect(() => {
    getResponsiblePersonsList()
  }, [getResponsiblePersonsList, warehouse]);

  useEffect(() => {
    if (currentUserInfo) {
      setFormData(prev => ({
        ...prev,
        from_region: currentUserInfo.region.id,
        from_district: currentUserInfo.district.id,
        from_warehouse: currentUserInfo.warehouse.id,
      }))
      setRegion(currentUserInfo.region.name)
      setDistrict(currentUserInfo.district.name)
      setWarehouse(currentUserInfo.warehouse.name)
    }
  }, [currentUserInfo])

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <h4 className="font-medium text-gray-900">Yuboruvchi</h4>
        </div>

        {/* FROM Region */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Viloyat <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Viloyatni tanlang"
            className="w-full"
            value={region || undefined}
            disabled
          >
            {regions.map(region => (
              <Select.Option key={region.id} value={region.name}>
                {region.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* FROM District */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tuman <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Tumanni tanlang"
            className="w-full"
            value={district || undefined}
            disabled
          >
            {districts.map(district => (
              <Select.Option key={district.id} value={district.name}>
                {district.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* FROM Warehouse */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ombor <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Omborni tanlang"
            className="w-full"
            value={warehouses.find(w => w.id === warehouse)?.name || undefined}
            disabled
          >
            {warehouses.map(warehouse => (
              <Select.Option key={warehouse.id} value={warehouse.name}>
                {warehouse.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* FROM Responsible Person */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            M.J.Sh <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Moddiy javobgar shaxsni tanlang"
            className="w-full"
            value={formData.from_responsible_person || undefined}
            onChange={(value) => setFormData(prev => ({ ...prev, from_responsible_person: value }))}
            disabled={!formData.from_district}
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

export default FromLocationSelection