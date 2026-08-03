export type AnalyticsEventParameters = Record<string, string | number | boolean>

declare global {
  interface Window {
    gtag?: (command: 'event', eventName: string, parameters?: AnalyticsEventParameters) => void
  }
}

export function trackEvent(eventName: string, parameters: AnalyticsEventParameters = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') {
    return
  }

  try {
    window.gtag('event', eventName, parameters)
  } catch {
    // Analytics can be blocked by the browser or an extension; tracking must stay non-blocking.
  }
}
