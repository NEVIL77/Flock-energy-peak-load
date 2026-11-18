// Simple model: load of the whole fleet at the evening peak.
// One running AC draws more power when it is hotter outside, and more ACs run at the same time.

export const clamp = (x, a, b) => Math.min(b, Math.max(a, x))

// Anchored to the PDF example: a 1.5 ton AC uses 1.2 kW (5.25 kW cooling ÷ EER 4.4), 80% of ACs run at peak on a 42°C day,
// and +1°C on the AC setting saves 6%. Other temperatures are scaled from there.
export const REF_TEMP = 42              // °C, the PDF's peak day
export const POWER_AT_REF = 1.2         // kW, one running AC at 42°C
export const EXTRA_PER_DEGREE = 0.03    // 3% more power for each +1°C outside
export const SAVING_PER_DEGREE = 0.06   // 6% less power for each +1°C on the AC setting

// How much of its time the compressor is on (cool day: cycles off, hot day: always on)
export const DUTY = { base: 0.6, slope: 0.035, min: 0.3, max: 1 }
// Share of ACs switched on at the same moment
export const SHARE = { atRef: 0.8, slope: 0.0333, min: 0.05, max: 0.95 }

const duty = (T) => clamp(DUTY.base + DUTY.slope * (T - 30), DUTY.min, DUTY.max)
const share = (T) => clamp(SHARE.atRef + SHARE.slope * (T - REF_TEMP), SHARE.min, SHARE.max)

export function peakLoadMW(T, n) {
  const kwPerAC = POWER_AT_REF * (1 + EXTRA_PER_DEGREE * (T - REF_TEMP)) * duty(T)
  return (n * share(T) * kwPerAC) / 1000
}

export function savedMW(T, n, bump) {
  return peakLoadMW(T, n) * SAVING_PER_DEGREE * bump
}

// Every intermediate number, so the calculation page can show the working.
export function breakdown(T, n, bump) {
  const powerKw = POWER_AT_REF * (1 + EXTRA_PER_DEGREE * (T - REF_TEMP))
  const dutyRaw = DUTY.base + DUTY.slope * (T - 30)
  const dutyUsed = clamp(dutyRaw, DUTY.min, DUTY.max)
  const avgKw = powerKw * dutyUsed
  const shareRaw = SHARE.atRef + SHARE.slope * (T - REF_TEMP)
  const shareUsed = clamp(shareRaw, SHARE.min, SHARE.max)
  const acsOn = n * shareUsed
  const loadMW = (acsOn * avgKw) / 1000
  const savedMWh = loadMW * SAVING_PER_DEGREE * bump
  const afterMWh = loadMW - savedMWh
  return {
    powerKw, dutyRaw, dutyUsed, avgKw, shareRaw, shareUsed, acsOn, loadMW, savedMW: savedMWh, afterMW: afterMWh,
    // short names, used by the tests
    pOne: powerKw, duty: dutyUsed, avg: avgKw, running: acsOn, load: loadMW, saved: savedMWh, after: afterMWh,
  }
}
