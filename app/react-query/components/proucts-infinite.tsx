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
import { useQueries } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { ChangeEvent, useEffect, useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import Product from './product'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useIntersectionObserver } from '@uidotdev/usehooks'

import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
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
const PAGE_SIZE = 6
export const BASE_URL = 'https://dummyjson.com' //https://fakestoreapi.com/

// https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
async function getData(
  sort: string | null,
  search: string | null,
  page?: number
) {
  // const url = `${BASE_URL}/products?sortBy=price&order${sort}/search?q=${search}`
  let url
  if (search) {
    url = `${BASE_URL}/products/search?q=${search}`
  } else if (sort) {
    url = `${BASE_URL}/products??limit=${PAGE_SIZE}&skip=${
      page * PAGE_SIZE
    }sortBy=price&order${sort}`
  } else {
    url = `${BASE_URL}/products?limit=${PAGE_SIZE}&skip=${page * PAGE_SIZE}`
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

function Products() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()

  const search = searchParams.get('search')
  const page = searchParams.get('page')
  // console.log({ pathname })
  // console.log({ searchParams })

  // const [selectedSort, setSelectedSort] = useState('asc')
  const [sort, setSort] = useQueryState('sort')

  // const router = useRouter()
  function useRepos() {
    return useInfiniteQuery({
      queryKey: ['repos', sort, search],
      //Its getData NOT getData()
      queryFn: () => getData(sort, search, Number(page)),
      staleTime: 5000,
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages, lastPageParam) => {
        if (lastPage.length === 0) {
          return undefined
        }

        return lastPageParam + 1
      },
    })
  }

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isError,
    isPending,
    dataUpdatedAt,
  } = useRepos()
  //   console.log(data?.pages.flatMap((repo) => console.log(repo.products)))
  //   console.log({ fetchNextPage })
  //   console.log({ hasNextPage })

  // console.log({ dataUpdatedAt })
  const [ref, entry] = useIntersectionObserver()

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      const params = new URLSearchParams(searchParams)

      params.set('page', +page + 1)

      replace(`${pathname}?${params.toString()}`)
      fetchNextPage()
    }
  }, [entry?.isIntersecting, hasNextPage, isFetchingNextPage])

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
          </article>
        </section>
        <h2>
          {data?.pages.flat()?.[0].products.length} Products, last update at:{' '}
          {formatDistance(dataUpdatedAt, new Date(), {
            addSuffix: true,
            includeSeconds: true,
          })}
        </h2>
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {data?.pages.flat().map((repoo) => {
              return repoo.products.map(
                (repo: FakerType, index: number, pag) => {
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{
                        duration: 0.5,
                        delayChildren: 0.5,
                        staggerChildren: 0.5,
                      }}
                      key={repo.id}
                    >
                      <Product product={repo} />
                      {index === pag.length - PAGE_SIZE ? (
                        <div ref={ref} />
                      ) : null}
                    </motion.div>
                  )
                }
              )
            })}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Products
