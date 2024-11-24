import React from 'react'
import { FakerType } from './products'
import Image from 'next/image'
import Link from 'next/link'

type Props = {
  product: FakerType
}

function Product({ product }: Props) {
  return (
    <div
      key={product.id}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white"
    >
      <div className="relative aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-96">
        <Image
          fill
          alt={product.title}
          src={product.image}
          className="h-full w-full object-cover object-center sm:h-full sm:w-full"
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900">
          <Link href={`/products/${product.id}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.price}
          </Link>
        </h3>
        <p className="line-clamp-3 text-sm text-gray-500">
          {product.description}
        </p>
        <div className="flex flex-1 flex-col justify-end">
          <p className="text-sm italic text-gray-500">{product.category}</p>
          <p className="text-base font-medium text-gray-900">{product.price}</p>
        </div>
      </div>
    </div>
  )
}

export default Product
