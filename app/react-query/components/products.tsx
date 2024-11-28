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
import { useQuery } from '@tanstack/react-query'
import { formatDistance } from 'date-fns'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { ChangeEvent } from 'react'
import { useDebouncedCallback } from 'use-debounce'
import Product from './product'
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
async function getData(sort: string | null, search: string | null) {
  // const url = `${BASE_URL}/products?sortBy=price&order${sort}/search?q=${search}`
  let url
  if (search) {
    url = `${BASE_URL}/products/search?q=${search}`
  } else if (sort) {
    url = `${BASE_URL}/products?sortBy=price&order${sort}`
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
function Products() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { replace } = useRouter()
  // const searchRef = useRef()
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
  function useRepos() {
    return useQuery({
      queryKey: ['repos', sort, search],
      //Its getData NOT getData()
      queryFn: () => getData(sort, search),
      staleTime: 5000, // 5 seconds
      gcTime: 3000, // 3 seconds instead of default 5 min
      refetchInterval: 5000,
      // refetchInterval: () => {
      //   if (search) {
      //     return false
      //   }
      //   return 1000 // 3 seconds
      // },
    })
  }
  const { data, isError, isPending, dataUpdatedAt } = useRepos()
  // console.log({ data })

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
        <h2>
          {data.products.length} Products, last update at:{' '}
          {formatDistance(dataUpdatedAt, new Date(), {
            addSuffix: true,
            includeSeconds: true,
          })}
        </h2>
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 lg:grid-cols-3 lg:gap-x-8">
          {data.products.map((repo: FakerType) => (
            <Product key={repo.id} product={repo} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Products
