import { useCallback, useRef } from 'react'

interface Options<T> {
  threshold?: number
  onStart?: (item: T) => void
  onEnd?: () => void
}

export function useLongPress<T>(
  callback: (item: T) => void,
  { threshold = 500, onStart, onEnd }: Options<T> = {}
) {
  const timeoutRef = useRef<NodeJS.Timeout>()
  const targetRef = useRef<T>()

  const start = useCallback((item: T) => {
    targetRef.current = item
    timeoutRef.current = setTimeout(() => {
      if (targetRef.current === item) {
        callback(item)
      }
    }, threshold)
    onStart?.(item)
  }, [callback, threshold, onStart])

  const stop = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    onEnd?.()
  }, [onEnd])

  return useCallback((item: T) => ({
    onMouseDown: () => start(item),
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: () => start(item),
    onTouchEnd: stop,
  }), [start, stop])
}

