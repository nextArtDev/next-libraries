'use client'
import React from 'react'
import { BASE_URL } from './products'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import {
  CheckIcon,
  FileQuestion,
  Loader,
  ShieldCheckIcon,
  StarIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  BackgroundUpdateInProgress,
  StaleMessage,
  UpToDate,
} from './stale-messages'

type Props = { id: string }

async function getData(id: string) {
  const url = `${BASE_URL}/products/${id}`

  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Unable to fetch')
  }

  const data = await response.json()

  return data
}

function ProductDetails({ id }: Props) {
  function useRepos() {
    return useQuery({
      queryKey: ['product', { id }],
      //Its getData NOT getData()
      queryFn: () => getData(id),
      staleTime: 5000,
    })
  }
  const { data, isError, isPending, isFetching, isStale, refetch } = useRepos()

  if (isPending) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <span>
          <Loader className="animate-spin" size={72} />
        </span>
      </div>
    )
  }

  if (isError) {
    return <div>Error fetching data 😔</div>
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-8 lg:px-8">
      {/* Product details */}
      <div className="lg:max-w-lg lg:self-end">
        {/* <nav aria-label="Breadcrumb">
            <ol role="list" className="flex items-center space-x-2">
              {data.breadcrumbs.map((breadcrumb, breadcrumbIdx) => (
                <li key={breadcrumb.id}>
                  <div className="flex items-center text-sm">
                    <a
                      href={breadcrumb.href}
                      className="font-medium text-gray-500 hover:text-gray-900"
                    >
                      {breadcrumb.name}
                    </a>
                    {breadcrumbIdx !== data.breadcrumbs.length - 1 ? (
                      <svg
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                        className="ml-2 h-5 w-5 flex-shrink-0 text-gray-300"
                      >
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </nav> */}

        <div className="mt-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {data.title}
          </h1>
        </div>

        <section aria-labelledby="information-heading" className="mt-4">
          <h2 id="information-heading" className="sr-only">
            Product information
          </h2>

          <div className="flex items-center">
            <p className="text-lg text-gray-900 sm:text-xl">{data.price}</p>

            <div className="ml-4 border-l border-gray-300 pl-4">
              <h2 className="sr-only">Reviews</h2>
              <div className="flex items-center">
                <div>
                  <div className="flex items-center">
                    {[0, 1, 2, 3, 4].map((rating = 5) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={cn(
                          //   reviews.average > rating
                          //     ? 'text-yellow-400'
                          //     : 'text-gray-300',
                          'h-5 w-5 flex-shrink-0 text-yellow-400'
                        )}
                      />
                    ))}
                  </div>
                  {/* <p className="sr-only">{data.average} out of 5 stars</p> */}
                </div>
                {/* <p className="ml-2 text-sm text-gray-500">
                  {reviews.totalCount} reviews
                </p> */}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-6">
            <p className="text-base text-gray-500">{data.description}</p>
          </div>

          <div className="mt-6 flex items-center">
            <CheckIcon
              aria-hidden="true"
              className="h-5 w-5 flex-shrink-0 text-green-500"
            />
            <p className="ml-2 text-sm text-gray-500">
              In stock and ready to ship
            </p>
          </div>
        </section>
      </div>

      {/* Product image */}
      <div className="mt-10 lg:col-start-2 lg:row-span-2 lg:mt-0 lg:self-center">
        <div className="relative aspect-square  aspect-h-1 aspect-w-1 overflow-hidden rounded-lg">
          <Image
            fill
            alt={data.title}
            src={data.image}
            className="h-full w-full object-contain object-center"
          />
        </div>
      </div>

      {/* Product form */}
      <div className="mt-10 lg:col-start-1 lg:row-start-2 lg:max-w-lg lg:self-start">
        <section aria-labelledby="options-heading">
          <h2 id="options-heading" className="sr-only">
            Product options
          </h2>

          <form>
            {/* <div className="sm:flex sm:justify-between">
   
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700">
                  Size
                </legend>
                <RadioGroup
                  value={selectedSize}
                  onChange={setSelectedSize}
                  className="mt-1 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  {product.sizes.map((size) => (
                    <Radio
                      key={size.name}
                      as="div"
                      value={size}
                      aria-label={size.name}
                      aria-description={size.description}
                      className="group relative block cursor-pointer rounded-lg border border-gray-300 p-4 focus:outline-none data-[focus]:ring-2 data-[focus]:ring-indigo-500"
                    >
                      <p className="text-base font-medium text-gray-900">
                        {size.name}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {size.description}
                      </p>
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-500"
                      />
                    </Radio>
                  ))}
                </RadioGroup>
              </fieldset>
            </div> */}
            <div className="mt-4">
              <a
                href="#"
                className="group inline-flex text-sm text-gray-500 hover:text-gray-700"
              >
                <span>What size should I buy?</span>
                <FileQuestion
                  aria-hidden="true"
                  className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                />
              </a>
            </div>
            <div className="mt-10 flex flex-col gap-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50"
              >
                Add to bag
              </button>
              {isFetching && <BackgroundUpdateInProgress />}
              {isStale && <StaleMessage refetch={refetch} />}
              {!isFetching && !isStale && <UpToDate />}
            </div>
            <div className="mt-6 text-center">
              <a href="#" className="group inline-flex text-base font-medium">
                <ShieldCheckIcon
                  aria-hidden="true"
                  className="mr-2 h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                />
                <span className="text-gray-500 hover:text-gray-700">
                  Lifetime Guarantee
                </span>
              </a>
            </div>
          </form>
        </section>
      </div>
    </div>
  )
}

export default ProductDetails
