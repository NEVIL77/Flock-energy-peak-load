import Flow from './Flow.jsx'
import Icon from './Icon.jsx'
import { Link } from './router.jsx'
import Callout from './Callout.jsx'

// Figures and wording follow "Electricity Basics for Air Conditioners", pages 7 and 8.

const AXIS_MIN = 20, AXIS_MAX = 45
const at = (t) => `${((t - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100}%`
const span = (a, b) => `${((b - a) / (AXIS_MAX - AXIS_MIN)) * 100}%`

function GapRow({ name, inside, outside, tone, caption }) {
  const gap = outside - inside
  const mid = (inside + outside) / 2
  return (
    <div className="gv-row">
      <div className="gv-name">{name}</div>
      <div className="gv-plot">
        <span className="gv-lab in" style={{ left: at(inside) }}>{inside}°C inside</span>
        <span className="gv-lab out" style={{ left: at(outside) }}>{outside}°C outside</span>
        <div className="gv-line" />
        <div className={`gv-gap ${tone}`} style={{ left: at(inside), width: span(inside, outside) }} />
        <i className="gv-dot in" style={{ left: at(inside) }} />
        <i className="gv-dot out" style={{ left: at(outside) }} />
        <div className={`gv-cap ${tone}`} style={{ left: at(mid) }}>gap = {gap}°C → {caption}</div>
      </div>
    </div>
  )
}

export default function Calculation() {
  return (
    <>
      <Link className="back" href="/"><Icon name="arrowLeft" size={16} />Back to the calculator</Link>

      <section className="card sec" aria-labelledby="s1">
        <div className="sec-head"><span className="badge" aria-hidden="true">1</span><h2 id="s1"><Icon name="thermometer" size={24} />The 1°C Calculation (one AC)</h2></div>
        <p className="example"><b>Example:</b> 1.5 ton AC · 42°C outside · setting 24°C → 25°C · peak lasts 2 hours</p>

        <h3>A. Why 1°C saves about 6%</h3>
        <div className="gapviz">
          <GapRow name="Normal" inside={24} outside={42} tone="warm" caption="AC works harder" />
          <GapRow name="+1°C" inside={25} outside={42} tone="green" caption="less work" />
          <div className="gv-axis" aria-hidden="true">
            {[20, 25, 30, 35, 40, 45].map((t) => <span key={t} style={{ left: at(t) }}>{t}°C</span>)}
          </div>
        </div>
        <p>The gap shrinks by 1 out of 18 ≈ 5.6%, so the AC does less work. BEE rule of thumb: <b>about 6% saving per 1°C</b> (real tests show 3–6%).</p>

        <h3>B. From AC size to money saved</h3>
        <Flow items={[
          { op: '1.5 ton × 3.5', value: '5.25 kW', label: 'cooling', icon: 'ac', tone: 't1' },
          { op: '÷ EER 4.4', value: '1.2 kW', label: 'electricity used', icon: 'zap', tone: 't2' },
          { op: '× 6%', value: '72 W', label: 'power saved', icon: 'trendDown', tone: 't3' },
          { op: '× 2 hr', value: '0.14 units', label: 'saved per day', icon: 'clock', tone: 't3' },
          { op: '× ₹7', value: '≈ ₹1/day', label: '~₹30/month', icon: 'rupee', tone: 't4' },
        ]} />
        <pre className="code" aria-label="Working for one AC">{`Cooling      = 1.5 ton × 3.5 kW    = 5.25 kW
Power        = 5.25 kW ÷ EER 4.4   ≈ 1.2 kW
Power saved  = 1.2 kW × 6%         ≈ 0.072 kW (72 W)
Energy saved = 0.072 kW × 2 hr     ≈ 0.14 units/day
Money saved  = 0.14 × ₹7           ≈ ₹1/day (~₹30/month)`}</pre>
        <Callout tone="warm" icon="info">Small for one home. The big value is for the discom, when thousands of homes do it together (see below).</Callout>
      </section>

      <section className="card sec" aria-labelledby="s2">
        <div className="sec-head"><span className="badge" aria-hidden="true">2</span><h2 id="s2"><Icon name="building" size={24} />The City Scale</h2></div>
        <p className="example">1 lakh ACs enrolled · 80% running at peak · peak power costs the discom ₹10/unit (assumed)</p>
        <Flow items={[
          { value: '72 W', label: 'saved per AC', icon: 'ac', tone: 't3' },
          { op: '× 1 lakh × 80%', value: '5.8 MW', label: 'saved at peak', icon: 'trendDown', tone: 't3' },
          { op: '× 2 hr', value: '11,600', label: 'units per day', icon: 'clock', tone: 't1' },
          { op: '× ₹10', value: '₹1.16 lakh', label: 'per day', icon: 'rupee', tone: 't4' },
          { op: '× 90 days', value: '≈ ₹1 crore', label: 'per summer', icon: 'sun', tone: 't4' },
        ]} />
        <pre className="code" aria-label="Working for the city">{`Peak power saved = 72 W × 1,00,000 × 0.8   ≈ 5.8 MW
Energy saved     = 5.8 MW × 2 hr           ≈ 11,600 units/day
Discom saving    = 11,600 × ₹10            ≈ ₹1.16 lakh/day
Summer (90 days) = ₹1.16 lakh × 90         ≈ ₹1 crore`}</pre>
        <Callout tone="green"><b>5.8 MW</b> is like a small power plant the discom does not need to run at peak.</Callout>
        <Callout tone="warm"><b>Rebound:</b> after the peak, ACs work extra to cool rooms back down, so some units come back later. That is fine: the goal is to <b>move load out of the peak</b>.</Callout>
      </section>

      <p className="foot">
        The calculator uses these same numbers at 42°C (1 lakh ACs, +1°C gives 5.8 MW). For other temperatures it scales them: hotter means more power per AC and more ACs on.
      </p>
    </>
  )
}
