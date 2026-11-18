import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

export default function ThemeToggle() {
  const btn = useRef(null)
  const [dark, setDark] = useState(() => {
    const t = document.documentElement.getAttribute('data-theme')
    return t ? t === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  const flip = () => {
    const next = dark ? 'light' : 'dark'
    const apply = () => {
      document.documentElement.setAttribute('data-theme', next)
      setDark(next === 'dark')
    }
    try { localStorage.setItem('theme', next) } catch { /* storage can be blocked */ }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reduce) { apply(); return }

    // Ripple: the new theme grows as a circle from the button until it covers the page.
    const r = btn.current.getBoundingClientRect()
    const x = r.left + r.width / 2, y = r.top + r.height / 2
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    const t = document.startViewTransition(() => flushSync(apply))
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: 'cubic-bezier(.4,0,.2,1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  return (
    <button ref={btn} type="button" className="icon-btn" onClick={flip} aria-label={`Switch to ${dark ? 'light' : 'dark'} theme`} title={dark ? 'Light theme' : 'Dark theme'}>
      <svg key={dark ? 'sun' : 'moon'} className="theme-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </>
        ) : (
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        )}
      </svg>
    </button>
  )
}
