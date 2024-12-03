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
import { queryOptions, useQuery, useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { ChangeEvent, Suspense, useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import Product from './product'
import { formatDistance, subDays, format } from 'date-fns'
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
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Paginator from './paginator'
import SimplePagination from './simple-pagination'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 6
export const BASE_URL = 'https://dummyjson.com' //https://
// https://nextjs.org/learn/dashboard-app/adding-search-and-pagination

async function getData(
  sort?: string | null,
  search?: string | null,
  page?: number
) {
  // const url = `${BASE_URL}/products?sortBy=price&order${sort}/search?q=${search}`
  let url
  if (search) {
    url = `${BASE_URL}/products/search?q=${search}`
  } else if (sort) {
    url = `${BASE_URL}/products?sortBy=price&order${sort}`
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

async function gatProduct({ id }: { id: number }) {
  const url = `${BASE_URL}/products/${id}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to fetch')
  }

  const data = await response.json()
  // console.log({ data })
  return data
}

function Products() {
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  // const searchRef = useRef()
  const search = searchParams.get('search')
  const page = Number(searchParams.get('page'))

  // console.log({ pathname })
  // console.log({ searchParams })

  // const [selectedSort, setSelectedSort] = useState('asc')
  const [sort, setSort] = useQueryState('sort')

  // const [search, setSearch] = useQueryState(
  //   'search',
  //   parseAsString.withOptions({ shallow: false }) // Previous options object goes here
  // )

  // const router = useRouter()
  function useRepos() {
    return useQuery({
      queryKey: ['repos', sort, search, page],
      //Its getData NOT getData()
      queryFn: () => getData(sort, search, page),
      staleTime: 5000, // 5 seconds
      gcTime: 3000, // 3 seconds instead of default 5 min
      placeholderData: (previousData) => previousData,

      // refetchInterval: 5000,
      // refetchInterval: () => {
      //   if (search) {
      //     return false
      //   }
      //   return 1000 // 3 seconds
      // },
      //     placeholderData: () => {
      //     const post = queryClient.getQueryData(gatProduct({ id }).queryKey)
      //       ?.find((product) => product.id === id)

      //     return post ? { ...post, description: '' } : undefined
      //   }
    })
  }

  function getProductQueryOptions(id: number) {
    return queryOptions({
      queryKey: ['product', id],
      queryFn: () => gatProduct({ id }),

      staleTime: Infinity,
      gcTime: 10000, // I added
    })
  }
  function getQueryOptions({
    sort,
    search,
    page = 1,
  }: {
    sort?: string
    search?: string
    page?: number
  }) {
    return queryOptions({
      queryKey: ['repos', { sort, search, page }],
      //Its getData NOT getData()
      queryFn: () => getData(sort, search, page),
      staleTime: 5000, // 5 seconds
      gcTime: 3000, // 3 seconds instead of default 5 min
      placeholderData: (previousData) => previousData,
    })
  }

  const {
    data,
    isError,
    isPending,
    dataUpdatedAt,
    isFetching,
    isPlaceholderData,
  } = useRepos()
  // console.log({ data })
  useEffect(() => {
    if (page < data?.products.length) {
      queryClient.prefetchQuery(getQueryOptions({ page: page + 1 }))
    }
  }, [data?.products.length, page, queryClient])
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

  // if (isPending) {
  //   return <div>Loading...</div>
  // }

  if (isError) {
    return <div>Error fetching data 😔</div>
  }

  // function handleSearch(term: ChangeEvent<HTMLInputElement>) {

  return (
    <div className={cn('bg-white', isPlaceholderData ? 'opacity-50' : '')}>
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
            <SimplePagination
              PAGE_SIZE={PAGE_SIZE}
              isPlaceholderData={isPlaceholderData}
              page={page}
              pathname={pathname}
              isFetching={isFetching}
              length={data?.products?.length}
            />
            {/* <Paginator
              currentPage={1}
              onPageChange={() => {}}
              showPreviousNext
              totalPages={5}
            /> */}
            {/* <Paginator
              currentPage={table.getState().pagination.pageIndex + 1}
              totalPages={table.getPageCount()}
              onPageChange={(pageNumber) => table.setPageIndex(pageNumber - 1)}
              showPreviousNext
            /> */}
          </article>
        </section>
        <h2>
          {data?.products.length} Products, last update at:{' '}
          {formatDistance(dataUpdatedAt, new Date(), {
            addSuffix: true,
            includeSeconds: true,
          })}
        </h2>
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
            {data?.products?.map((repo: FakerType) => (
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
                <Link
                  onMouseEnter={() => {
                    queryClient.prefetchQuery(getProductQueryOptions(repo.id))
                  }}
                  href={`react-query/product/${repo.id}`}
                  className=""
                >
                  <Product product={repo} />
                </Link>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Products
