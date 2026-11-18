import { breakdown, SAVING_PER_DEGREE } from './model.js'

// Battery cost scale from news reports: Rajasthan discoms' standalone battery tenders, and JVVNL's own battery pilot tender.
export const BESS = { crore: 680, mw: 162, mwh: 648 }
export const JVVNL_BESS = { mw: 2, mwh: 4 }
export const HOURS = 2                                   // length of the peak event, as in the PDF
export const PER_MWH_CRORE = BESS.crore / BESS.mwh       // about ₹1.05 crore for each MWh of battery

const one = (x) => Math.round(x * 10) / 10

// The numbers that show the impact of the 1°C change, for any inputs.
export function impactNumbers(T, n, bump) {
  const b = breakdown(T, n, bump)
  const savedMW = one(b.saved)                           // 5.8 MW at 42°C, 1 lakh ACs, +1°C
  const energyMWh = one(savedMW * HOURS)                 // 11.6 MWh
  return {
    perAcW: Math.round(b.avg * SAVING_PER_DEGREE * bump * 1000),   // 72 W
    savedMW,
    energyMWh,
    batteryCrore: energyMWh * PER_MWH_CRORE,             // about ₹12 crore
    times: savedMW / JVVNL_BESS.mw,
  }
}

export const fmtMW = (x) => (x < 1 ? `${Math.round(x * 1000)} kW` : `${x.toFixed(x < 10 ? 1 : 0)} MW`)
export const fmtMWh = (x) => (x < 1 ? `${Math.round(x * 1000)} kWh` : `${x.toFixed(1)} MWh`)
export const fmtCrore = (x) => (x === 0 ? '₹0' : x < 1 ? `₹${Math.round(x * 100)} lakh` : `₹${x < 10 ? x.toFixed(1) : Math.round(x)} crore`)
