// A chain of boxes joined by arrows, as in the PDF. `op` is what is done to reach that box, shown above it.
import Icon from './Icon.jsx'

export default function Flow({ items }) {
  return (
    <div className="flow">
      {items.map((it, i) => (
        <div key={it.label} style={{ display: 'contents' }}>
          {i > 0 && <div className="flow-arrow" aria-hidden="true">→</div>}
          <div className="flow-item">
            <div className="flow-op">{it.op || ' '}</div>
            <div className={`flow-box ${it.tone}`}>
              {it.icon && <Icon name={it.icon} size={20} className="tile-ico" />}
              <div className="flow-val">{it.value}</div>
              <div className="flow-lab">{it.label}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
