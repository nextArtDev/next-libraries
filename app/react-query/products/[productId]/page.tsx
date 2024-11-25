import React from 'react'
import ProductDetails from '../../components/product-details'

async function page({ params }: { params: string }) {
  const { productId } = await params

  return (
    <div>
      <ProductDetails id={productId} />
    </div>
  )
}

export default page
