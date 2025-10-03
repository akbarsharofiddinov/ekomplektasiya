import { axiosAPI } from '@/services/axiosAPI'
import { Input, Select } from 'antd'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import { useAppDispatch, useAppSelector } from '@/store/hooks/hooks';
import { setCounterParties, setCurrentCreatedCounterParty } from '@/store/infoSlice/infoSlice';

interface CounterPartyFormProps {
  setFormData: React.Dispatch<React.SetStateAction<OrderPayload>>;
  setCreateCounterPartyModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedCounterParty: React.Dispatch<React.SetStateAction<string>>;
}

const CounterPartyForm: React.FC<CounterPartyFormProps> = ({ setFormData, setCreateCounterPartyModal, setSelectedCounterParty }) => {
  const dispatch = useAppDispatch();
  const { counterparties } = useAppSelector((state) => state.info);

  const [counterPartyData, setCounterPartyData] = useState<CounterParty>({
    name: '',
    inn: '',
    leader_name: '',
    accountant_name: '',
    type: ''
  })
  const [counterPartyTypes, setCounterPartyTypes] = useState<{ id: string, name: string }[]>([]);

  // API requests
  const getCounterPartyTypes = async () => {
    try {
      const response = await axiosAPI.get("counterparty_type/list/");
      if (response.status === 200) {
        setCounterPartyTypes(response.data)
      }
    } catch (error) {
      console.error('Error fetching counter party types:', error);
    }
  }

  // Create counter party
  const createCounterParty = async () => {
    try {
      const response = await axiosAPI.post("counterparties/create/", counterPartyData);
      if (response.status === 200) {
        toast("Kontragent muvaffaqiyatli yaratildi", { type: "success", autoClose: 2000 });

        // Add the new counterparty to the Redux store
        const newCounterParty = response.data;
        dispatch(setCounterParties([...counterparties, newCounterParty]));
        dispatch(setCurrentCreatedCounterParty(newCounterParty));

        // Update form data with the new counterparty ID
        setFormData(prev => ({ ...prev, counterparty: newCounterParty.id }));

        // Set the selected counterparty name for the Select component
        setSelectedCounterParty(newCounterParty.name || counterPartyData.name);

        setCreateCounterPartyModal(false);
      }
    } catch (error) {
      console.error('Error creating counter party:', error);
    }
  }

  useEffect(() => {
    getCounterPartyTypes();
  }, [])

  return (
    <>
      <form onSubmit={e => e.preventDefault()} className='flex flex-col gap-4'>
        {/* Counter party name */}
        <div className='flex flex-col'>
          <label htmlFor="counterparty-name" className='mb-1'>Kontragent</label>
          <Input value={counterPartyData.name} onChange={e => setCounterPartyData({ ...counterPartyData, name: e.target.value })} placeholder='Kontragent nomi' />
        </div>

        {/* Inn */}
        <div className='flex flex-col'>
          <label htmlFor="inn" className='mb-1'>INN</label>
          <Input value={counterPartyData.inn} onChange={e => setCounterPartyData({ ...counterPartyData, inn: e.target.value })} placeholder='INN' />
        </div>

        {/* Type */}
        <div className='flex flex-col'>
          <label htmlFor="type" className='mb-1'>Turi</label>
          <Select placeholder="Kontragent turini tanlang" onChange={(value) => setCounterPartyData({ ...counterPartyData, type: value })}>
            {counterPartyTypes.map(type => (
              <Select.Option key={type.id} value={type.id}>{type.name}</Select.Option>
            ))}
          </Select>
        </div>

        {/* Leader name */}
        <div className='flex flex-col'>
          <label htmlFor="leader-name" className='mb-1'>Rahbar</label>
          <Input value={counterPartyData.leader_name} onChange={e => setCounterPartyData({ ...counterPartyData, leader_name: e.target.value })} placeholder='Rahbar' />
        </div>

        {/* Actions */}
        <div className='flex items-center gap-4 self-end'>
          <button type='submit' className='bg-blue-500 text-white px-4 py-2 rounded' onClick={createCounterParty}>
            Saqlash
          </button>
          <button type='button' className='bg-gray-300 text-gray-700 px-4 py-2 rounded' onClick={() => setCreateCounterPartyModal(false)}>
            Bekor qilish
          </button>
        </div>
      </form>
    </>
  )
}

export default CounterPartyForm