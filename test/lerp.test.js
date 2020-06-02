const { lerp, lerpDegrees, lerpRadians } = require('../lib/lerp')

test('lerp should be 0.5', () => {
  expect(lerp(0, 1, 0.5)).toBe(0.5)
})

test('lerpDegrees should be 90', () => {
  expect(lerpDegrees(0, 180, 0.5)).toBe(90)
})

test('lerpDegrees should be -22.5', () => {
  expect(lerpDegrees(-360, -45, 0.5)).toBe(-22.5)
})

test('lerpDegrees should be 230', () => {
  expect(lerpDegrees(540, 270, 0.5)).toBe(225)
})

test('lerpRadians should be Math.PI * 0.75', () => {
  expect(lerpRadians(Math.PI * 0.5, Math.PI * 1, 0.5)).toBe(Math.PI * 0.75)
})

test('lerpRadians should be ~-Math.PI / 16', () => {
  const rad = lerpRadians(-2 * Math.PI, -Math.PI / 8, 0.5).toFixed(4)
  const res = (-Math.PI / 16).toFixed(4)
  expect(rad).toBe(res)
})
test('lerpRadians should be ~-Math.PI / 16', () => {
  const rad = lerpRadians(3 * Math.PI, (Math.PI * 3) / 2, 0.5).toFixed(4)
  const res = ((Math.PI / 4) * 5).toFixed(4)
  expect(rad).toBe(res)
})
