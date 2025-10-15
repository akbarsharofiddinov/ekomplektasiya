import React from 'react'
import MessagePreview from './FormTypes/MessagePreview'
import OrderWIndow from './FormTypes/OrderWIndow'

const DistrictOrderForm: React.FC = () => {
  return (
    <>
      <div>
        {/* Buyurtma oynasi */}
        <OrderWIndow />
        {/* Yuborilayotgan xatning ko'rinishi */}
        <MessagePreview />
      </div>
    </>
  )
}

export default DistrictOrderForm