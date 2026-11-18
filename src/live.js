import { useEffect, useState } from 'react'

// Open-Meteo: free weather API, no key needed. Jaipur coordinates.
const URL =
  'https://api.open-meteo.com/v1/forecast?latitude=26.9124&longitude=75.7873' +
  '&current=temperature_2m&hourly=temperature_2m&forecast_days=2&timezone=Asia%2FKolkata'

// Turn the API answer into: temperature now, and the temperature at the next 7 PM.
export function parseWeather(json) {
  const nowTime = json.current.time
  const now = Math.round(json.current.temperature_2m)
  const { time, temperature_2m: temps } = json.hourly
  const i = time.findIndex((t) => t.endsWith('T19:00') && t > nowTime)
  const evening = i === -1 ? null : {
    temp: Math.round(temps[i]),
    day: time[i].slice(0, 10) === nowTime.slice(0, 10) ? 'today' : 'tomorrow',
  }
  return { now, evening, updated: nowTime.slice(11, 16) }
}

export function useLiveWeather() {
  const [state, setState] = useState({ status: 'loading' })
  useEffect(() => {
    const ctl = new AbortController()
    fetch(URL, { signal: ctl.signal })
      .then((r) => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then((j) => setState({ status: 'ok', ...parseWeather(j) }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ status: 'error' }) })
    return () => ctl.abort()
  }, [])
  return state
}
