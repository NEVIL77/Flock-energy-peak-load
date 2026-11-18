const WHO = [
  { icon: 'building', who: 'JVVNL (the discom)', what: 'Lower peak load, about 1 MW expected, and less costly peak power to buy.' },
  { icon: 'home', who: 'Households', what: 'The devices are free. No bill credit has been announced.' },
  { icon: 'wifi', who: 'Flock Energy', what: 'A real utility pilot to show other discoms.' },
]

import Icon from './Icon.jsx'

export default function PilotInfo() {
  return (
    <section className="card pilot" aria-labelledby="pilot-h">
      <h2 id="pilot-h" className="ico-title"><Icon name="building" />The Jaipur pilot</h2>
      <p className="pilot-lead">
        JVVNL, the Jaipur discom, is testing this idea with Flock Energy. Free smart devices are fitted on about 2,000 home ACs. At peak time the AC setting goes up about 1°C for a short while.
      </p>
      <dl className="who">
        {WHO.map((w) => <div key={w.who}><dt><Icon name={w.icon} />{w.who}</dt><dd>{w.what}</dd></div>)}
      </dl>
      <p className="pilot-note">
        Not public yet: contract terms, pilot length and results. Based on news reports up to June 2026 (
        <a href="https://www.business-standard.com/industry/news/jaipur-discom-first-in-india-to-deploy-adr-for-household-peak-load-control-126062200689_1.html" target="_blank" rel="noopener noreferrer">Business Standard</a>,{' '}
        <a href="https://www.missionkiawaaz.com/jaipur-discoms-new-pilot-project-free-smart-iot-devices" target="_blank" rel="noopener noreferrer">Mission Ki Awaaz</a>).
      </p>
    </section>
  )
}
