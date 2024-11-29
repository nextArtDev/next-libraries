'use client'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useQueries, useQuery } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { ChangeEvent, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import Product from './product'

import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
export interface FakerType {
  id: number
  title: string
  description: string
  category: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  tags: string[]
  brand: string
  sku: string
  weight: number
  dimensions: {
    width: number
    height: number
    depth: number
  }
  warrantyInformation: string
  shippingInformation: string
  availabilityStatus: string
  reviews: [
    {
      rating: number
      comment: string
      date: string
      reviewerName: string
      reviewerEmail: string
    }
  ]
  returnPolicy: string
  minimumOrderQuantity: number
  meta: {
    createdAt: string
    updatedAt: string
    barcode: number
    qrCode: string
  }
  thumbnail: string
  images: string[]
}

// export interface FakerType {
//   id: string
//   title: string
//   price: number
//   description: string
//   category: string
//   image: string
//   rating: {
//     rate: number
//     count: number
//   }
// }
export const BASE_URL = 'https://dummyjson.com' //https://fakestoreapi.com/
// export const BASE_URL = 'https://fakestoreapi.com' //https://fakestoreapi.com/

// export interface FakerType {
//   id: number
//   title: string
//   price: number
//   description: string
//   category: {
//     id: number
//     name: string
//     image: string
//   }
//   images: string[]
// }
// export const BASE_URL = 'https://api.escuelajs.co/api/v1'

// https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
async function getData(
  sort: string | null,
  search: string | null,
  activeCategory: string | null
) {
  // const url = `${BASE_URL}/products?sortBy=price&order${sort}/search?q=${search}`
  let url
  if (search) {
    url = `${BASE_URL}/products/search?q=${search}`
  } else if (sort) {
    url = `${BASE_URL}/products?sortBy=price&order${sort}`
  } else if (activeCategory) {
    url = `${BASE_URL}/products/${activeCategory}`
  } else {
    url = `${BASE_URL}/products`
  }
  // console.log({ url })

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to fetch')
  }

  const data = await response.json()
  // console.log({ data })
  return data
}
async function getCategories() {
  const url = `${BASE_URL}/products/categories`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to fetch')
  }

  const categories = await response.json()
  // console.log({ categories })
  return categories
}

function Products() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  // const searchRef = useRef()
  const [activeCategory, setActiveCategory] = useState(null)
  const search = searchParams.get('search')
  // console.log({ pathname })
  // console.log({ searchParams })

  // const [selectedSort, setSelectedSort] = useState('asc')
  const [sort, setSort] = useQueryState('sort')
  // const [search, setSearch] = useQueryState(
  //   'search',
  //   parseAsString.withOptions({ shallow: false }) // Previous options object goes here
  // )

  // const router = useRouter()
  // function useRepos() {
  //   return useQuery({
  //     queryKey: ['repos', sort, search],
  //     //Its getData NOT getData()
  //     queryFn: () => getData(sort, search),
  //     staleTime: 5000, // 5 seconds
  //     gcTime: 3000, // 3 seconds instead of default 5 min
  //     refetchInterval: 5000,
  //     // refetchInterval: () => {
  //     //   if (search) {
  //     //     return false
  //     //   }
  //     //   return 1000 // 3 seconds
  //     // },
  //   })
  // }
  function useRepos() {
    return useQueries({
      queries: [
        {
          queryKey: ['repos', sort, search, activeCategory],
          //Its getData NOT getData()
          queryFn: () => getData(sort, search, activeCategory),
          staleTime: 5000, // 5 seconds
          gcTime: 3000, // 3 seconds instead of default 5 min
          // refetchInterval: 5000,
          // refetchInterval: () => {
          //   if (search) {
          //     return false
          //   }
          //   return 1000 // 3 seconds
          // },
        },
        {
          queryKey: ['categories'],
          queryFn: () => getCategories(),
          // refetchInterval: 50000,
        },
      ],
      combine: (queries) => {
        const isPending = queries.some((query) => query.status === 'pending')
        const isError = queries.some((query) => query.status === 'error')
        const dataUpdatedAt = queries.map((query) => query.dataUpdatedAt)
        //order of queries matters here
        const [data, categories] = queries.map((query) => query.data)

        return {
          isPending,
          isError,
          dataUpdatedAt,
          data,
          categories,
        }
      },
    })
  }
  const { data, categories, isError, isPending, dataUpdatedAt } = useRepos()
  // console.log({ activeCategory })
  // console.log({ dataUpdatedAt })

  const handleSearch = useDebouncedCallback(
    (term: ChangeEvent<HTMLInputElement>) => {
      // console.log(term.target.value)
      term.preventDefault()

      const params = new URLSearchParams(searchParams)
      // console.log({ params })
      if (term.target.value) {
        params.set('search', term.target.value)
      } else {
        params.delete('search')
      }
      replace(`${pathname}?${params.toString()}`)
    },
    300
  )

  if (isPending) {
    return <div>Loading...</div>
  }

  if (isError) {
    return <div>Error fetching data 😔</div>
  }

  // function handleSearch(term: ChangeEvent<HTMLInputElement>) {

  return (
    <div className="bg-white">
      <div className=" flex flex-col gap-8  mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
        <h2 className="sr-only">Products</h2>
        <section className="flex flex-col w-full h-full">
          <article className="flex flex-col gap-8 md:flex-row items-center justify-evenly  ">
            <Input
              placeholder="Search..."
              // ref={searchRef}
              // value={search || ''}
              // onChange={(e) => setSearch(e.target.value)}
              onChange={handleSearch}
              defaultValue={searchParams.get('search')?.toString()}
            />
            <Select
              value={sort || 'asc'}
              onValueChange={(e) => {
                setSort(e)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select an order" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Order</SelectLabel>
                  <SelectItem value="asc">asc</SelectItem>
                  <SelectItem value="desc">desc</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </article>
          <article className="py-8 flex flex-wrap gap-4 items-center justify-center w-full ">
            {/* {getRandomElements(categories, 5).map((category: any) => ( */}
            {categories.slice(0, 5).map((category: any) => (
              <Button
                variant={
                  activeCategory === category.name ? 'default' : 'outline'
                }
                onClick={() =>
                  activeCategory !== category.name
                    ? setActiveCategory(category.name)
                    : setActiveCategory(null)
                }
                key={category.name}
              >
                {category.name}
              </Button>
            ))}
          </article>
        </section>
        <h2>
          {data.products.length} Products, last update at:{' '}
          {formatDistance(dataUpdatedAt[0], new Date(), {
            addSuffix: true,
            includeSeconds: true,
          })}
        </h2>
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {data.products.map((repo: FakerType, i: number) => (
              <motion.div
                initial={{ opacity: 0, x: i % 2 === 0 ? 100 : -100 }}
                whileInView={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
                transition={{
                  duration: 0.5,
                  delayChildren: 0.5,
                  staggerChildren: 0.5,
                }}
                key={repo.id}
              >
                <Product product={repo} />
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Products
