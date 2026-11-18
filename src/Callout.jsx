import Icon from './Icon.jsx'

// A note box as in the PDF: warm (orange) for cautions, green for good news. The icon follows the tone.
export default function Callout({ tone = 'warm', icon, children }) {
  const name = icon || (tone === 'green' ? 'check' : 'alert')
  return (
    <p className={`callout ${tone === 'green' ? 'green' : ''}`}>
      <Icon name={name} size={20} className="callout-ico" />
      <span>{children}</span>
    </p>
  )
}
