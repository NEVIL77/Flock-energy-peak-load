import test from 'node:test'
import assert from 'node:assert/strict'
import { peakLoadMW, savedMW } from './model.js'

test('hotter outside means more load for the same ACs', () => {
  assert.ok(peakLoadMW(42, 100000) > peakLoadMW(30, 100000) * 3)
})
test('more ACs means more load', () => {
  assert.ok(peakLoadMW(40, 200000) > peakLoadMW(40, 100000))
})
test('+1°C saves 6% of the load', () => {
  const l = peakLoadMW(40, 100000)
  assert.ok(Math.abs(savedMW(40, 100000, 1) - l * 0.06) < 1e-9)
})
test('no change in setting saves nothing', () => {
  assert.equal(savedMW(40, 100000, 0), 0)
})
test('same +1°C saves more on a hot day', () => {
  assert.ok(savedMW(42, 100000, 1) > savedMW(30, 100000, 1))
})
test('2,000 ACs save far less than 1 MW', () => {
  assert.ok(savedMW(42, 2000, 1) < 0.2)
})

import { breakdown } from './model.js'
test('breakdown steps multiply to the final load', () => {
  const b = breakdown(42, 100000, 1)
  assert.ok(Math.abs(b.running * b.avg / 1000 - b.load) < 1e-9)
  assert.ok(Math.abs(b.after - (b.load - b.saved)) < 1e-9)
  assert.ok(Math.abs(b.pOne * b.duty - b.avg) < 1e-12)
})
test('42°C, 1 lakh ACs, +1°C gives the PDF numbers (72 W each, 5.8 MW saved)', () => {
  const b = breakdown(42, 100000, 1)
  assert.equal(b.pOne, 1.2)
  assert.equal(b.running, 80000)
  assert.equal(Math.round(b.avg * 0.06 * 1000), 72)
  assert.equal(b.load, 96)
  assert.equal(b.saved.toFixed(1), '5.8')
})

test('breakdown agrees with the main functions', () => {
  for (const [T, n, b] of [[42, 100000, 1], [30, 5000, 2], [18, 100000, 1], [46, 2000, 3]]) {
    const r = breakdown(T, n, b)
    assert.ok(Math.abs(r.loadMW - peakLoadMW(T, n)) < 1e-9)
    assert.ok(Math.abs(r.savedMW - savedMW(T, n, b)) < 1e-9)
    assert.ok(Math.abs(r.afterMW - (r.loadMW - r.savedMW)) < 1e-9)
  }
})
