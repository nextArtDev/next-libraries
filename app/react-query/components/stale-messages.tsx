import { Button } from '@/components/ui/button'
import React from 'react'

type Props = {
  refetch: unknown
}

export function StaleMessage({ refetch }: Props) {
  return (
    <span>
      The Checkout status may have changed...
      <Button
        variant={'link'}
        className="underline text-blue-400 "
        onClick={() => refetch}
      >
        Get the latest data
      </Button>
    </span>
  )
}
export function UpToDate() {
  return <span>Everything up to date - go ahead and checkout that book!</span>
}
export function BackgroundUpdateInProgress() {
  return <span>Getting the data...</span>
}
