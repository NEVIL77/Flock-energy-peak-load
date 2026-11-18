import test from 'node:test'
import assert from 'node:assert/strict'
import { impactNumbers, fmtMW, fmtMWh, fmtCrore } from './impact.js'

test('42°C, 1 lakh ACs, +1°C gives the PDF numbers and about ₹12 crore of battery', () => {
  const r = impactNumbers(42, 100000, 1)
  assert.equal(r.perAcW, 72)
  assert.equal(r.savedMW, 5.8)
  assert.equal(r.energyMWh, 11.6)
  assert.equal(Math.round(r.batteryCrore), 12)
  assert.equal(Math.round(r.times), 3)
})
test('no setting change means no impact', () => {
  const r = impactNumbers(42, 100000, 0)
  assert.equal(r.savedMW, 0)
  assert.equal(r.batteryCrore, 0)
})
test('hotter day has a bigger impact for the same ACs', () => {
  assert.ok(impactNumbers(46, 100000, 1).savedMW > impactNumbers(32, 100000, 1).savedMW)
})
test('numbers are shown in sensible units', () => {
  assert.equal(fmtMW(5.8), '5.8 MW')
  assert.equal(fmtMW(0.115), '115 kW')
  assert.equal(fmtMWh(11.6), '11.6 MWh')
  assert.equal(fmtMWh(0.2), '200 kWh')
  assert.equal(fmtCrore(12.2), '₹12 crore')
  assert.equal(fmtCrore(0.21), '₹21 lakh')
  assert.equal(fmtCrore(0), '₹0')
})
