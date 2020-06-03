const { lerp, degreeLerp, radianLerp, quatSlerp } = require('../lib/lerp')

test('lerp should be 0.5', () => {
  expect(lerp(0, 1, 0.5)).toBe(0.5)
})

test('degreeLerp should be 90', () => {
  expect(degreeLerp(0, 180, 0.5)).toBe(90)
})

test('degreeLerp should be -22.5', () => {
  expect(degreeLerp(-360, -45, 0.5)).toBe(-22.5)
})

test('degreeLerp should be 230', () => {
  expect(degreeLerp(540, 270, 0.5)).toBe(225)
})

test('radianLerp should be Math.PI * 0.75', () => {
  expect(radianLerp(Math.PI * 0.5, Math.PI * 1, 0.5)).toBe(Math.PI * 0.75)
})

test('radianLerp should be ~-Math.PI / 16', () => {
  const rad = radianLerp(-2 * Math.PI, -Math.PI / 8, 0.5).toFixed(4)
  const res = (-Math.PI / 16).toFixed(4)
  expect(rad).toBe(res)
})

test('radianLerp should be ~-Math.PI / 16', () => {
  const rad = radianLerp(3 * Math.PI, (Math.PI * 3) / 2, 0.5).toFixed(4)
  const res = ((Math.PI / 4) * 5).toFixed(4)
  expect(rad).toBe(res)
})

test('quatSlerp 1', () => {
  const qa = { x: 0, y: 0, z: 0, w: 0.5 }
  const qb = { x: 0, y: 1, z: 0, w: 0.5 }
  const q = quatSlerp(qa, qb, 0.5)
  expect(q.w).toBe(0.6324555320336758)
})

test('quatSlerp 2', () => {
  const qa = { x: 1, y: 1, z: 1, w: 1 }
  const qb = { x: 0.5, y: 0.5, z: 0.5, w: 0.5 }
  const q = quatSlerp(qa, qb, 0.5)
  expect(q.w).toBe(1)
})

test('quatSlerp 3', () => {
  const qa = { x: 0, y: 0.99999999, z: 0, w: 0 }
  const qb = { x: 0, y: 1, z: 0, w: 0 }
  const q = quatSlerp(qa, qb, 0.5)
  expect(q.y).toBe(0.999999995)
})
