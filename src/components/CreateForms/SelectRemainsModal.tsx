import React, { useEffect } from 'react'

interface SelectRemainsModalProps {
  remainders: ProductRemainder[];
  setSelectedRemaindersList: React.Dispatch<React.SetStateAction<ProductRemainder[]>>;
  selectedRemaindersList: ProductRemainder[];
  onClose: () => void;
}

const SelectRemainsModal: React.FC<SelectRemainsModalProps> = ({
  remainders,
  setSelectedRemaindersList,
  selectedRemaindersList,
  onClose
}) => {

  const [searchTerm, setSearchTerm] = React.useState('');
  const [filteredRemainders, setFilteredRemainders] = React.useState<ProductRemainder[]>([]);

  // Create a unique identifier for each remainder - use a more stable key
  const getRemainderKey = (remainder: ProductRemainder) => {
    return `${remainder.product_code || 'no-code'}-${remainder.product?.name || 'no-name'}-${remainder.price || 0}-${remainder.remaining_quantity || 0}`;
  };

  // Function to highlight search term in text - fixed for startsWith
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;

    const trimmedSearchTerm = searchTerm.trim();
    const lowerText = text.toLowerCase();
    const lowerSearchTerm = trimmedSearchTerm.toLowerCase();

    // Check if text starts with search term
    if (lowerText.startsWith(lowerSearchTerm)) {
      const beforeMatch = text.substring(0, 0); // empty for startsWith
      const match = text.substring(0, trimmedSearchTerm.length);
      const afterMatch = text.substring(trimmedSearchTerm.length);

      return (
        <>
          {beforeMatch}
          <span className="bg-yellow-200 text-yellow-800 font-semibold px-1 rounded">
            {match}
          </span>
          {afterMatch}
        </>
      );
    }

    return text;
  };

  const isSelected = (remainder: ProductRemainder) => {
    const key = getRemainderKey(remainder);
    return selectedRemaindersList.some((item) => getRemainderKey(item) === key);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Add only filtered remainders that aren't already selected
      const newSelections = filteredRemainders.filter((remainder) => {
        const key = getRemainderKey(remainder);
        return !selectedRemaindersList.some((selected) => getRemainderKey(selected) === key);
      });
      setSelectedRemaindersList(prev => [...prev, ...newSelections]);
    } else {
      // Remove only filtered remainders from selection
      const filteredKeys = filteredRemainders.map((r) => getRemainderKey(r));
      setSelectedRemaindersList(prev =>
        prev.filter((item) => !filteredKeys.includes(getRemainderKey(item)))
      );
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }

  const isAllSelected = filteredRemainders.length > 0 &&
    filteredRemainders.every((remainder) => isSelected(remainder));
  const isIndeterminate = selectedRemaindersList.length > 0 &&
    !isAllSelected &&
    filteredRemainders.some((remainder) => isSelected(remainder));

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRemainders(remainders);
      return;
    }
    const filtered = remainders.filter(remainder =>
      remainder.product?.name.toLowerCase().trim().startsWith(searchTerm.toLowerCase().trim())
    );
    setFilteredRemainders(filtered);
  }, [searchTerm, remainders]);

  return (
    <>
      {/* Modal */}
      <div className='fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50'>
        {/* Inner */}
        <div className='bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] flex flex-col'>
          {/* Header */}
          <div className='px-4 py-2'>
            <div className='flex items-center justify-between'>
              <h2 className='text-xl font-semibold text-gray-800'>
                Qoldiq tovarlar ro'yxati
              </h2>
            </div>
            <p className='text-sm text-gray-600 pt-1'>
              Tanlanganlar: {selectedRemaindersList.length} / Filtrlangan: {filteredRemainders.length} / Jami: {remainders.length}
            </p>
          </div>

          {/* Search by product name */}
          <div className='px-3 py-2'>
            <div className='relative'>
              <input
                type='search'
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder="Tovar nomi bo'yicha qidirish..."
                className='border border-gray-300 rounded-lg py-2 px-4 w-full pr-10'
              />
            </div>
            {searchTerm && (
              <p className='text-sm text-gray-500 mt-2'>
                "{searchTerm}" uchun {filteredRemainders.length} ta natija topildi
              </p>
            )}
          </div>

          {/* Table Container */}
          <div className='flex-1 overflow-auto p-4'>
            <div className='overflow-x-auto'>
              <table className='min-w-full border border-gray-200 rounded-lg'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-4 py-3 text-left'>
                      <input
                        type='checkbox'
                        checked={isAllSelected}
                        ref={(input) => {
                          if (input) input.indeterminate = isIndeterminate;
                        }}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className='rounded border-gray-300 size-4'
                      />
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Shtrix kod
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Tovar nomi
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Model
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Size
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Qoldiq miqdori
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      O'lchov birligi
                    </th>
                    <th className='px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Narxi
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {filteredRemainders.length > 0 ? (
                    filteredRemainders.map((remainder, index) => (
                      <tr
                        key={`${getRemainderKey(remainder)}-${index}`}
                        className={`hover:bg-gray-50 ${isSelected(remainder) ? 'bg-blue-50' : ''}`}
                      >
                        <td className='px-4 py-3'>
                          <input
                            type='checkbox'
                            checked={isSelected(remainder)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRemaindersList((prev) => [...prev, remainder]);
                              } else {
                                const key = getRemainderKey(remainder);
                                setSelectedRemaindersList((prev) =>
                                  prev.filter((item) => getRemainderKey(item) !== key)
                                );
                              }
                            }}
                            className='rounded border-gray-300 size-4'
                          />
                        </td>
                        <td className='px-4 py-3 text-sm font-medium text-gray-900'>
                          {remainder.bar_code || '—'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          <div className='max-w-xs' title={remainder.product?.name}>
                            {remainder.product?.name ? (
                              <span>
                                {highlightSearchTerm(
                                  remainder.product.name.length > 25
                                    ? remainder.product.name.slice(0, 25) + "..."
                                    : remainder.product.name,
                                  searchTerm
                                )}
                              </span>
                            ) : (
                              '—'
                            )}
                          </div>
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {remainder.model?.name || '—'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {remainder.size?.name || '—'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900 font-medium'>
                          {remainder.remaining_quantity || 0}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {remainder.unit?.name || '—'}
                        </td>
                        <td className='px-4 py-3 text-sm text-gray-900'>
                          {remainder.price ? `${remainder.price.toLocaleString()} UZS` : '—'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className='px-4 py-8 text-center text-gray-500'>
                        {searchTerm ? (
                          <div>
                            <p className='mb-2'>"{searchTerm}" uchun hech qanday natija topilmadi</p>
                            <button
                              onClick={() => setSearchTerm('')}
                              className='text-blue-600 hover:text-blue-700 text-sm underline'
                            >
                              Qidiruvni tozalash
                            </button>
                          </div>
                        ) : (
                          'Qoldiq tovarlar topilmadi'
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer */}
          <div className='p-6 border-t bg-gray-50 flex justify-between items-center'>
            <div className='text-sm text-gray-600'>
              {selectedRemaindersList.length} tanlangan qoldiq(lar)
              {searchTerm && ` | ${filteredRemainders.length} ta filtrlangan`}
            </div>
            <div className='flex gap-3'>
              <button
                onClick={onClose}
                className='px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer'
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  onClose();
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                disabled={selectedRemaindersList.length === 0}
              >
                Tanlash ({selectedRemaindersList.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SelectRemainsModal