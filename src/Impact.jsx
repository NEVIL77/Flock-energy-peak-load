import Flow from './Flow.jsx'
import Icon from './Icon.jsx'
import { Link } from './router.jsx'
import Callout from './Callout.jsx'
import { breakdown } from './model.js'
import { BESS, JVVNL_BESS, PER_MWH_CRORE, impactNumbers } from './impact.js'

const lakhs = (x) => Number(x).toLocaleString('en-IN')
// Lines of "name = working ≈ result", with the columns lined up.
const table = (rows) => {
  const w = [0, 1].map((i) => Math.max(...rows.map((r) => r[i].length)))
  return rows.map((r) => `${r[0].padEnd(w[0])} = ${r[1].padEnd(w[1])} ${r[3] || '≈'} ${r[2]}`).join('\n')
}

export default function Impact() {
  const n = 100000
  const b = breakdown(42, n, 1)
  const imp = impactNumbers(42, n, 1)
  const perAcW = imp.perAcW                               // 72 W, same as the PDF
  const savedMW = imp.savedMW                             // 5.8 MW
  const energy = imp.energyMWh                            // 11.6 MWh
  const perMWh = PER_MWH_CRORE                            // about ₹1.05 crore per MWh
  const battery = Math.round(imp.batteryCrore)            // about ₹12 crore
  const times = Math.round(imp.times)
  const pilotKw = Math.round(breakdown(42, 2000, 1).saved * 1000)

  return (
    <>
      <Link className="back" href="/"><Icon name="arrowLeft" size={16} />Back to the calculator</Link>

      <section className="card sec" aria-labelledby="i1">
        <div className="sec-head"><span className="badge" aria-hidden="true">1</span><h2 id="i1"><Icon name="zap" size={24} />The Peak Problem</h2></div>
        <p className="example"><b>Example:</b> 1 lakh ACs · 42°C evening · 80% running at peak · 1.2 kW each</p>
        <Flow items={[
          { value: lakhs(n), label: 'ACs enrolled', icon: 'ac', tone: 't1' },
          { op: '× 80%', value: lakhs(b.running), label: 'ACs running', icon: 'zap', tone: 't2' },
          { op: '× 1.2 kW', value: `${Math.round(b.load)} MW`, label: 'load at peak', icon: 'trendUp', tone: 't4' },
        ]} />
        <pre className="code" aria-label="Working for the peak">{table([
          ['ACs running', '1,00,000 × 0.8', lakhs(b.running), '='],
          ['Load at peak', `${lakhs(b.running)} × 1.2 kW`, `${lakhs(b.running * 1.2)} kW (${Math.round(b.load)} MW)`, '='],
        ])}</pre>
        <Callout tone="warm">Peak power costs the discom the most, and transformers and lines run hot. The usual fix is costly equipment: a battery, extra transformer capacity or a peak power plant.</Callout>
      </section>

      <section className="card sec" aria-labelledby="i2">
        <div className="sec-head"><span className="badge" aria-hidden="true">2</span><h2 id="i2"><Icon name="wifi" size={24} />The 1°C IoT Fix</h2></div>
        <p className="example"><b>Example:</b> a small <mark className="hl">IoT device</mark> on each AC · setting <mark className="hl">24°C → 25°C</mark> · peak lasts 2 hours</p>
        <Flow items={[
          { value: '24°C', label: 'normal setting', icon: 'thermometer', tone: 't1' },
          { op: 'IoT raises by 1°C', value: '25°C', label: 'setting at peak', icon: 'wifi', tone: 't3' },
          { op: 'after 2 hours', value: '24°C', label: 'back to normal', icon: 'thermometer', tone: 't1' },
        ]} />
        <Callout tone="green">No new wires and no new substation. The Jaipur pilot fits these devices on about <b>2,000 home ACs</b>.</Callout>
      </section>

      <section className="card sec" aria-labelledby="i3">
        <div className="sec-head"><span className="badge" aria-hidden="true">3</span><h2 id="i3"><Icon name="trendDown" size={24} />The Result</h2></div>
        <p className="example"><b>Example:</b> 1 lakh ACs · +1°C · 2-hour peak · battery cost from Rajasthan discom tenders (₹{BESS.crore} crore for {BESS.mwh} MWh)</p>
        <Flow items={[
          { value: `${perAcW} W`, label: 'saved per AC', icon: 'ac', tone: 't3' },
          { op: '× 1 lakh × 80%', value: `${savedMW} MW`, label: 'off the peak', icon: 'trendDown', tone: 't3' },
          { op: '× 2 hr', value: `${energy} MWh`, label: 'moved out of peak', icon: 'clock', tone: 't1' },
          { op: `× ₹${perMWh.toFixed(2)} crore`, value: `≈ ₹${battery} crore`, label: 'battery of that size', icon: 'battery', tone: 't4' },
        ]} />
        <pre className="code" aria-label="Working for the result">{table([
          ['Peak power saved', `${perAcW} W × 1,00,000 × 0.8`, `${savedMW} MW`],
          ['Energy moved', `${savedMW} MW × 2 hr`, `${energy} MWh`],
          ['Battery tenders', `₹${BESS.crore} crore ÷ ${BESS.mwh} MWh`, `₹${perMWh.toFixed(2)} crore per MWh`],
          ['Battery of that size', `${energy} × ${perMWh.toFixed(2)}`, `₹${battery} crore`],
        ])}</pre>
        <Callout tone="green"><b>{savedMW} MW</b> from 1 lakh ACs is about <b>{times} times</b> the power ({savedMW} MW against {JVVNL_BESS.mw} MW) and the energy ({energy} MWh against {JVVNL_BESS.mwh} MWh) of the 20-battery pilot JVVNL has put out to tender.</Callout>
        <Callout tone="warm"><b>Before quoting:</b> ₹{battery} crore is a rough scale from tender headlines, not a quote. The cost of the IoT devices is not public. A battery works at any hour, but AC control only helps when ACs are on and homes stay enrolled. The Jaipur pilot has about 2,000 ACs, which gives about <b>{pilotKw} kW</b> by this calculation.</Callout>
        <p className="sources">
          Sources: <a href="https://solarquarter.com/2026/07/20/rajasthan-discoms-float-tenders-for-162-mw-648-mwh-standalone-bess-projects-worth-over-inr-680-crore/" target="_blank" rel="noopener noreferrer">Rajasthan battery tenders</a> ·{' '}
          <a href="https://solarquarter.com/2026/08/19/jvvnl-floats-tender-for-2-mw-4-mwh-distributed-bess-pilot-project-in-rajasthan/" target="_blank" rel="noopener noreferrer">JVVNL battery pilot tender</a> (SolarQuarter)
        </p>
      </section>

      <p className="foot">Estimates to explain the idea. Not real utility data and not an official Flock Energy publication.</p>
    </>
  )
}
