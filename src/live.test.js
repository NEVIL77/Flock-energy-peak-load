import test from 'node:test'
import assert from 'node:assert/strict'
import { parseWeather } from './live.js'

const hours = (d) => Array.from({ length: 24 }, (_, h) => `${d}T${String(h).padStart(2, '0')}:00`)
const sample = (nowTime, now) => ({
  current: { time: nowTime, temperature_2m: now },
  hourly: {
    time: [...hours('2026-06-10'), ...hours('2026-06-11')],
    temperature_2m: [...Array(24).fill(30).map((v, h) => (h === 19 ? 38 : v)), ...Array(24).fill(29).map((v, h) => (h === 19 ? 36 : v))],
  },
})

test('before 7 PM it picks today 7 PM', () => {
  const r = parseWeather(sample('2026-06-10T14:30', 41.6))
  assert.equal(r.now, 42)
  assert.deepEqual(r.evening, { temp: 38, day: 'today' })
  assert.equal(r.updated, '14:30')
})
test('after 7 PM it picks tomorrow 7 PM', () => {
  const r = parseWeather(sample('2026-06-10T21:00', 34))
  assert.deepEqual(r.evening, { temp: 36, day: 'tomorrow' })
})
