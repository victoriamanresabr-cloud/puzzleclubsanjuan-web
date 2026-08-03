import { useEffect, useState } from 'react'
import { trackEvent } from '../utils/analytics'

interface FloatingReserveButtonProps {
  destinationUrl: string
}

export default function FloatingReserveButton({ destinationUrl }: FloatingReserveButtonProps) {
  const [isPrimaryCtaVisible, setIsPrimaryCtaVisible] = useState(false)

  useEffect(() => {
    const primaryCtas = Array.from(document.querySelectorAll('[data-floating-cta]'))

    if (primaryCtas.length === 0) {
      return
    }

    const visibleCtas = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleCtas.add(entry.target)
          } else {
            visibleCtas.delete(entry.target)
          }
        })
        setIsPrimaryCtaVisible(visibleCtas.size > 0)
      },
      { threshold: 0.15 },
    )

    primaryCtas.forEach((cta) => observer.observe(cta))
    return () => observer.disconnect()
  }, [])

  return (
    <a
      className={`floating-reserve-button${isPrimaryCtaVisible ? ' floating-reserve-button--hidden' : ''}`}
      href={destinationUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Reservá tu lugar"
      onClick={() => trackEvent('click_reserva', {
        button_text: 'Reservá tu lugar',
        button_location: 'floating_mobile',
        destination_url: destinationUrl,
      })}
    >
      Reservá tu lugar
    </a>
  )
}
