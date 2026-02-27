import { useCallback, useEffect, useState } from 'react'

export function useTabRouter({ pathToTab, tabToPath }) {
  const [tab, setTab] = useState(() => pathToTab(window.location.pathname))

  const navigateToTab = useCallback(
    (nextTab) => {
      setTab(nextTab)
      const nextPath = tabToPath(nextTab)
      if (window.location.pathname !== nextPath) {
        window.history.pushState({}, '', nextPath)
      }
    },
    [tabToPath],
  )

  useEffect(() => {
    const onPopState = () => setTab(pathToTab(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [pathToTab])

  return { tab, navigateToTab }
}
