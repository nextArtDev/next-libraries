import React from 'react'
import Products from './components/products'

// export interface SearchParams {
//   [key: string]: string | string[] | undefined
// }
// async function page({ searchParams }: { searchParams: Promise<SearchParams> }) {
async function page() {
  // const { sort } = await searchParams
  // const sort:'asc'|'desc' = params.sort
  // console.log(params.sort)
  return (
    <div>
      <Products />
    </div>
  )
}

export default page
