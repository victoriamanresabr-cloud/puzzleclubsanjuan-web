import { useEffect, useRef } from 'react'
import { trackEvent } from '../utils/analytics'

const SCROLL_MILESTONES = [50, 90] as const

export default function useScrollTracking() {
  const trackedMilestones = useRef(new Set<number>())

  useEffect(() => {
    const handleScroll = () => {
      const documentHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight)
      const scrollableHeight = documentHeight - window.innerHeight

      if (scrollableHeight <= 0) {
        return
      }

      const scrollPercent = (window.scrollY / scrollableHeight) * 100

      SCROLL_MILESTONES.forEach((milestone) => {
        if (scrollPercent >= milestone && !trackedMilestones.current.has(milestone)) {
          trackedMilestones.current.add(milestone)
          trackEvent(`scroll_${milestone}`, { scroll_percent: milestone })
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
}
