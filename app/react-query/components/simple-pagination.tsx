import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Loader, Loader2 } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

type Props = {
  page: number
  isPlaceholderData: boolean
  PAGE_SIZE: number
  length?: number
  isFetching?: boolean
  pathname: string
}

function SimplePagination({
  page = 1,
  isPlaceholderData,
  PAGE_SIZE,
  isFetching,
  pathname,
  length,
}: Props) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        isPlaceholderData && 'opacity-40'
      )}
    >
      {page > 0 && (
        <Link
          // onClick={() => setPage((old) => Math.max(old - 1, 0))}
          href={`${pathname}/?page=${page - 1}`}
          // disabled={isPlaceholderData || page === 1}
          className="border px-2 py-1 bg-background  rounded-md"
        >
          Prev
        </Link>
      )}
      <Button>{isFetching ? <Loader className="animate-spin" /> : page}</Button>
      {/* {!isPlaceholderData ||
        (!(length && length < PAGE_SIZE) && ( */}
      {!!length && length > PAGE_SIZE - 1 && (
        <Link
          // onClick={() => {
          //   setPage((old) => (data?.hasMore ? old + 1 : old))
          // }}
          href={`${pathname}/?page=${page + 1}`}
          className="border px-2 py-1 bg-background rounded-md"
          // disabled={isPlaceholderData || (length && length < PAGE_SIZE)}
        >
          Next
        </Link>
      )}
      {/* ))} */}
      {
        // Since the last page's data potentially sticks around between page requests,
        // we can use `isFetching` to show a background loading
        // indicator since our `status === 'pending'` state won't be triggered
        // isFetching ? <span> Loading...</span> : null
      }{' '}
    </div>
  )
}

export default SimplePagination
