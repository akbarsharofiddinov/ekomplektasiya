/* eslint-disable react-hooks/exhaustive-deps */
import { axiosAPI } from '@/services/axiosAPI';
import { useAppSelector } from '@/store/hooks/hooks';
import { Select } from 'antd';
import React, { useEffect, useState } from 'react'

interface ToWhoProps {
  formData: CreateTransferPayload,
  setFormData: React.Dispatch<React.SetStateAction<CreateTransferPayload>>;
}

const ToWho: React.FC<ToWhoProps> = ({ formData, setFormData }) => {
  const [districts, setDistricts] = useState<IDistrict[]>([]);
  const [warehouses, setWarehouses] = useState<IWarehouse[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [responsiblePersons, setResponsiblePerson] = useState<IReponsiblePerson[]>([]);
  const [selectedResponsiblePerson, setSelectedResponsiblePerson] = useState<string>('');

  // Redux
  const { regions } = useAppSelector(state => state.info);


  // API Requests
  // Get Districts based on selected region
  const getDistricts = async (regionName: string) => {
    try {
      const response = await axiosAPI.get(`districts/list/?region=${regionName}`);
      setDistricts(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Warehouses based on selected district
  const getWarehouses = async (districtId: string) => {
    try {
      const response = await axiosAPI.get(`warehouses/list/?region=${selectedRegion}&district=${districtId}`);
      setWarehouses(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // Get Responsible Persons based on selected wearehouse
  const getResponsiblePersons = async (warehouseId: string) => {
    try {
      const response = await axiosAPI.get(`warehouses/responsible_person/${warehouseId}`);
      if (response.status === 200) {
        const list: IReponsiblePerson[] = response.data;
        setResponsiblePerson(list);

        if (list.length === 1) {
          setSelectedResponsiblePerson(list[0].name);
          setFormData((prev) => ({
            ...prev,
            responsible_person: list[0].id,
          }));
        } else {
          setSelectedResponsiblePerson("");
          setFormData((prev) => ({ ...prev, responsible_person: "" }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Effects
  useEffect(() => {
    if (selectedRegion) {
      getDistricts(selectedRegion);
    }
  }, [selectedRegion])

  useEffect(() => {
    if (selectedDistrict) {
      getWarehouses(selectedDistrict);
    }
  }, [selectedDistrict])

  useEffect(() => {
    if (formData.to_warehouse) {
      getResponsiblePersons(formData.to_warehouse);
    }
  }, [formData.to_warehouse])

  return (
    <>
      {/* To */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold">Qayerga</h3>
        {/* Form fields */}
        <div className="grid grid-cols-4 gap-x-4 gap-y-6 border-2 border-slate-100 px-4 py-2 rounded-xl">

          {/* To Region */}
          <div className="flex flex-col">
            <label className="mb-1">Viloyat</label>
            <Select
              className="w-full"
              placeholder="Viloyatni tanlang"
              onChange={(value) => {
                setSelectedRegion(regions.find(r => r.id === value)?.name || '');
                setFormData((prev) => ({
                  ...prev,
                  to_region: value,
                }));
              }}
            >
              {regions.map((region) => (
                <Select.Option key={region.id} value={region.id}>
                  {region.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* To District */}
          <div className="flex flex-col">
            <label className="mb-1">Tuman</label>
            <Select
              className="w-full"
              placeholder="Tumanni tanlang"
              onChange={(value) => {
                setSelectedDistrict(districts.find(d => d.id === value)?.name || '');
                setFormData((prev) => ({
                  ...prev,
                  to_district: value,
                }));
              }}
            >
              {districts.map((district) => (
                <Select.Option key={district.id} value={district.id}>
                  {district.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* To Warehouse */}
          <div className="flex flex-col">
            <label className="mb-1">Ombor</label>
            <Select
              className="w-full"
              placeholder="Omborni tanlang"
              onChange={(value) => {
                setFormData((prev) => ({
                  ...prev,
                  to_warehouse: value,
                }));
              }}
            >
              {warehouses.map((warehouse) => (
                <Select.Option key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          {/* To responsible person */}
          <div className="flex flex-col">
            <label className="mb-1">M.J.Sh</label>
            <Select
              className="w-full"
              placeholder="Moddity javobgar shaxsni tanlang"
              value={selectedResponsiblePerson || undefined}
              onChange={(value) => {
                setSelectedResponsiblePerson(value);
                setFormData((prev) => ({
                  ...prev,
                  to_responsible_person:
                    responsiblePersons.find((p) => p.name === value)?.id || "",
                }));
              }}
            >
              {responsiblePersons.map((person) => (
                <Select.Option key={person.id} value={person.id}>
                  {person.name}
                </Select.Option>
              ))}

            </Select>
          </div>
        </div>
      </div>
    </>
  )
}

export default ToWho