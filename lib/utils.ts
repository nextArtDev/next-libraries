import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRandomElements<T>(array: T[], count: number): T[] {
  const copiedArray = [...array] // Create a shallow copy of the array
  const shuffledArray = copiedArray.sort(() => 0.5 - Math.random())
  return shuffledArray.slice(0, count)
}
