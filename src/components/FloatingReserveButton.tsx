import { useEffect, useState } from 'react'
import { trackEvent } from '../utils/analytics'

interface FloatingReserveButtonProps {
  destinationUrl: string
}

export default function FloatingReserveButton({ destinationUrl }: FloatingReserveButtonProps) {
  const [isConversionContentVisible, setIsConversionContentVisible] = useState(false)

  useEffect(() => {
    const sectionsToAvoid = [
      document.getElementById('fecha'),
      document.querySelector('.faq-section'),
      document.querySelector('.site-footer'),
    ].filter((section): section is Element => section !== null)

    if (sectionsToAvoid.length === 0) {
      return
    }

    const visibleSections = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.add(entry.target)
          } else {
            visibleSections.delete(entry.target)
          }
        })
        setIsConversionContentVisible(visibleSections.size > 0)
      },
      { threshold: 0.15 },
    )

    sectionsToAvoid.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <a
      className={`floating-reserve-button${isConversionContentVisible ? ' floating-reserve-button--hidden' : ''}`}
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
