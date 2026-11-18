// Tiny router for three pages, using real paths: /, /calculation and /impact.

export const ROUTES = { '/': 'home', '/calculation': 'calc', '/impact': 'impact' }

// Old links used "#/impact". Turn them into "/impact" so bookmarks keep working.
function fixOldHashLink() {
  if (location.hash.startsWith('#/')) history.replaceState(null, '', location.hash.slice(1))
}

export function routeOf() {
  fixOldHashLink()
  const path = location.pathname.replace(/\/+$/, '') || '/'
  return ROUTES[path] || 'home'
}

// A link that changes the page without reloading. Ctrl/Cmd/middle click still opens a new tab.
export function Link({ href, children, ...rest }) {
  const onClick = (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    if (location.pathname !== href) history.pushState(null, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
  }
  return <a href={href} onClick={onClick} {...rest}>{children}</a>
}
