import { useLocation } from 'react-router-dom'

/**
 * Wraps a route's page so it fades + slides in on every navigation.
 * Keying on the pathname forces React to remount the div (and therefore
 * restart the CSS animation) whenever the route changes.
 */
export default function PageTransition({ children }) {
  const location = useLocation()
  return (
    <div
      key={location.pathname}
      style={{
        animation: 'pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
      }}
    >
      {children}
    </div>
  )
}
