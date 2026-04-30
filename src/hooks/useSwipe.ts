import { useRef, useCallback } from 'react'

interface SwipeHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
}

export function useSwipe(onLeft: () => void, onRight: () => void, minDistance = 50): SwipeHandlers {
  const startX = useRef<number | null>(null)
  const startY = useRef<number | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (startX.current === null || startY.current === null) return
    const dx = e.changedTouches[0].clientX - startX.current
    const dy = e.changedTouches[0].clientY - startY.current
    // Ignorer si le mouvement est plus vertical qu'horizontal (scroll)
    if (Math.abs(dy) > Math.abs(dx)) return
    if (Math.abs(dx) < minDistance) return
    if (dx < 0) onLeft()
    else onRight()
    startX.current = null
    startY.current = null
  }, [onLeft, onRight, minDistance])

  return { onTouchStart, onTouchEnd }
}
