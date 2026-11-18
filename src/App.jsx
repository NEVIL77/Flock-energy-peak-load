import { useEffect, useState } from 'react'
import { peakLoadMW, savedMW, SAVING_PER_DEGREE } from './model.js'
import { useLiveWeather } from './live.js'
import ThemeToggle from './ThemeToggle.jsx'
import PilotInfo from './PilotInfo.jsx'
import Calculation from './Calculation.jsx'
import Impact from './Impact.jsx'
import Icon from './Icon.jsx'
import { Link, routeOf } from './router.jsx'
import { impactNumbers, fmtMW, fmtMWh, fmtCrore } from './impact.js'

const SUMMER_TEMP = 42
const SCENARIOS = [
  { name: 'Mild day', temp: 32 },
  { name: 'Hot day', temp: 42 },
  { name: 'Heatwave', temp: 46 },
]
const REFERENCE_DAYS = [30, 34, 38, 42, 46]

const mw = (x) => (x < 1 ? `${Math.round(x * 1000)} kW` : `${x.toFixed(x < 10 ? 1 : 0)} MW`)
const num = (x) => Number(x).toLocaleString('en-IN')

function Slider({ id, label, icon, value, min, max, step, shown, onChange }) {
  return (
    <div className="slider">
      <div className="row"><label htmlFor={id}><Icon name={icon} />{label}</label><output htmlFor={id}>{shown}</output></div>
      <input type="range" id={id} min={min} max={max} step={step} value={value} onChange={(e) => onChange(+e.target.value)} />
    </div>
  )
}

function TempMode({ liveOn, temp, weather, onSummer, onLive }) {
  let note = null
  if (liveOn && weather.status === 'loading') note = 'Getting live temperature…'
  else if (liveOn && weather.status === 'error') note = 'Live temperature is not available. Use the slider.'
  else if (liveOn) {
    const t = weather.evening?.temp ?? weather.now
    note = `Jaipur ${weather.evening ? `${weather.evening.day} 7 PM` : 'now'}: ${t}°C${t < 28 ? '. Too cool for ACs, pick Summer.' : ''}`
  }
  return (
    <div className="mode">
      <div className="seg" role="group" aria-label="Temperature source">
        <button type="button" aria-pressed={!liveOn && temp === SUMMER_TEMP} onClick={onSummer}><Icon name="sun" size={15} />Summer ({SUMMER_TEMP}°C)</button>
        <button type="button" aria-pressed={liveOn} onClick={onLive}><Icon name="pin" size={15} />Live Jaipur</button>
      </div>
      {note && <p className="live">{note}</p>}
    </div>
  )
}

export default function App() {
  const [temp, setTemp] = useState(SUMMER_TEMP)
  const [liveOn, setLiveOn] = useState(false)
  const [n, setN] = useState(100000)
  const [bump, setBump] = useState(1)
  const [route, setRoute] = useState(routeOf)
  const weather = useLiveWeather()

  // Live mode follows the real forecast; touching the slider or a scenario leaves live mode.
  useEffect(() => {
    if (liveOn && weather.status === 'ok') setTemp(weather.evening?.temp ?? weather.now)
  }, [liveOn, weather])
  useEffect(() => {
    const onNav = () => setRoute(routeOf())
    window.addEventListener('popstate', onNav)
    return () => window.removeEventListener('popstate', onNav)
  }, [])
  useEffect(() => { window.scrollTo(0, 0) }, [route])
  const setManual = (t) => { setLiveOn(false); setTemp(t) }

  const normal = peakLoadMW(temp, n)
  const saved = savedMW(temp, n, bump)
  const after = normal - saved
  const imp = impactNumbers(temp, n, bump)
  const top = peakLoadMW(47, n) // fixed scale, so bars visibly grow when it gets hotter
  const days = [...new Set([...REFERENCE_DAYS, temp])].sort((a, b) => a - b)
  const active = SCENARIOS.findIndex((s) => s.temp === temp)

  return (
    <>
      <header className="top">
        <div className="top-in">
          <div className="brand">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="7" className="logo-bg" /><path d="M18 5 9 18h6l-1 9 9-13h-6z" style={{ fill: 'var(--on-brand)' }} /></svg>
            <span>Flock Energy <span className="brand-sub">Peak Load Calculation</span></span>
          </div>
          <nav className="nav" aria-label="Pages">
            <Link href="/" aria-current={route === 'home' ? 'page' : undefined}>
              <Icon name="zap" size={15} />Calculator</Link>
            <Link href="/calculation" aria-current={route === 'calc' ? 'page' : undefined}>
              <Icon name="calculator" size={15} />How it is calculated</Link>
            <Link href="/impact" aria-current={route === 'impact' ? 'page' : undefined}>
              <Icon name="trendDown" size={15} />Impact</Link>
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="wrap">
        {route === 'calc' ? <Calculation /> : route === 'impact' ? <Impact /> : (
          <>
            <section className="intro">
              <h1>How much does +1°C on the AC help the grid?</h1>
              <p>A hotter evening means more load. Raise the AC setting by 1°C and the peak load comes down.</p>
            </section>

            <div className="chips" role="group" aria-label="Quick scenarios">
              {SCENARIOS.map((s, i) => (
                <button key={s.name} type="button" className="chip" aria-pressed={!liveOn && active === i} onClick={() => setManual(s.temp)}>{s.name}</button>
              ))}
            </div>

            <div className="layout">
              <section className="card controls" aria-label="Inputs">
                <Slider id="temp" icon="thermometer" label="Temperature outside" value={temp} min={15} max={47} step={1} shown={`${temp}°C`} onChange={setManual} />
                <TempMode liveOn={liveOn} temp={temp} weather={weather} onSummer={() => setManual(SUMMER_TEMP)} onLive={() => setLiveOn(true)} />
                <Slider id="n" icon="ac" label="Number of ACs" value={n} min={1000} max={200000} step={1000} shown={num(n)} onChange={setN} />
                <Slider id="bump" icon="sliders" label="AC setting raised by" value={bump} min={0} max={3} step={1} shown={bump === 0 ? 'no change' : `+${bump}°C`} onChange={setBump} />
              </section>

              <div className="visuals">
                <section className="card">
                  <h2 className="ico-title"><Icon name="zap" />Load on the grid at peak time</h2>
                  <div className="bar-row">
                    <div className="bar-name">Normal</div>
                    <div className="track"><div className="bar load" style={{ width: `${(normal / top) * 100}%` }} /></div>
                    <div className="bar-val">{mw(normal)}</div>
                  </div>
                  <div className="bar-row">
                    <div className="bar-name">After +{bump}°C</div>
                    <div className="track"><div className="bar good" style={{ width: `${(after / top) * 100}%` }} /></div>
                    <div className="bar-val">{mw(after)}</div>
                  </div>
                  <p className="takeaway">
                    {bump === 0 ? 'Setting not changed, so nothing is saved.' : <>Saved: <b>{mw(saved)}</b> ({Math.round(SAVING_PER_DEGREE * bump * 100)}% of the load)</>}
                  </p>
                  <Link className="jump" href="/calculation">How is this calculated? →</Link>
                </section>

                <section className="card" aria-labelledby="impact-card">
                  <h2 id="impact-card" className="ico-title"><Icon name="trendDown" />Impact of {bump === 0 ? 'no change' : `+${bump}°C`} · 2-hour peak</h2>
                  <div className="impact-tiles">
                    <div className="flow-box t3"><Icon name="ac" size={20} className="tile-ico" /><div className="flow-val">{imp.perAcW} W</div><div className="flow-lab">saved per AC</div></div>
                    <div className="flow-box t3"><Icon name="trendDown" size={20} className="tile-ico" /><div className="flow-val">{fmtMW(imp.savedMW)}</div><div className="flow-lab">off the peak</div></div>
                    <div className="flow-box t1"><Icon name="clock" size={20} className="tile-ico" /><div className="flow-val">{fmtMWh(imp.energyMWh)}</div><div className="flow-lab">moved off peak</div></div>
                    <div className="flow-box t4"><Icon name="battery" size={20} className="tile-ico" /><div className="flow-val">≈ {fmtCrore(imp.batteryCrore)}</div><div className="flow-lab">battery of that size</div></div>
                  </div>
                  <Link className="jump" href="/impact">See the full impact →</Link>
                </section>

                <section className="card">
                  <h2 className="ico-title"><Icon name="thermometer" />Same {num(n)} ACs on different days</h2>
                  <div className="cols" style={{ '--cols': days.length }}>
                    {days.map((d) => {
                      const v = peakLoadMW(d, n)
                      return (
                        <div key={d} className={`col${d === temp ? ' on' : ''}`}>
                          <div className="col-val">{mw(v)}</div>
                          <div className="col-track" role="img" aria-label={`${d} degrees: ${mw(v)}`}><div className="col-bar" style={{ height: `${(v / top) * 100}%` }} /></div>
                          <div className="col-name">{d}°C</div>
                        </div>
                      )
                    })}
                  </div>
                  <p className="takeaway">The hotter the day, the bigger the load.</p>
                </section>
              </div>
            </div>

            <PilotInfo />
          </>
        )}
        <footer className="foot">Estimates to explain the idea. Not real utility data and not an official Flock Energy publication.</footer>
      </main>
    </>
  )
}
