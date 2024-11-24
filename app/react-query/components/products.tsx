'use client'
import { useQuery } from '@tanstack/react-query'
import React from 'react'
import Product from './product'

export interface FakerType {
  id: string
  title: string
  price: number
  description: string
  category: string
  image: string
  rating: {
    rate: number
    count: number
  }
}
const BASE_URL = 'https://fakestoreapi.com' //https://fakestoreapi.com/

async function getData() {
  const url = `${BASE_URL}/products`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to fetch')
  }

  const data = await response.json()
  return data
}

function useRepos() {
  return useQuery({
    queryKey: ['repos'],
    //Its getData NOT getData()
    queryFn: getData,
  })
}
function Products() {
  const { data, isError, isPending } = useRepos()
  //   console.log({ data })

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching data 😔</div>
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>

        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {data.map((repo: FakerType) => (
            <Product key={repo.id} product={repo} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Products
